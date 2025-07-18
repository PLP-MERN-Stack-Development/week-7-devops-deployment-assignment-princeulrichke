'use client';

import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import { Group, Message } from '@/types';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Users,
  Hash,
  Lock
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  group: Group;
  messages: Message[];
  loading: boolean;
  typingUsers: string[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  group,
  messages,
  loading,
  typingUsers
}) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { user } = useAuth();
  const { sendMessage, startTyping, stopTyping } = useSocket();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicators
  useEffect(() => {
    if (isTyping) {
      startTyping(group._id);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        stopTyping(group._id);
      }, 3000);
    } else {
      stopTyping(group._id);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, group._id, startTyping, stopTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    const content = messageText.trim();
    if (!content) return;

    sendMessage(group._id, content);
    setMessageText('');
    setIsTyping(false);
    
    // Focus back to input
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    if (e.target.value.trim() && !isTyping) {
      setIsTyping(true);
    } else if (!e.target.value.trim() && isTyping) {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const groupMessagesByDate = () => {
    const grouped: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });
    
    return grouped;
  };

  const renderDateSeparator = (date: string) => {
    const messageDate = new Date(date);
    let label = '';
    
    if (isToday(messageDate)) {
      label = 'Today';
    } else if (isYesterday(messageDate)) {
      label = 'Yesterday';
    } else {
      label = format(messageDate, 'MMMM d, yyyy');
    }
    
    return (
      <div className="flex items-center justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
          {label}
        </div>
      </div>
    );
  };

  const onlineMembers = group.members.filter(member => member.isOnline);
  const groupedMessages = groupMessagesByDate();

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {group.isPrivate ? (
                <Lock className="w-5 h-5 text-gray-400" />
              ) : (
                <Hash className="w-5 h-5 text-gray-400" />
              )}
              <h1 className="text-lg font-semibold text-gray-900">{group.name}</h1>
            </div>
            <div className="text-sm text-gray-500">
              {group.members.length} members
              {onlineMembers.length > 0 && (
                <span className="ml-1">• {onlineMembers.length} online</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGroupInfo(!showGroupInfo)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Group info"
            >
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {group.description && (
          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 w-full overflow-y-auto px-6 py-4 space-y-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#f9fafb'
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date}>
                {renderDateSeparator(date)}
                <div className="space-y-4">
                  {dayMessages.map((message, index) => {
                    const prevMessage = dayMessages[index - 1];
                    const showAvatar = !prevMessage || prevMessage.sender.id !== message.sender.id;
                    const isOwn = message.sender.id === user?.id;
                    
                    return (
                      <MessageBubble
                        key={message._id}
                        message={message}
                        showAvatar={showAvatar}
                        isOwn={isOwn}
                        timestamp={formatMessageDate(new Date(message.createdAt))}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Hash className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Welcome to #{group.name}
                </h3>
                <p className="text-gray-500 max-w-sm">
                  This is the beginning of the #{group.name} group. Start the conversation!
                </p>
              </div>
            )}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator users={typingUsers} />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${group.name}`}
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none max-h-32 bg-white shadow-sm"
              style={{ minHeight: '48px' }}
            />
            
            {/* Input actions */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!messageText.trim()}
            className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Group info sidebar */}
      {showGroupInfo && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Group Info</h2>
              <button
                onClick={() => setShowGroupInfo(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Group details */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{group.name}</h3>
                {group.description && (
                  <p className="text-sm text-gray-600">{group.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Created {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
                </p>
              </div>

              {/* Members */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Members ({group.members.length})
                </h3>
                <div className="space-y-2">
                  {group.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${member.isOnline ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}
                      `}>
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {member.username}
                          {member.id === group.admin.id && (
                            <span className="ml-1 text-xs text-primary-600">(Admin)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.isOnline ? 'Online' : 
                            member.lastSeen ? 
                              `Last seen ${formatDistanceToNow(new Date(member.lastSeen), { addSuffix: true })}` : 
                              'Offline'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
