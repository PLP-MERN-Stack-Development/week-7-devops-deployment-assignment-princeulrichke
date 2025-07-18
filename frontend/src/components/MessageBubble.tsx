'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types';
import { MoreHorizontal, Edit2, Trash2, Copy } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
  isOwn: boolean;
  timestamp: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar,
  isOwn,
  timestamp
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const { user } = useAuth();
  const { editMessage, deleteMessage } = useSocket();

  const handleEdit = () => {
    if (editText.trim() && editText !== message.content) {
      editMessage(message._id, editText.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this message?')) {
      deleteMessage(message._id);
    }
    setShowMenu(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowMenu(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(message.content);
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium mr-3 flex-shrink-0">
            {message.sender.username.charAt(0).toUpperCase()}
          </div>
        )}
        {!showAvatar && !isOwn && <div className="w-8 mr-3" />}

        {/* Message bubble */}
        <div className="relative">
          {/* Username (for other users) */}
          {showAvatar && !isOwn && (
            <p className="text-xs text-gray-600 mb-1 ml-1">
              {message.sender.username}
            </p>
          )}

          {/* Message content */}
          <div
            className={`
              relative px-4 py-2 rounded-2xl max-w-full break-words shadow-sm
              ${isOwn
                ? 'bg-green-500 text-white rounded-br-md' // WhatsApp green for sent messages
                : 'bg-white text-gray-900 rounded-bl-md border border-gray-200' // White for received messages
              }
              ${isEditing ? 'p-2' : ''}
            `}
          >
            {isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleEdit}
                className="w-full bg-transparent border border-gray-300 rounded px-2 py-1 text-sm resize-none focus:outline-none focus:border-primary-500"
                rows={Math.min(5, editText.split('\n').length)}
                autoFocus
              />
            ) : (
              <div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.isEdited && (
                  <p className={`text-xs mt-1 italic ${isOwn ? 'text-green-100' : 'text-gray-500'}`}>
                    (edited)
                  </p>
                )}
              </div>
            )}

            {/* Message actions menu */}
            {!isEditing && (
              <div className={`
                absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity
                ${isOwn ? '-left-10' : '-right-10'}
              `}>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>

                  {showMenu && (
                    <div className={`
                      absolute top-0 mt-6 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10
                      ${isOwn ? 'right-0' : 'left-0'}
                    `}>
                      <div className="py-1">
                        <button
                          onClick={handleCopy}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Copy className="w-3 h-3 mr-2" />
                          Copy
                        </button>
                        
                        {isOwn && (
                          <>
                            <button
                              onClick={() => {
                                setIsEditing(true);
                                setShowMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Edit2 className="w-3 h-3 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={handleDelete}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="w-3 h-3 mr-2" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <p className={`
            text-xs mt-1 px-1
            ${isOwn ? 'text-right text-green-100' : 'text-left text-gray-500'}
          `}>
            {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
