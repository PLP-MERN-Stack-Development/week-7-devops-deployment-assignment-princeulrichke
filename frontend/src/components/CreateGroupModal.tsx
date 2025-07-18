'use client';

import { useState } from 'react';
import { X, Hash, Lock } from 'lucide-react';

interface CreateGroupModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; isPrivate?: boolean }) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isPrivate: formData.isPrivate
      });
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Group</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Group Name */}
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              id="groupName"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              maxLength={50}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this group about?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/200 characters
            </p>
          </div>

          {/* Privacy Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Privacy
            </label>
            <div className="space-y-3">
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  checked={!formData.isPrivate}
                  onChange={() => setFormData({ ...formData, isPrivate: false })}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium text-gray-900">Public</span>
                  </div>
                  <p className="text-xs text-gray-500">Anyone can join this group</p>
                </div>
              </label>

              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  checked={formData.isPrivate}
                  onChange={() => setFormData({ ...formData, isPrivate: true })}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium text-gray-900">Private</span>
                  </div>
                  <p className="text-xs text-gray-500">Only invited members can join</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
