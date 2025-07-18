'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Group } from '@/types';
import { api } from '@/utils/api';
import { formatDistanceToNow } from 'date-fns';
import { 
  Users, 
  Plus, 
  LogOut, 
  Settings, 
  Search,
  Hash,
  Lock,
  Wifi,
  WifiOff,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreateGroupModal from './CreateGroupModal';
import DiscoverGroups from './DiscoverGroups';

interface SidebarProps {
  groups: Group[];
  activeGroup: Group | null;
  onGroupSelect: (group: Group) => void;
  onGroupCreated: (group: Group) => void;
  onGroupDeleted: (groupId: string) => void;
  isConnected: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  groups,
  activeGroup,
  onGroupSelect,
  onGroupCreated,
  onGroupDeleted,
  isConnected
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = async (groupData: { name: string; description?: string; isPrivate?: boolean }) => {
    try {
      const response = await api.createGroup(groupData);
      onGroupCreated(response.group);
      setShowCreateModal(false);
      toast.success('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteGroup(groupId);
      onGroupDeleted(groupId);
      toast.success('Group deleted successfully');
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to leave this group?')) {
      return;
    }

    try {
      await api.leaveGroup(groupId);
      onGroupDeleted(groupId);
      toast.success('Left group successfully');
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  return (
    <div className="bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Chat App</h1>
          <div className="flex items-center space-x-2">
            {/* Connection status */}
            <div className={`p-1 rounded-full ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            
            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user?.username}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Groups list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-sm font-medium text-gray-900 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Groups ({filteredGroups.length})
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setShowDiscoverModal(true)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Discover groups"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Create new group"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {filteredGroups.map((group) => (
              <div
                key={group._id}
                onClick={() => onGroupSelect(group)}
                className={`
                  relative p-3 rounded-lg cursor-pointer transition-colors group
                  ${activeGroup?._id === group._id 
                    ? 'bg-primary-50 border-primary-200 border' 
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      {group.isPrivate ? (
                        <Lock className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                      ) : (
                        <Hash className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                      )}
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {group.name}
                      </h3>
                    </div>
                    {group.description && (
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-gray-400">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{group.members.length} members</span>
                      <span className="mx-1">•</span>
                      <span>
                        {formatDistanceToNow(new Date(group.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Group actions menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle group menu
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Online members indicator */}
                <div className="flex -space-x-1 mt-2">
                  {group.members.slice(0, 3).map((member) => (
                    <div
                      key={member.id}
                      className={`
                        w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium
                        ${member.isOnline ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}
                      `}
                      title={`${member.username} (${member.isOnline ? 'online' : 'offline'})`}
                    >
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredGroups.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'No groups found' : 'No groups yet'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Create your first group
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create group modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGroup}
        />
      )}

      {/* Discover groups modal */}
      {showDiscoverModal && (
        <DiscoverGroups
          onClose={() => setShowDiscoverModal(false)}
          onGroupJoined={(group) => {
            onGroupCreated(group); // Reuse the same callback to add the group to the list
            setShowDiscoverModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Sidebar;
