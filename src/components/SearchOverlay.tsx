import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { ChevronLeft, MapPin, Route, Search, X } from 'lucide-react';
import { ROUTES_DATA, SPOTS } from '../types';
import { cn } from '../lib/utils';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpot: (spotId: string) => void;
  onOpenRoute: (routeId: string) => void;
}

export default function SearchOverlay({ isOpen, onClose, onOpenSpot, onOpenRoute }: SearchOverlayProps) {
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const spotResults = useMemo(() => {
    if (!normalizedQuery) return SPOTS;
    return SPOTS.filter((spot) => {
      const haystack = `${spot.name} ${spot.chineseName} ${spot.description} ${spot.whyMatters}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const routeResults = useMemo(() => {
    if (!normalizedQuery) return ROUTES_DATA;
    return ROUTES_DATA.filter((route) => {
      const haystack = `${route.title} ${route.chineseTitle} ${route.description} ${route.bestFor}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-heritage-paper xuan-paper"
        >
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-stone-100 bg-white/85 px-6 backdrop-blur-md">
            <button onClick={onClose} className="-ml-2 flex items-center gap-1 p-2 font-sans text-xs font-bold uppercase tracking-widest text-stone-600">
              <ChevronLeft className="h-5 w-5" />
              Back
            </button>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400">Search Guide</span>
            <button onClick={onClose} className="rounded-full bg-stone-100 p-2 text-stone-400" aria-label="Close search">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="mx-auto max-w-xl space-y-7 px-6 pb-28 pt-6">
            <section>
              <h2 className="font-serif text-4xl font-bold text-stone-950">Find a Story</h2>
              <p className="mt-3 font-sans text-sm leading-7 text-stone-500">
                Search spots, routes, poems, temple bells, and canal stories. Results open the matching detail page directly.
              </p>
            </section>

            <label className="flex items-center gap-3 rounded-3xl border border-stone-100 bg-white px-5 py-4 shadow-sm">
              <Search className="h-5 w-5 text-heritage-red" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
                placeholder="Try Maple Bridge, 寒山寺, canal..."
                className="w-full bg-transparent font-sans text-sm text-stone-700 outline-none placeholder:text-stone-300"
              />
            </label>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-bold text-stone-950">Spots</h3>
                <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-stone-400">{spotResults.length} results</span>
              </div>
              <div className="grid gap-3">
                {spotResults.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => onOpenSpot(spot.id)}
                    className="flex items-center justify-between rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-heritage-red/10 text-heritage-red">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-serif text-xl font-bold text-stone-900">{spot.chineseName}</p>
                        <p className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-stone-400">{spot.name}</p>
                      </div>
                    </div>
                    <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-heritage-red">Open</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-bold text-stone-950">Routes</h3>
                <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-stone-400">{routeResults.length} results</span>
              </div>
              <div className="grid gap-3">
                {routeResults.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => onOpenRoute(route.id)}
                    className={cn(
                      'flex items-center justify-between rounded-3xl p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                      route.id === 'grand-canal-route' ? 'bg-heritage-ink text-white' : 'bg-white text-stone-900',
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', route.id === 'grand-canal-route' ? 'bg-white/10 text-white' : 'bg-heritage-olive/10 text-heritage-olive')}>
                        <Route className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-serif text-xl font-bold">{route.chineseTitle}</p>
                        <p className={cn('font-sans text-xs font-bold uppercase tracking-[0.14em]', route.id === 'grand-canal-route' ? 'text-white/45' : 'text-stone-400')}>
                          {route.title} · {route.duration}
                        </p>
                      </div>
                    </div>
                    <span className={cn('font-sans text-[10px] font-bold uppercase tracking-widest', route.id === 'grand-canal-route' ? 'text-white/70' : 'text-heritage-red')}>
                      Open
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
