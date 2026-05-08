import { motion } from 'motion/react';
import { Search, UserCircle } from 'lucide-react';
import type { UserProfile } from '../types';
import { publicAsset } from '../lib/assets';
import { resolveMediaUrl } from '../lib/api';

interface TopBarProps {
  onOpenSearch: () => void;
  user: UserProfile | null;
  onOpenProfile: () => void;
}

export default function TopBar({ onOpenSearch, user, onOpenProfile }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-gray-100">
      <div className="flex justify-between items-center w-full px-6 h-16 max-w-5xl mx-auto">
        <motion.div 
          initial={{ rotate: -15 }}
          animate={{ rotate: 0 }}
          className="w-10 h-10 rounded-xl bg-heritage-red/10 flex items-center justify-center p-1.5 shadow-sm"
        >
          <img src={publicAsset('/bridge-icon.svg')} alt="Maple Bridge icon" className="h-full w-full" />
        </motion.div>
        
        <h1 className="font-sans font-bold tracking-[0.25em] text-[10px] text-heritage-ink uppercase pl-4">MAPLE BRIDGE ECHOES</h1>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSearch}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100"
            aria-label="Open search"
          >
            <Search className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenProfile}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 text-heritage-olive shadow-sm"
            aria-label={user ? 'Open profile' : 'Log in or register'}
            title={user ? user.displayName : 'Log in'}
          >
            {user?.avatarUrl ? (
              <img
                src={resolveMediaUrl(user.avatarUrl)}
                alt={`${user.displayName} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircle className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
