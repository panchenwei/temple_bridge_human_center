import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { publicAsset } from '../lib/assets';

interface TopBarProps {
  onOpenSearch: () => void;
}

export default function TopBar({ onOpenSearch }: TopBarProps) {
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
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSearch}
          className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100"
          aria-label="Open search"
        >
          <Search className="w-4 h-4" />
        </motion.button>
      </div>
    </header>
  );
}
