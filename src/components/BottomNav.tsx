import { motion } from 'motion/react';
import { BookOpen, Compass, MessageCircle, Pause, Play, Route, Stamp } from 'lucide-react';
import { AppView } from '../types';
import { cn } from '../lib/utils';

interface BottomNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isMusicPlaying: boolean;
  showMusicControl: boolean;
  onToggleMusic: () => void;
}

export default function BottomNav({
  currentView,
  onViewChange,
  isMusicPlaying,
  showMusicControl,
  onToggleMusic,
}: BottomNavProps) {
  const items = [
    { id: AppView.EXPLORE, label: 'Explore', icon: Compass },
    { id: AppView.ROUTES, label: 'Routes', icon: Route },
    { id: AppView.COMMUNITY, label: 'Community', icon: MessageCircle },
    { id: AppView.STAMPS, label: 'Seals', icon: Stamp },
    { id: AppView.PROFILE, label: 'Journey', icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full h-24 glass-nav border-t border-gray-100 z-50 flex justify-around items-center px-4 pb-4 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
      {showMusicControl && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleMusic}
          className="absolute -top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-heritage-red text-white shadow-xl"
          aria-label={isMusicPlaying ? 'Pause background music' : 'Play background music'}
        >
          {isMusicPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </motion.button>
      )}

      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onViewChange(item.id)}
            className="flex flex-col items-center justify-center w-16 sm:w-20 h-full relative"
          >
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              isActive ? "bg-heritage-olive text-white shadow-lg" : "text-gray-400"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <span className={cn(
              "text-[10px] uppercase font-sans font-bold tracking-widest mt-2",
              isActive ? "text-heritage-olive" : "text-gray-400"
            )}>
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
