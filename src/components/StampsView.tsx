import { motion } from 'motion/react';
import { useState } from 'react';
import { Check, LockKeyhole, Sparkles, Stamp } from 'lucide-react';
import { ChallengeReward, JourneyProgress } from '../types';
import { cn } from '../lib/utils';
import ImageWithFallback from './ImageWithFallback';

interface StampsViewProps {
  progress: JourneyProgress;
  onCompleteChallenge: (reward: ChallengeReward) => void;
}

const miniChallenges = [
  {
    id: 'stamp-game-frost',
    title: 'Poetry Character',
    subtitle: 'Complete the missing character',
    question: '月落乌啼__满天',
    options: ['霜', '水', '露'],
    correct: '霜',
    points: 15,
    stampId: 'stamp-frost',
    rewardText: '“霜” creates the cold night mood that starts the whole poem.',
  },
  {
    id: 'stamp-game-bell',
    title: 'Midnight Bell',
    subtitle: 'Temple sound memory',
    question: 'The famous bell is heard at what time?',
    options: ['Dawn', 'Noon', 'Midnight'],
    correct: 'Midnight',
    points: 15,
    stampId: 'stamp-midnight-bell',
    rewardText: 'The midnight bell connects Hanshan Temple with the boat traveler.',
  },
  {
    id: 'stamp-game-canal',
    title: 'Canal Function',
    subtitle: 'History behind the view',
    question: 'The Grand Canal mainly supported...',
    options: ['Trade and transport', 'Only fishing', 'Only palace gardens'],
    correct: 'Trade and transport',
    points: 20,
    stampId: 'stamp-canal-trade',
    rewardText: 'Canal transport explains why the area became active before it became poetic.',
  },
];

const poemCharacters = ['月', '落', '乌', '啼', '霜', '满', '天'];

export default function StampsView({ progress, onCompleteChallenge }: StampsViewProps) {
  const [activeChallengeId, setActiveChallengeId] = useState(miniChallenges[0].id);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [earnedNow, setEarnedNow] = useState(false);

  const activeChallenge = miniChallenges.find((challenge) => challenge.id === activeChallengeId) ?? miniChallenges[0];
  const isCompleted = progress.completedChallenges.includes(activeChallenge.id);

  const answerChallenge = (answer: string) => {
    setSelectedAnswer(answer);
    setEarnedNow(false);

    if (answer !== activeChallenge.correct) {
      setFeedback('wrong');
      setTimeout(() => {
        setSelectedAnswer(null);
        setFeedback(null);
      }, 750);
      return;
    }

    setFeedback('correct');
    const shouldAddScore = !isCompleted;
    if (shouldAddScore) {
      onCompleteChallenge({
        id: activeChallenge.id,
        points: activeChallenge.points,
        stampId: activeChallenge.stampId,
        storyId: activeChallenge.id,
      });
    }
    setEarnedNow(shouldAddScore);
  };

  const completedMiniGames = miniChallenges.filter((challenge) => progress.completedChallenges.includes(challenge.id)).length;

  return (
    <div className="space-y-10 pb-12">
      <header className="pt-4">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Poetry Challenge</span>
        <h2 className="mt-2 font-serif text-4xl font-bold text-stone-950">Calligraphy Seals</h2>
        <p className="mt-3 font-sans text-sm leading-7 text-stone-500">
          Complete mini games to collect stamps and add score. Completed games stay unlocked after refresh.
        </p>
      </header>

      <section className="rounded-[2rem] bg-heritage-ink p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Ink Score</p>
            <p className="mt-1 font-serif text-4xl font-bold">{progress.score}</p>
          </div>
          <div className="text-right">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Mini Games</p>
            <p className="mt-1 font-serif text-3xl font-bold">{completedMiniGames}/{miniChallenges.length}</p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-stone-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-8">
          <div className="flex gap-2 font-serif text-3xl text-heritage-ink">
            {poemCharacters.map((character) => (
              <div
                key={character}
                className={cn(
                  'flex h-14 w-10 items-center justify-center border-b-2 font-bold transition-all',
                  character === '霜' && !progress.completedChallenges.includes('stamp-game-frost')
                    ? 'border-dashed border-heritage-red/30 bg-stone-50 text-transparent'
                    : 'border-heritage-olive/20',
                )}
              >
                {character}
              </div>
            ))}
          </div>

          <div className="w-full space-y-4">
            <div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-red">
                {activeChallenge.subtitle}
              </span>
              <h3 className="mt-1 font-serif text-2xl font-bold text-stone-950">{activeChallenge.title}</h3>
              <p className="mt-2 font-sans text-sm leading-7 text-stone-500">{activeChallenge.question}</p>
            </div>

            <div className="grid gap-3">
              {activeChallenge.options.map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === activeChallenge.correct;

                return (
                  <motion.button
                    key={option}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => answerChallenge(option)}
                    disabled={feedback === 'correct'}
                    className={cn(
                      'flex items-center justify-between rounded-2xl border-2 p-4 font-sans text-sm font-bold transition-all',
                      isSelected && isCorrect
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : isSelected
                          ? 'border-red-400 bg-red-50 text-red-500'
                          : 'border-stone-100 bg-white text-stone-600 hover:border-heritage-red/30',
                    )}
                  >
                    {option}
                    {isSelected && isCorrect && <Check className="h-4 w-4" />}
                  </motion.button>
                );
              })}
            </div>

            {feedback === 'correct' && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-3xl bg-heritage-red/5 p-5 text-center"
              >
                <p className="font-serif text-xl font-bold text-stone-950">Seal Unlocked</p>
                <p className="mt-2 font-sans text-sm leading-6 text-stone-500">{activeChallenge.rewardText}</p>
                <p className="mt-3 font-sans text-[10px] font-bold uppercase tracking-widest text-heritage-red">
                  {earnedNow ? `+${activeChallenge.points} points` : 'Already scored'}
                </p>
              </motion.div>
            )}

            {feedback === 'wrong' && (
              <p className="text-center font-sans text-xs font-bold uppercase tracking-widest text-red-400">Try again</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        {miniChallenges.map((challenge) => {
          const done = progress.completedChallenges.includes(challenge.id);

          return (
            <button
              key={challenge.id}
              onClick={() => {
                setActiveChallengeId(challenge.id);
                setSelectedAnswer(null);
                setFeedback(null);
                setEarnedNow(false);
              }}
              className={cn(
                'flex items-center justify-between rounded-3xl p-5 text-left shadow-sm transition',
                activeChallengeId === challenge.id ? 'bg-heritage-olive text-white' : 'bg-white text-stone-700',
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', done ? 'bg-heritage-red text-white' : 'bg-stone-100 text-stone-400')}>
                  {done ? <Stamp className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-serif text-lg font-bold">{challenge.title}</p>
                  <p className={cn('font-sans text-[10px] font-bold uppercase tracking-widest', activeChallengeId === challenge.id ? 'text-white/60' : 'text-stone-400')}>
                    {done ? 'Unlocked' : `${challenge.points} pts`}
                  </p>
                </div>
              </div>
              {done && <Check className="h-5 w-5" />}
            </button>
          );
        })}
      </section>

      <section className="space-y-6">
        <h3 className="border-l-4 border-heritage-red pl-4 font-serif text-2xl font-bold text-stone-950">Han Shan & Shi De</h3>
        <div className="overflow-hidden rounded-3xl border border-stone-100 bg-white p-2 shadow-sm">
          <ImageWithFallback
            src="/images/stories/hanshan-shide.jpg"
            alt="Han Shan and Shi De dialogue"
            className="h-64 w-full rounded-2xl object-cover grayscale transition-all duration-500 hover:grayscale-0"
            fallbackTitle="Han Shan & Shi De"
            fallbackSubtitle="/images/stories/hanshan-shide.jpg"
          />
        </div>
        <div className="poem-box space-y-6 rounded-3xl p-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-heritage-ink font-bold text-white shadow-lg">寒</div>
            <div className="rounded-3xl rounded-tl-none bg-white px-5 py-4 font-serif text-sm italic leading-7 text-stone-700 shadow-sm">
              If the world slanders me, bullies me, insults me, laughs at me, how should I deal with it?
            </div>
          </div>
          <div className="flex flex-row-reverse gap-4">
            <div className="olive-green flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-white shadow-lg">拾</div>
            <div className="rounded-3xl rounded-tr-none border border-heritage-red/10 bg-white/80 px-5 py-4 font-serif text-sm italic leading-7 text-stone-800 shadow-sm">
              Simply endure him, let him be, avoid him, be patient with him, and keep your own peace.
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 pt-2">
        {[
          { label: 'Visited', val: progress.visitedSpots.length },
          { label: 'Stories', val: progress.unlockedStories.length },
          { label: 'Seals', val: progress.collectedStamps.length },
          { label: 'Score', val: progress.score },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-stone-100 bg-white p-6 text-center shadow-sm">
            <Sparkles className="mx-auto mb-2 h-5 w-5 text-heritage-red" />
            <p className="mb-1 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{item.label}</p>
            <p className="font-serif text-2xl font-bold text-heritage-olive">{item.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
