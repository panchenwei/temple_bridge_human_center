import { motion } from 'motion/react';
import { useState } from 'react';
import { Check, ChevronLeft, Trophy, X } from 'lucide-react';
import { ChallengeReward } from '../types';
import { cn } from '../lib/utils';

interface StoryGameProps {
  landmarkName: string;
  challengeId: string;
  isCompleted: boolean;
  onCompleteChallenge: (reward: ChallengeReward) => void;
  onComplete: () => void;
  onCancel: () => void;
}

interface Challenge {
  question: string;
  options: string[];
  correct: number;
  points: number;
  stampId: string;
  story: string;
}

const challenges: Record<string, Challenge> = {
  'story-maple-bridge': {
    question: 'Why is Maple Bridge more than a scenic bridge?',
    options: ['It connects poetry, canal traffic, and city life', 'It was built only for royal ceremonies', 'It is famous for modern shopping streets'],
    correct: 0,
    points: 20,
    stampId: 'stamp-maple',
    story: 'Maple Bridge matters because the poem is tied to a real transportation scene: a boat at night, canal movement, city edge, and the distant temple bell.',
  },
  'story-bell-tower': {
    question: 'How many bell tolls are traditionally used to release worldly worries?',
    options: ['88', '108', '365'],
    correct: 1,
    points: 20,
    stampId: 'stamp-bell',
    story: 'The 108 tolls symbolize releasing 108 worldly anxieties. The bell turns the route into a sound-based cultural memory.',
  },
  'story-canal-pier': {
    question: 'What did the canal mainly support in ancient Suzhou?',
    options: ['Grain transport, markets, and daily movement', 'A private royal swimming pool', 'Only modern sightseeing boats'],
    correct: 0,
    points: 20,
    stampId: 'stamp-canal',
    story: 'The canal carried goods, travelers, and local life. Maple Bridge became famous because poetry grew from this real waterway context.',
  },
  'story-poem-wall': {
    question: 'Which phrase belongs to Night Mooring by Maple Bridge?',
    options: ['江枫渔火对愁眠', '白日依山尽', '春眠不觉晓'],
    correct: 0,
    points: 25,
    stampId: 'stamp-poetry',
    story: 'The phrase “江枫渔火对愁眠” anchors the emotional center of the poem: lonely travel, dim lights, and homesickness beside the river.',
  },
  'story-jiangfeng': {
    question: 'What feeling does the riverside scene mainly create in the poem?',
    options: ['Homesickness and quiet distance', 'Festival excitement', 'Battle victory'],
    correct: 0,
    points: 25,
    stampId: 'stamp-riverside',
    story: 'The riverside is where landscape becomes emotion. Water, firelight, and silence make the traveler’s loneliness visible.',
  },
  'story-hanshan-temple': {
    question: 'Which line directly names Hanshan Temple?',
    options: ['夜半钟声到客船', '姑苏城外寒山寺', '月落乌啼霜满天'],
    correct: 1,
    points: 25,
    stampId: 'stamp-temple',
    story: 'The temple is not background decoration. It is the destination of sound, memory, and cultural recognition in the poem.',
  },
  'story-tieling-pass': {
    question: 'What does Tieling Pass help explain?',
    options: ['Waterway defense and route control', 'Imperial garden design', 'Modern subway planning'],
    correct: 0,
    points: 30,
    stampId: 'stamp-gate',
    story: 'Tieling Pass shows the practical side of the heritage area. Bridges, gates, and waterways worked together to protect movement and trade.',
  },
  'story-old-market': {
    question: 'Why did markets grow around Maple Bridge?',
    options: ['Because canal traffic brought grain and merchants', 'Because there was no water transport', 'Because the area was closed to visitors'],
    correct: 0,
    points: 30,
    stampId: 'stamp-market',
    story: 'Markets formed where boats, grain, price information, and city access met. The poetic site was also a busy commercial node.',
  },
  'story-grand-canal': {
    question: 'What is the best way to understand the Grand Canal in this guide?',
    options: ['As a living network behind local stories', 'As a decorative pond', 'As a single isolated scenic spot'],
    correct: 0,
    points: 30,
    stampId: 'stamp-grand-canal',
    story: 'The Grand Canal is the larger network behind Maple Bridge: transport, trade, urban form, and poetic memory all flow through it.',
  },
};

export default function StoryGame({
  landmarkName,
  challengeId,
  isCompleted,
  onCompleteChallenge,
  onComplete,
  onCancel,
}: StoryGameProps) {
  const [step, setStep] = useState<'intro' | 'challenge' | 'reward'>('intro');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [earnedNow, setEarnedNow] = useState(false);

  const currentChallenge = challenges[challengeId] ?? challenges['story-maple-bridge'];

  const handleOptionClick = (idx: number) => {
    setSelectedOption(idx);
    const isCorrect = idx === currentChallenge.correct;
    setLastAnswerCorrect(isCorrect);

    if (!isCorrect) {
      setTimeout(() => {
        setSelectedOption(null);
        setLastAnswerCorrect(null);
      }, 750);
      return;
    }

    if (!isCompleted) {
      onCompleteChallenge({
        id: challengeId,
        points: currentChallenge.points,
        stampId: currentChallenge.stampId,
        storyId: challengeId,
      });
      setEarnedNow(true);
    }

    setTimeout(() => setStep('reward'), 650);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-6 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-heritage-olive/10 bg-heritage-paper shadow-2xl"
      >
        <header className="flex h-14 items-center justify-between border-b border-stone-100 bg-white/75 px-5 backdrop-blur">
          <button onClick={onCancel} className="flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-widest text-stone-500">
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Story Game</span>
          <button onClick={onCancel} className="rounded-full bg-stone-100 p-2 text-stone-400">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[80vh] overflow-y-auto p-8">
          {step === 'intro' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-heritage-red/10">
                <Trophy className="h-10 w-10 text-heritage-red" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-950">Landmark Challenge</h3>
                <p className="mt-3 font-sans text-sm leading-7 text-stone-500">
                  Complete the mini quiz for <strong>{landmarkName}</strong> to unlock a cultural record.
                </p>
              </div>
              {isCompleted && (
                <div className="rounded-2xl bg-heritage-olive/10 p-4 font-sans text-xs leading-6 text-heritage-olive">
                  This story is already unlocked. You can replay it, but points will not be added twice.
                </div>
              )}
              <button
                onClick={() => setStep('challenge')}
                className="w-full rounded-full bg-heritage-olive py-4 font-sans text-sm font-bold uppercase tracking-widest text-white shadow-lg"
              >
                Accept Challenge
              </button>
            </div>
          )}

          {step === 'challenge' && (
            <div className="space-y-6">
              <span className="rounded-full bg-heritage-red px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-white">
                {currentChallenge.points} pts
              </span>
              <h3 className="font-serif text-xl font-bold leading-tight text-stone-950">{currentChallenge.question}</h3>
              <div className="space-y-3">
                {currentChallenge.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrect = index === currentChallenge.correct;

                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionClick(index)}
                      disabled={selectedOption !== null && lastAnswerCorrect === true}
                      className={cn(
                        'flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left font-sans text-sm transition-all',
                        isSelected && isCorrect
                          ? 'border-green-500 bg-green-50'
                          : isSelected
                            ? 'border-red-400 bg-red-50'
                            : 'border-stone-100 bg-white hover:border-heritage-olive/30',
                      )}
                    >
                      {option}
                      {isSelected && (isCorrect ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-400" />)}
                    </button>
                  );
                })}
              </div>
              {lastAnswerCorrect === false && (
                <p className="text-center font-sans text-xs font-bold uppercase tracking-widest text-red-400">
                  Try again
                </p>
              )}
            </div>
          )}

          {step === 'reward' && (
            <div className="space-y-6 text-center">
              <motion.div
                animate={{ rotate: [0, 8, -8, 8, 0], scale: [1, 1.15, 1] }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-heritage-olive text-white shadow-lg"
              >
                <Trophy className="h-12 w-12" />
              </motion.div>
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-stone-950">Legend Unlocked</h3>
                <div className="rounded-3xl border border-heritage-red/10 bg-heritage-red/5 p-6 text-left">
                  <span className="mb-2 block font-sans text-[10px] font-bold uppercase tracking-widest text-heritage-red">
                    Cultural Record
                  </span>
                  <p className="font-sans text-sm italic leading-7 text-stone-700">{currentChallenge.story}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 font-sans text-xs font-bold uppercase tracking-widest text-heritage-olive">
                  {earnedNow ? `+${currentChallenge.points} points added` : 'Already completed'}
                </div>
              </div>
              <button
                onClick={onComplete}
                className="w-full rounded-full bg-heritage-olive py-4 font-sans text-sm font-bold uppercase tracking-widest text-white shadow-lg"
              >
                Claim & Return
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
