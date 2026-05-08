import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Check, ChevronLeft, Clock, History, MapPin, Music, Navigation } from 'lucide-react';
import { AiGuideContext, ChallengeReward, JourneyProgress, RouteDetail, RouteMarker } from '../types';
import { cn } from '../lib/utils';
import AmapRouteMap from './AmapRouteMap';
import StoryGame from './StoryGame';

interface RouteDetailViewProps {
  route: RouteDetail;
  progress: JourneyProgress;
  onClose: () => void;
  onCompleteChallenge: (reward: ChallengeReward) => void;
  onMarkVisited: (spotId: string) => void;
  onAiContextChange: (context: AiGuideContext) => void;
  onAiForceClose: () => void;
}

function getRouteGuideContext(route: RouteDetail): AiGuideContext {
  return {
    view: 'route-detail',
    routeTitle: `${route.chineseTitle} ${route.title}`,
    description: `${route.description} Distance: ${route.distance}. Duration: ${route.duration}. Best for: ${route.bestFor}.`,
  };
}

function getMarkerGuideContext(route: RouteDetail, marker: RouteMarker): AiGuideContext {
  return {
    view: 'route-marker-detail',
    routeTitle: `${route.chineseTitle} ${route.title}`,
    markerName: `${marker.chineseName} ${marker.name}`,
    description: marker.description,
    story: marker.story,
    poem: marker.poem,
    coordinates: marker.lnglat,
  };
}

export default function RouteDetailView({
  route,
  progress,
  onClose,
  onCompleteChallenge,
  onMarkVisited,
  onAiContextChange,
  onAiForceClose,
}: RouteDetailViewProps) {
  const [selectedMarker, setSelectedMarker] = useState<RouteMarker | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [routeStarted, setRouteStarted] = useState(false);

  const visitedCount = route.markers.filter((marker) => progress.visitedSpots.includes(marker.id)).length;

  const buildAmapNavigationUrl = (marker: RouteMarker) => {
    const [lng, lat] = marker.lnglat;
    const name = encodeURIComponent(marker.chineseName || marker.name);

    return `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=walk&policy=1&src=temple-bridge&coordinate=gaode&callnative=1`;
  };

  const selectMarker = useCallback((marker: RouteMarker) => {
    setSelectedMarker(marker);
    const el = document.getElementById(`marker-info-${marker.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    onAiContextChange(selectedMarker ? getMarkerGuideContext(route, selectedMarker) : getRouteGuideContext(route));
  }, [onAiContextChange, route, selectedMarker]);

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-heritage-paper xuan-paper"
    >
      <div className="pointer-events-none fixed right-0 top-20 h-32 w-32 rounded-full bg-heritage-ink/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/2 rounded-full bg-heritage-olive/5 blur-[100px]" />

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-100 bg-white/85 px-6 backdrop-blur-md">
        <button onClick={onClose} className="-ml-2 flex items-center gap-1 p-2 font-sans text-xs font-bold text-heritage-ink">
          <ChevronLeft className="h-5 w-5" />
          BACK
        </button>
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{route.title}</span>
        <div className="w-10" />
      </header>

      <div className="mx-auto max-w-xl pb-24">
        <section className="relative aspect-square w-full overflow-hidden bg-stone-100">
          <AmapRouteMap
            route={route}
            selectedMarkerId={selectedMarker?.id ?? null}
            visitedSpotIds={progress.visitedSpots}
            onSelectMarker={selectMarker}
          />

          <div className="pointer-events-none absolute left-6 right-6 top-6">
            <div className="max-w-xs rounded-2xl border border-white/50 bg-white/85 p-4 shadow-sm backdrop-blur-md">
              <p className="mb-1 font-sans text-[10px] font-bold uppercase tracking-widest text-heritage-red">Route Description</p>
              <p className="font-sans text-xs leading-relaxed text-stone-700">{route.description}</p>
            </div>
          </div>
        </section>

        <section className="space-y-8 px-6 pt-8">
          <div className="space-y-4">
            <div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{route.chineseTitle}</span>
              <h2 className="mt-1 font-serif text-4xl font-bold leading-tight text-stone-950">{route.title}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-heritage-red/10 px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-widest text-heritage-red">
                <History className="h-3 w-3" />
                {route.distance}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-heritage-olive/10 px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-widest text-heritage-olive">
                <Clock className="h-3 w-3" />
                {route.duration}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-widest text-stone-500">
                {visitedCount}/{route.markers.length} visited
              </span>
            </div>
            <button
              onClick={() => {
                setRouteStarted(true);
                selectMarker(route.markers[0]);
              }}
              className="w-full rounded-full bg-heritage-ink px-6 py-4 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg active:scale-95"
            >
              {routeStarted ? 'Continue Route' : 'Start Route'}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 border-l-4 border-heritage-olive pl-4 font-serif text-xl font-bold tracking-widest text-stone-800">
              LANDMARKS
              <span className="font-sans text-[10px] text-stone-300">({route.markers.length})</span>
            </h3>

            {route.markers.map((marker, index) => {
              const isSelected = selectedMarker?.id === marker.id;
              const isVisited = progress.visitedSpots.includes(marker.id);
              const isChallengeDone = progress.completedChallenges.includes(marker.challengeId);

              return (
                <motion.article
                  key={marker.id}
                  id={`marker-info-${marker.id}`}
                  onClick={() => setSelectedMarker(marker)}
                  className={cn(
                    'relative cursor-pointer overflow-hidden rounded-3xl border p-6 transition-all',
                    isSelected ? 'border-heritage-red bg-white shadow-xl' : 'border-stone-100 bg-white/70',
                  )}
                >
                  <div className="mb-3 flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-2xl font-sans text-sm font-bold transition-colors',
                        isVisited ? 'bg-heritage-red text-white' : 'bg-heritage-olive/10 text-heritage-olive',
                      )}
                    >
                      {isVisited ? <Check className="h-5 w-5" /> : String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h4 className="font-serif text-xl font-bold text-stone-900">{marker.chineseName}</h4>
                      <p className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-stone-400">{marker.name}</p>
                    </div>
                  </div>
                  <p className="font-sans text-sm leading-7 text-stone-500">{marker.description}</p>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 space-y-5 border-t border-stone-100 pt-6"
                      >
                        <div className="poem-box rounded-2xl bg-stone-50/80 p-5 font-sans text-sm leading-7 text-stone-600">
                          <BookOpen className="mb-2 h-4 w-4 text-heritage-olive opacity-60" />
                          {marker.story}
                        </div>

                        {marker.poem && (
                          <div className="rounded-2xl border border-heritage-red/10 bg-heritage-red/5 p-5 text-center font-serif text-lg leading-8 text-heritage-red">
                            <Music className="mx-auto mb-2 h-4 w-4 opacity-50" />
                            {marker.poem}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onMarkVisited(marker.id);
                            }}
                            className={cn(
                              'rounded-full px-4 py-4 font-sans text-[10px] font-bold uppercase tracking-widest shadow-sm active:scale-95',
                              isVisited ? 'bg-stone-100 text-stone-400' : 'bg-heritage-red text-white',
                            )}
                          >
                            {isVisited ? 'Visited' : 'Mark Visited'}
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedMarker(marker);
                              onAiForceClose();
                              setShowGame(true);
                            }}
                            className={cn(
                              'rounded-full px-4 py-4 font-sans text-[10px] font-bold uppercase tracking-widest shadow-sm active:scale-95',
                              isChallengeDone ? 'bg-heritage-olive/10 text-heritage-olive' : 'bg-heritage-olive text-white',
                            )}
                          >
                            {isChallengeDone ? 'Story Unlocked' : 'Unlock Story'}
                          </button>
                        </div>

                        <a
                          href={buildAmapNavigationUrl(marker)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-heritage-ink px-4 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-white shadow-sm active:scale-95"
                        >
                          <Navigation className="h-4 w-4" />
                          Open AMap Navigation
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showGame && selectedMarker && (
          <StoryGame
            landmarkName={selectedMarker.name}
            challengeId={selectedMarker.challengeId}
            isCompleted={progress.completedChallenges.includes(selectedMarker.challengeId)}
            onCompleteChallenge={onCompleteChallenge}
            onComplete={() => setShowGame(false)}
            onCancel={() => setShowGame(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
