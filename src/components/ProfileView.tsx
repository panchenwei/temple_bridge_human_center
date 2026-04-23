import { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Check, Clock, Download, Share2, Sparkles, Trophy, X } from 'lucide-react';
import { ChallengeReward, JourneyProgress } from '../types';
import { cn } from '../lib/utils';
import ImageWithFallback from './ImageWithFallback';

interface ProfileViewProps {
  progress: JourneyProgress;
  onCompleteChallenge: (reward: ChallengeReward) => void;
}

const profileQuiz = {
  id: 'profile-memory-quiz',
  question: 'Which element makes Maple Bridge especially memorable in the poem?',
  options: ['Midnight bell', 'Modern skyline', 'Desert wind'],
  correct: 'Midnight bell',
  points: 10,
  stampId: 'stamp-profile-memory',
};

export default function ProfileView({ progress, onCompleteChallenge }: ProfileViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [earnedNow, setEarnedNow] = useState(false);
  const [memoryStatus, setMemoryStatus] = useState<string | null>(null);
  const isQuizDone = progress.completedChallenges.includes(profileQuiz.id);
  const achievementCount = progress.collectedStamps.length + progress.unlockedStories.length;

  const answerQuiz = (answer: string) => {
    setSelectedAnswer(answer);
    setEarnedNow(false);

    if (answer !== profileQuiz.correct) {
      setFeedback('wrong');
      setTimeout(() => {
        setSelectedAnswer(null);
        setFeedback(null);
      }, 700);
      return;
    }

    setFeedback('correct');
    const shouldAddScore = !isQuizDone;
    if (shouldAddScore) {
      onCompleteChallenge({
        id: profileQuiz.id,
        points: profileQuiz.points,
        stampId: profileQuiz.stampId,
        storyId: profileQuiz.id,
      });
    }
    setEarnedNow(shouldAddScore);
  };

  const summaryText = `I explored Maple Bridge: ${progress.visitedSpots.length} spots, ${progress.unlockedStories.length} stories, ${progress.collectedStamps.length} stamps, ${progress.score} points.`;

  const shareSummary = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Maple Bridge Journey', text: summaryText });
        setMemoryStatus('Shared successfully');
        return;
      }
      await navigator.clipboard.writeText(summaryText);
      setMemoryStatus('Summary copied to clipboard');
    } catch {
      setMemoryStatus('Share cancelled');
    }
  };

  const saveSummary = () => {
    const content = [
      'Maple Bridge Journey Summary',
      '',
      summaryText,
      `Visited spots: ${progress.visitedSpots.join(', ') || 'none yet'}`,
      `Unlocked stories: ${progress.unlockedStories.join(', ') || 'none yet'}`,
      `Collected stamps: ${progress.collectedStamps.join(', ') || 'none yet'}`,
      '',
      'Favorite quote:',
      '月落乌啼霜满天，江枫渔火对愁眠。',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'maple-bridge-journey.txt';
    link.click();
    URL.revokeObjectURL(url);
    setMemoryStatus('Memory file saved');
  };

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col items-center gap-6 pt-4">
        <div className="relative h-28 w-28 rounded-full border-4 border-white p-1 shadow-2xl">
          <div className="olive-green flex h-full w-full items-center justify-center overflow-hidden rounded-full">
            <ImageWithFallback
              src="/images/profile/avatar.jpg"
              alt="User avatar"
              className="h-full w-full object-cover"
              fallbackTitle="游客"
              fallbackSubtitle="/images/profile/avatar.jpg"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-heritage-red text-[10px] font-bold text-white">
            和
          </div>
        </div>
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-stone-950">Gusu Wanderer</h2>
          <p className="mt-1 font-sans text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Maple Bridge Scholar</p>
        </div>
      </header>

      <section className="rounded-[2rem] bg-heritage-ink p-6 text-white shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Visit Summary</p>
            <p className="mt-1 font-serif text-4xl font-bold">{progress.score} pts</p>
          </div>
          <Trophy className="h-10 w-10 text-heritage-red" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Spots', value: progress.visitedSpots.length },
            { label: 'Stories', value: progress.unlockedStories.length },
            { label: 'Seals', value: progress.collectedStamps.length },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/10 p-3 text-center">
              <p className="font-serif text-2xl font-bold">{item.value}</p>
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-white/45">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-stone-100 bg-white p-7 shadow-sm">
          <Award className="mb-1 h-6 w-6 text-heritage-red" />
          <span className="font-serif text-3xl font-bold text-stone-950">{achievementCount}</span>
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-stone-400">Achievements</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-stone-100 bg-white p-7 shadow-sm">
          <Clock className="mb-1 h-6 w-6 text-heritage-olive" />
          <span className="font-serif text-3xl font-bold text-stone-950">{Math.max(15, progress.visitedSpots.length * 12)}m</span>
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-stone-400">Walk Time</span>
        </div>
      </div>

      <section className="rounded-[2rem] border border-stone-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-heritage-red" />
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-950">Profile Mini Game</h3>
            <p className="font-sans text-xs text-stone-400">Correct answer adds score once.</p>
          </div>
        </div>
        <p className="font-sans text-sm font-bold leading-7 text-stone-700">{profileQuiz.question}</p>
        <div className="mt-4 grid gap-3">
          {profileQuiz.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === profileQuiz.correct;

            return (
              <button
                key={option}
                onClick={() => answerQuiz(option)}
                disabled={feedback === 'correct'}
                className={cn(
                  'flex items-center justify-between rounded-2xl border-2 p-4 text-left font-sans text-sm transition',
                  isSelected && isCorrect
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : isSelected
                      ? 'border-red-400 bg-red-50 text-red-500'
                      : 'border-stone-100 bg-stone-50 text-stone-600',
                )}
              >
                {option}
                {isSelected && (isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />)}
              </button>
            );
          })}
        </div>
        {feedback === 'correct' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center font-sans text-xs font-bold uppercase tracking-widest text-heritage-red">
            {earnedNow ? `+${profileQuiz.points} points` : 'Already scored'}
          </motion.p>
        )}
        {feedback === 'wrong' && (
          <p className="mt-4 text-center font-sans text-xs font-bold uppercase tracking-widest text-red-400">Try again</p>
        )}
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <ImageWithFallback
          src="/images/summary/share-card-bg.jpg"
          alt="Share card background"
          className="h-44 w-full object-cover"
          fallbackTitle="Share Card"
          fallbackSubtitle="/images/summary/share-card-bg.jpg"
        />
        <div className="p-6">
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-red">Favorite Quote</p>
          <p className="mt-3 font-serif text-2xl font-bold leading-10 text-stone-950">月落乌啼霜满天，江枫渔火对愁眠。</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={shareSummary}
              className="flex items-center justify-center gap-2 rounded-full bg-heritage-olive px-4 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-white"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button
              onClick={saveSummary}
              className="flex items-center justify-center gap-2 rounded-full bg-stone-100 px-4 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-stone-500"
            >
              <Download className="h-4 w-4" />
              Save
            </button>
          </div>
          {memoryStatus && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center font-sans text-xs font-bold uppercase tracking-widest text-heritage-red"
            >
              {memoryStatus}
            </motion.p>
          )}
        </div>
      </section>

      <div className="pt-8 text-center opacity-40">
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Suzhou Heritage · EST. 2026</p>
      </div>
    </div>
  );
}
