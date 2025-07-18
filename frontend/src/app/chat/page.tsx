'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import { Group, Message } from '@/types';
import { api } from '@/utils/api';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import MobileMenu from '@/components/MobileMenu';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user } = useAuth();
  const { socket, isConnected, joinGroup, leaveGroup, on, off } = useSocket();

  // Load user groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await api.getGroups();
        setGroups(response.groups || []);
      } catch (error) {
        console.error('Error loading groups:', error);
        toast.error('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadGroups();
    }
  }, [user]);

  // Load messages when active group changes
  useEffect(() => {
    if (!activeGroup) return;

    let isSubscribed = true; // Prevent state updates if component unmounted

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await api.getMessages(activeGroup._id);
        
        if (isSubscribed) {
          setMessages(response.messages || []);
          
          // Join the group socket room
          joinGroup(activeGroup._id);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        if (isSubscribed) {
          toast.error('Failed to load messages');
        }
      } finally {
        if (isSubscribed) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    // Leave previous group room when switching
    return () => {
      isSubscribed = false;
      if (activeGroup) {
        leaveGroup(activeGroup._id);
      }
    };
  }, [activeGroup?._id, joinGroup, leaveGroup]); // Use activeGroup._id instead of activeGroup object

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle new messages
    const handleNewMessage = (data: { message: Message }) => {
      if (activeGroup && data.message.group === activeGroup._id) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    // Handle message edits
    const handleMessageEdited = (data: { message: Message }) => {
      if (activeGroup && data.message.group === activeGroup._id) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.message._id ? data.message : msg
          )
        );
      }
    };

    // Handle message deletions
    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    };

    // Handle typing indicators
    const handleUserTyping = (data: { userId: string; groupId: string }) => {
      if (activeGroup && data.groupId === activeGroup._id && data.userId !== user?.id) {
        setTypingUsers(prev => Array.from(new Set([...prev, data.userId])));
      }
    };

    const handleUserStopTyping = (data: { userId: string; groupId: string }) => {
      if (activeGroup && data.groupId === activeGroup._id) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    };

    // Handle user status changes
    const handleUserOnline = (data: { userId: string; username: string }) => {
      // Update user status in groups if needed
      setGroups(prev => 
        prev.map(group => ({
          ...group,
          members: group.members.map(member => 
            member.id === data.userId 
              ? { ...member, isOnline: true }
              : member
          )
        }))
      );
    };

    const handleUserOffline = (data: { userId: string; username: string }) => {
      // Update user status in groups if needed
      setGroups(prev => 
        prev.map(group => ({
          ...group,
          members: group.members.map(member => 
            member.id === data.userId 
              ? { ...member, isOnline: false, lastSeen: new Date() }
              : member
          )
        }))
      );
    };

    // Register event listeners
    on('new_message', handleNewMessage);
    on('message_edited', handleMessageEdited);
    on('message_deleted', handleMessageDeleted);
    on('user_typing', handleUserTyping);
    on('user_stop_typing', handleUserStopTyping);
    on('user_online', handleUserOnline);
    on('user_offline', handleUserOffline);

    // Cleanup
    return () => {
      off('new_message', handleNewMessage);
      off('message_edited', handleMessageEdited);
      off('message_deleted', handleMessageDeleted);
      off('user_typing', handleUserTyping);
      off('user_stop_typing', handleUserStopTyping);
      off('user_online', handleUserOnline);
      off('user_offline', handleUserOffline);
    };
  }, [socket, isConnected, activeGroup, user, on, off]);

  const handleGroupSelect = (group: Group) => {
    setActiveGroup(group);
    setIsMobileMenuOpen(false);
    setTypingUsers([]);
  };

  const handleGroupCreated = (newGroup: Group) => {
    setGroups(prev => [newGroup, ...prev]);
    setActiveGroup(newGroup);
  };

  const handleGroupDeleted = (groupId: string) => {
    setGroups(prev => prev.filter(g => g._id !== groupId));
    if (activeGroup?._id === groupId) {
      setActiveGroup(null);
      setMessages([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex bg-gray-50">
        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-30 w-80 transform 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
        `}>
          <Sidebar
            groups={groups}
            activeGroup={activeGroup}
            onGroupSelect={handleGroupSelect}
            onGroupCreated={handleGroupCreated}
            onGroupDeleted={handleGroupDeleted}
            isConnected={isConnected}
          />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile header */}
          <MobileMenu
            activeGroup={activeGroup}
            onMenuClick={() => setIsMobileMenuOpen(true)}
            isConnected={isConnected}
          />

          {/* Chat window */}
          {activeGroup ? (
            <ChatWindow
              group={activeGroup}
              messages={messages}
              loading={loadingMessages}
              typingUsers={typingUsers}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.444l-3.097 1.03 1.03-3.097A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No group selected</h3>
                <p className="text-gray-500">Choose a group from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
