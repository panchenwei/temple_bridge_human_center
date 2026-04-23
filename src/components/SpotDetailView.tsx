import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ChevronLeft, History, MapPin, Sparkles } from 'lucide-react';
import { Spot } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface SpotDetailViewProps {
  spot: Spot;
  onClose: () => void;
  onNextRoute: () => void;
}

export default function SpotDetailView({ spot, onClose, onNextRoute }: SpotDetailViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-heritage-paper xuan-paper"
    >
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-100 bg-white/85 px-6 backdrop-blur-md">
        <button onClick={onClose} className="-ml-2 flex items-center gap-1 p-2 font-sans text-xs font-bold text-heritage-ink">
          <ChevronLeft className="h-5 w-5" />
          BACK
        </button>
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-stone-400">Spot Detail</span>
        <div className="w-10" />
      </header>

      <div className="mx-auto max-w-xl pb-28">
        <section className="relative h-72 overflow-hidden">
          <ImageWithFallback
            src={spot.image}
            alt={spot.name}
            className="h-full w-full object-cover"
            fallbackTitle={spot.chineseName}
            fallbackSubtitle={spot.image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-7 left-6 right-6 text-white">
            <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur">
              <MapPin className="h-3 w-3" />
              {spot.category}
            </span>
            <h2 className="font-serif text-5xl font-bold leading-none">{spot.chineseName}</h2>
            <p className="mt-2 font-sans text-sm text-white/80">{spot.name}</p>
          </div>
        </section>

        <div className="space-y-6 px-6 pt-8">
          <section className="rounded-[2rem] border border-white bg-white/80 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3 text-heritage-red">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-serif text-xl font-bold">Why This Place Matters</h3>
            </div>
            <p className="font-sans text-sm leading-7 text-stone-600">{spot.whyMatters}</p>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="overflow-hidden rounded-3xl bg-white p-2 shadow-sm">
              <ImageWithFallback
                src={spot.oldImage}
                alt={`${spot.name} old view`}
                className="h-40 w-full rounded-2xl object-cover"
                fallbackTitle="Old View"
                fallbackSubtitle={spot.oldImage}
              />
              <p className="px-2 pt-3 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Old Memory</p>
            </div>
            <div className="overflow-hidden rounded-3xl bg-white p-2 shadow-sm">
              <ImageWithFallback
                src={spot.nowImage}
                alt={`${spot.name} current view`}
                className="h-40 w-full rounded-2xl object-cover"
                fallbackTitle="Now View"
                fallbackSubtitle={spot.nowImage}
              />
              <p className="px-2 pt-3 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Now Scene</p>
            </div>
          </section>

          <section className="poem-box rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-heritage-olive" />
              <h3 className="font-serif text-xl font-bold text-stone-900">Story Card</h3>
            </div>
            <p className="font-sans text-sm leading-7 text-stone-600">{spot.story}</p>
            {spot.poem && (
              <p className="mt-5 rounded-2xl bg-white/70 p-4 text-center font-serif text-lg font-bold leading-8 text-heritage-red">
                {spot.poem}
              </p>
            )}
          </section>

          <section className="rounded-[2rem] bg-heritage-ink p-6 text-white shadow-xl">
            <div className="mb-4 flex items-center gap-3 text-white/80">
              <History className="h-5 w-5" />
              <h3 className="font-serif text-xl font-bold">Next Step</h3>
            </div>
            <p className="mb-5 font-sans text-sm leading-7 text-white/70">
              Continue into a structured route to connect this spot with nearby poetry, canal, and temple stories.
            </p>
            <button
              onClick={onNextRoute}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-heritage-red px-5 py-4 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg active:scale-95"
            >
              Next Stop
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
