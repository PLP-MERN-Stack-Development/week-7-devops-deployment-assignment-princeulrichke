'use client';

import { Group } from '@/types';
import { Menu, Hash, Lock, Wifi, WifiOff } from 'lucide-react';

interface MobileMenuProps {
  activeGroup: Group | null;
  onMenuClick: () => void;
  isConnected: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  activeGroup,
  onMenuClick,
  isConnected
}) => {
  return (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex items-center space-x-2 flex-1 justify-center">
        {activeGroup ? (
          <>
            {activeGroup.isPrivate ? (
              <Lock className="w-4 h-4 text-gray-400" />
            ) : (
              <Hash className="w-4 h-4 text-gray-400" />
            )}
            <h1 className="font-semibold text-gray-900 truncate">
              {activeGroup.name}
            </h1>
          </>
        ) : (
          <h1 className="font-semibold text-gray-900">Chat App</h1>
        )}
      </div>

      <div className={`p-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
        {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      </div>
    </div>
  );
};

export default MobileMenu;
