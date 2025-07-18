'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Lock, Globe, UserPlus } from 'lucide-react';
import { Group } from '@/types';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';

interface DiscoverGroupsProps {
  onClose: () => void;
  onGroupJoined: (group: Group) => void;
}

const DiscoverGroups: React.FC<DiscoverGroupsProps> = ({ onClose, onGroupJoined }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [joiningGroups, setJoiningGroups] = useState<Set<string>>(new Set());

  const loadGroups = async (searchTerm: string = '', pageNum: number = 1, reset: boolean = true) => {
    try {
      setLoading(true);
      const response = await api.discoverGroups(searchTerm, pageNum, 20);
      
      if (reset) {
        setGroups(response.groups);
      } else {
        setGroups(prev => [...prev, ...response.groups]);
      }
      
      setHasMore(pageNum < response.pagination.pages);
    } catch (error) {
      console.error('Error discovering groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadGroups(search, 1, true);
  };

  const handleJoinGroup = async (groupId: string) => {
    if (joiningGroups.has(groupId)) return;

    try {
      setJoiningGroups(prev => {
        const newSet = new Set(prev);
        newSet.add(groupId);
        return newSet;
      });
      await api.joinGroup(groupId);
      
      // Remove the group from the discover list since user has joined
      const joinedGroup = groups.find(g => g._id === groupId);
      if (joinedGroup) {
        onGroupJoined(joinedGroup);
        setGroups(prev => prev.filter(g => g._id !== groupId));
        toast.success(`Joined "${joinedGroup.name}" successfully!`);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
    } finally {
      setJoiningGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const loadMoreGroups = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadGroups(search, nextPage, false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Discover Groups</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups by name or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Search
            </button>
          </form>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && groups.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No groups found</p>
              <p className="text-sm mt-1">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div
                  key={group._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{group.name}</h3>
                        {group.isPrivate ? (
                          <Lock className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Globe className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      
                      {group.description && (
                        <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{group.members?.length || 0} members</span>
                        </div>
                        <div>
                          <span>Admin: {group.admin?.username}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleJoinGroup(group._id)}
                      disabled={joiningGroups.has(group._id)}
                      className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                      {joiningGroups.has(group._id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      <span>{joiningGroups.has(group._id) ? 'Joining...' : 'Join'}</span>
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={loadMoreGroups}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverGroups;
