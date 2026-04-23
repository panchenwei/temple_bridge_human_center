import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ArrowRight, Bell, BookOpen, Clock, Compass, MapPin, Pause, Play, Route } from 'lucide-react';
import { ROUTES_DATA, SPOTS, Spot } from '../types';
import ImageWithFallback from './ImageWithFallback';
import SpotDetailView from './SpotDetailView';

interface ExploreViewProps {
  onNavigateRoutes: () => void;
  onMarkVisited: (spotId: string) => void;
  initialSpotId?: string | null;
  onSpotOpened?: () => void;
  isMusicPlaying: boolean;
  musicHint: string | null;
  onToggleMusic: () => void;
}

const insightCards = [
  {
    icon: BookOpen,
    title: 'Poetry in Place',
    text: 'Read the poem as a walking map: moon, frost, fishing lights, temple, and bell all point back to real locations.',
  },
  {
    icon: Bell,
    title: 'Sound Memory',
    text: 'The midnight bell is not just a story detail. It is the acoustic landmark that makes Hanshan Temple unforgettable.',
  },
  {
    icon: Compass,
    title: 'Canal Context',
    text: 'The Grand Canal explains the trade, movement, and daily life behind the poetic scene.',
  },
];

export default function ExploreView({
  onNavigateRoutes,
  onMarkVisited,
  initialSpotId,
  onSpotOpened,
  isMusicPlaying,
  musicHint,
  onToggleMusic,
}: ExploreViewProps) {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const openSpot = (spot: Spot) => {
    onMarkVisited(spot.id);
    setSelectedSpot(spot);
  };

  useEffect(() => {
    if (!initialSpotId) return;
    const targetSpot = SPOTS.find((spot) => spot.id === initialSpotId);
    if (!targetSpot) return;

    openSpot(targetSpot);
    onSpotOpened?.();
  }, [initialSpotId, onSpotOpened]);

  return (
    <div className="relative space-y-8 pb-8">
      <div className="absolute -right-12 top-[30%] h-48 w-48 rounded-full bg-heritage-red/5 blur-3xl" />
      <div className="absolute -left-12 bottom-[10%] h-64 w-64 rounded-full bg-heritage-olive/5 blur-3xl" />

      <section className="space-y-5 pt-4">
        <div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-stone-400">
            Maple Bridge Heritage Guide
          </span>
          <h2 className="mt-2 font-serif text-5xl font-bold leading-tight text-stone-950">
            枫桥文化导览
          </h2>
          <p className="mt-3 max-w-sm font-sans text-sm leading-7 text-stone-500">
            Start from the map, tap a heritage spot, then follow a clear route through poetry, temple bells, and canal history.
          </p>
        </div>

        <button
          onClick={onNavigateRoutes}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-heritage-ink px-6 py-4 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white shadow-xl active:scale-95"
        >
          Start Exploring
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white bg-white/80 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-red">
              Interactive Map
            </span>
            <h3 className="font-serif text-xl font-bold text-stone-900">Tap a spot to open detail</h3>
          </div>
          <div className="rounded-full bg-heritage-olive/10 p-3 text-heritage-olive">
            <MapPin className="h-5 w-5" />
          </div>
        </div>

        <div className="relative h-[28rem] overflow-hidden bg-stone-100">
          <ImageWithFallback
            src={SPOTS[0].image}
            alt="Maple Bridge first view"
            className="h-full w-full object-cover opacity-75"
            fallbackTitle="枫桥"
            fallbackSubtitle={SPOTS[0].image}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(26,26,26,0.12)_100%)]" />

          <div className="absolute left-5 top-5 rounded-2xl bg-white/85 p-4 shadow-sm backdrop-blur">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Current Area</p>
            <p className="mt-1 font-serif text-lg font-bold text-stone-900">枫桥 · 寒山寺</p>
          </div>

          <div className="absolute bottom-5 left-5 right-24 rounded-3xl bg-black/35 p-5 text-white backdrop-blur-sm">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">First Main View</p>
            <h3 className="mt-1 font-serif text-3xl font-bold">枫桥</h3>
            <p className="mt-2 font-sans text-xs leading-5 text-white/75">
              The first frame uses Maple Bridge as the hero image. Open detailed spots from the next frame below.
            </p>
          </div>

          <div className="absolute bottom-5 right-5 z-10 flex flex-col items-end gap-2">
            {musicHint && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-full bg-white/85 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-stone-600 shadow-sm backdrop-blur"
              >
                {musicHint}
              </motion.span>
            )}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onToggleMusic}
              className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-heritage-red text-white shadow-2xl"
              aria-label={isMusicPlaying ? 'Pause background music' : 'Play background music'}
            >
              {isMusicPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white bg-white/85 p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-red">
              Spot Buttons
            </span>
            <h3 className="font-serif text-2xl font-bold text-stone-900">Tap a Spot</h3>
          </div>
          <div className="rounded-full bg-heritage-red/10 p-3 text-heritage-red">
            <MapPin className="h-5 w-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SPOTS.map((spot, index) => (
            <motion.button
              key={spot.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openSpot(spot)}
              className="group rounded-3xl border border-stone-100 bg-stone-50/80 p-4 text-left transition hover:border-heritage-red/20 hover:bg-white hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-heritage-red text-white shadow-lg transition group-hover:scale-105">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="font-serif text-xl font-bold text-stone-900">{spot.chineseName}</p>
              <p className="mt-1 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
                {spot.name}
              </p>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Recommended Routes</span>
            <h3 className="font-serif text-2xl font-bold text-stone-900">Choose Your Flow</h3>
          </div>
          <button onClick={onNavigateRoutes} className="font-sans text-xs font-bold uppercase tracking-widest text-heritage-red">
            All Routes
          </button>
        </div>

        <div className="grid gap-3">
          {ROUTES_DATA.map((route) => (
            <button
              key={route.id}
              onClick={onNavigateRoutes}
              className="group flex items-center justify-between rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <p className="font-serif text-xl font-bold text-stone-900">{route.chineseTitle}</p>
                <p className="mt-1 font-sans text-xs text-stone-500">{route.title} · {route.bestFor}</p>
                <div className="mt-3 flex gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-heritage-red/10 px-3 py-1 font-sans text-[10px] font-bold text-heritage-red">
                    <Clock className="h-3 w-3" />
                    {route.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-heritage-olive/10 px-3 py-1 font-sans text-[10px] font-bold text-heritage-olive">
                    <Route className="h-3 w-3" />
                    {route.distance}
                  </span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-stone-300 transition group-hover:translate-x-1 group-hover:text-heritage-red" />
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        {insightCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-3xl border border-stone-100 bg-white/80 p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3 text-heritage-olive">
                <Icon className="h-5 w-5" />
                <h3 className="font-serif text-xl font-bold text-stone-900">{card.title}</h3>
              </div>
              <p className="font-sans text-sm leading-7 text-stone-500">{card.text}</p>
            </div>
          );
        })}
      </section>

      <AnimatePresence>
        {selectedSpot && (
          <SpotDetailView
            spot={selectedSpot}
            onClose={() => setSelectedSpot(null)}
            onNextRoute={() => {
              setSelectedSpot(null);
              onNavigateRoutes();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
