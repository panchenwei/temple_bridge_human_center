/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AppView, ChallengeReward, INITIAL_PROGRESS, JourneyProgress } from './types';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import ExploreView from './components/ExploreView';
import RoutesView from './components/RoutesView';
import StampsView from './components/StampsView';
import ProfileView from './components/ProfileView';
import SearchOverlay from './components/SearchOverlay';

const STORAGE_KEY = 'maple-bridge-progress-v1';

function uniquePush(list: string[], value?: string) {
  if (!value || list.includes(value)) return list;
  return [...list, value];
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.EXPLORE);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pendingSpotId, setPendingSpotId] = useState<string | null>(null);
  const [pendingRouteId, setPendingRouteId] = useState<string | null>(null);
  const [progress, setProgress] = useState<JourneyProgress>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? { ...INITIAL_PROGRESS, ...JSON.parse(saved) } : INITIAL_PROGRESS;
    } catch {
      return INITIAL_PROGRESS;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const completeChallenge = (reward: ChallengeReward) => {
    setProgress((current) => {
      if (current.completedChallenges.includes(reward.id)) return current;

      return {
        score: current.score + reward.points,
        completedChallenges: [...current.completedChallenges, reward.id],
        visitedSpots: uniquePush(current.visitedSpots, reward.spotId),
        unlockedStories: uniquePush(current.unlockedStories, reward.storyId),
        collectedStamps: uniquePush(current.collectedStamps, reward.stampId),
      };
    });
  };

  const markVisitedSpot = (spotId: string) => {
    setProgress((current) => ({
      ...current,
      visitedSpots: uniquePush(current.visitedSpots, spotId),
    }));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.EXPLORE:
        return (
          <ExploreView
            onNavigateRoutes={() => setCurrentView(AppView.ROUTES)}
            onMarkVisited={markVisitedSpot}
            initialSpotId={pendingSpotId}
            onSpotOpened={() => setPendingSpotId(null)}
          />
        );
      case AppView.ROUTES:
        return (
          <RoutesView
            progress={progress}
            onCompleteChallenge={completeChallenge}
            onMarkVisited={markVisitedSpot}
            initialRouteId={pendingRouteId}
            onRouteOpened={() => setPendingRouteId(null)}
          />
        );
      case AppView.STAMPS:
        return <StampsView progress={progress} onCompleteChallenge={completeChallenge} />;
      case AppView.PROFILE:
        return <ProfileView progress={progress} onCompleteChallenge={completeChallenge} />;
      default:
        return (
          <ExploreView
            onNavigateRoutes={() => setCurrentView(AppView.ROUTES)}
            onMarkVisited={markVisitedSpot}
            initialSpotId={pendingSpotId}
            onSpotOpened={() => setPendingSpotId(null)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen pb-32 xuan-paper relative overflow-x-hidden">
      {/* Ink Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-heritage-ink/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-heritage-olive/5 blur-[100px] rounded-full" />
        <div className="absolute top-1/2 left-0 w-32 h-64 bg-heritage-ink/3 blur-[60px] -translate-x-1/2 rotate-12" />
      </div>

      <TopBar onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="max-w-xl mx-auto px-6 pt-20 relative z-10">
        {renderView()}
      </main>
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenSpot={(spotId) => {
          setCurrentView(AppView.EXPLORE);
          setPendingSpotId(spotId);
          setPendingRouteId(null);
          setIsSearchOpen(false);
        }}
        onOpenRoute={(routeId) => {
          setCurrentView(AppView.ROUTES);
          setPendingRouteId(routeId);
          setPendingSpotId(null);
          setIsSearchOpen(false);
        }}
      />
      
      {/* Scroll Tassel Accent (Desktop) */}
      <div className="fixed right-12 top-1/4 bottom-1/4 w-[1px] bg-gray-200 hidden lg:block opacity-60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-heritage-red rounded-full shadow-lg" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-1.5 h-16 bg-heritage-red rounded-t-sm" />
          <div className="w-[1px] h-8 bg-heritage-olive/30 mt-1" />
        </div>
      </div>
    </div>
  );
}
