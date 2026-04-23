import { AnimatePresence, motion } from 'motion/react';
import { Bell, Camera, Clock, History, MapPin, Route as RouteIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ChallengeReward, JourneyProgress, ROUTES_DATA, RouteDetail } from '../types';
import { cn } from '../lib/utils';
import ImageWithFallback from './ImageWithFallback';
import RouteDetailView from './RouteDetailView';

interface RoutesViewProps {
  progress: JourneyProgress;
  onCompleteChallenge: (reward: ChallengeReward) => void;
  onMarkVisited: (spotId: string) => void;
  initialRouteId?: string | null;
  onRouteOpened?: () => void;
}

const routeMeta = {
  'quick-visit': {
    icon: Camera,
    color: 'text-heritage-red',
    bg: 'bg-heritage-red/10',
  },
  'poetry-route': {
    icon: Bell,
    color: 'text-heritage-olive',
    bg: 'bg-heritage-olive/10',
  },
  'grand-canal-route': {
    icon: History,
    color: 'text-teal-700',
    bg: 'bg-teal-700/10',
  },
};

export default function RoutesView({
  progress,
  onCompleteChallenge,
  onMarkVisited,
  initialRouteId,
  onRouteOpened,
}: RoutesViewProps) {
  const [selectedRoute, setSelectedRoute] = useState<RouteDetail | null>(null);

  useEffect(() => {
    if (!initialRouteId) return;
    const targetRoute = ROUTES_DATA.find((route) => route.id === initialRouteId);
    if (!targetRoute) return;

    setSelectedRoute(targetRoute);
    onRouteOpened?.();
  }, [initialRouteId, onRouteOpened]);

  return (
    <div className="space-y-8 pb-12">
      <header className="pt-4">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
          Recommended Routes
        </span>
        <h2 className="mt-2 font-serif text-4xl font-bold text-stone-950">Heritage Walk</h2>
        <p className="mt-3 font-sans text-sm leading-7 text-stone-500">
          Pick one route, open the detail map, mark visited stops, and unlock story challenges for points.
        </p>
      </header>

      <section className="rounded-[2rem] bg-heritage-ink p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Journey Score</p>
            <p className="mt-1 font-serif text-4xl font-bold">{progress.score}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-4 text-right">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Unlocked</p>
            <p className="font-serif text-2xl font-bold">{progress.unlockedStories.length} stories</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {ROUTES_DATA.map((route, index) => {
          const meta = routeMeta[route.id as keyof typeof routeMeta];
          const Icon = meta.icon;
          const completedStops = route.markers.filter((marker) => progress.visitedSpots.includes(marker.id)).length;

          return (
            <motion.button
              key={route.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRoute(route)}
              className="w-full overflow-hidden rounded-[2rem] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="grid grid-cols-[7rem_1fr]">
                <ImageWithFallback
                  src={route.mapImage}
                  alt={`${route.title} preview`}
                  className="h-full min-h-36 w-full object-cover"
                  fallbackTitle={route.chineseTitle}
                  fallbackSubtitle={route.mapImage}
                />
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className={cn('rounded-2xl p-3', meta.bg, meta.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                      {completedStops}/{route.markers.length} stops
                    </span>
                  </div>
                  <h4 className="font-serif text-2xl font-bold text-stone-900">{route.chineseTitle}</h4>
                  <p className="mt-1 font-sans text-xs font-bold uppercase tracking-[0.12em] text-heritage-red">
                    {route.title}
                  </p>
                  <p className="mt-2 line-clamp-2 font-sans text-xs leading-5 text-stone-500">{route.description}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 font-sans text-[10px] font-bold text-stone-500">
                      <Clock className="h-3 w-3 text-heritage-red" />
                      {route.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 font-sans text-[10px] font-bold text-stone-500">
                      <MapPin className="h-3 w-3 text-heritage-olive" />
                      {route.distance}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="poem-box rounded-3xl bg-white p-8">
        <div className="mb-4 flex items-center gap-3 text-heritage-olive">
          <RouteIcon className="h-5 w-5" />
          <h3 className="font-serif text-2xl font-bold text-stone-900">Route Tip</h3>
        </div>
        <p className="font-sans text-sm italic leading-7 text-stone-600">
          Long press the route map to place your own memory pin. Long press your custom pin again to choose whether to remove it.
        </p>
      </div>

      <AnimatePresence>
        {selectedRoute && (
          <RouteDetailView
            route={selectedRoute}
            progress={progress}
            onClose={() => setSelectedRoute(null)}
            onCompleteChallenge={onCompleteChallenge}
            onMarkVisited={onMarkVisited}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
