import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Award, Camera, Check, Clock, Download, LogOut, Mail, Save, Send, Share2, Sparkles, Trophy, X } from 'lucide-react';
import { ChallengeReward, DirectMessage, JourneyProgress, MessageConversation, UserProfile } from '../types';
import { cn } from '../lib/utils';
import ImageWithFallback from './ImageWithFallback';
import { api, fileToDataUrl, resolveMediaUrl, setAuthToken } from '../lib/api';
import AuthGate from './AuthGate';

interface ProfileViewProps {
  progress: JourneyProgress;
  user: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
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

export default function ProfileView({ progress, user, onUserChange, onCompleteChallenge }: ProfileViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [earnedNow, setEarnedNow] = useState(false);
  const [memoryStatus, setMemoryStatus] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const isQuizDone = progress.completedChallenges.includes(profileQuiz.id);
  const achievementCount = progress.collectedStamps.length + progress.unlockedStories.length;

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
    setAvatarDataUrl(undefined);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setActiveChatUser(null);
      setMessages([]);
      return;
    }

    api.listConversations()
      .then((result) => setConversations(result.conversations))
      .catch(() => setConversations([]));
  }, [user]);

  if (!user) {
    return <AuthGate onAuthed={onUserChange} />;
  }

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

  const saveProfile = async () => {
    setIsSavingProfile(true);
    setMemoryStatus(null);

    try {
      const result = await api.updateProfile({ displayName, avatarDataUrl });
      onUserChange(result.user);
      setAvatarDataUrl(undefined);
      setMemoryStatus('Profile updated');
    } catch (error) {
      setMemoryStatus(error instanceof Error ? error.message : 'Profile update failed');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Keep local logout responsive even if the server session has expired.
    }
    setAuthToken(null);
    onUserChange(null);
  };

  const openConversation = async (participant: UserProfile) => {
    setActiveChatUser(participant);
    setIsLoadingMessages(true);
    setMemoryStatus(null);

    try {
      const result = await api.listMessages(participant.id);
      setMessages(result.messages);
      setActiveChatUser(result.participant);
    } catch (error) {
      setMemoryStatus(error instanceof Error ? error.message : 'Messages failed to load');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!activeChatUser) return;

    const content = messageDraft.trim();
    if (!content) return;

    setIsSendingMessage(true);
    setMemoryStatus(null);

    try {
      const result = await api.sendMessage(activeChatUser.id, content);
      setMessages((current) => [...current, result.message]);
      setMessageDraft('');
      const nextConversations = await api.listConversations();
      setConversations(nextConversations.conversations);
    } catch (error) {
      setMemoryStatus(error instanceof Error ? error.message : 'Message failed');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col items-center gap-6 pt-4">
        <div className="relative h-28 w-28 rounded-full border-4 border-white p-1 shadow-2xl">
          <div className="olive-green flex h-full w-full items-center justify-center overflow-hidden rounded-full">
            <ImageWithFallback
              src={avatarDataUrl || resolveMediaUrl(user?.avatarUrl) || '/images/profile/avatar.jpg'}
              alt="User avatar"
              className="h-full w-full object-cover"
              fallbackTitle="娓稿"
              fallbackSubtitle="/images/profile/avatar.jpg"
            />
          </div>
          <label className="absolute -bottom-1 -left-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-heritage-olive text-white">
            <Camera className="h-3.5 w-3.5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 4 * 1024 * 1024) {
                  setMemoryStatus('Image must be smaller than 4MB');
                  return;
                }
                setAvatarDataUrl(await fileToDataUrl(file));
              }}
            />
          </label>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-heritage-red text-[10px] font-bold text-white">
            鍜?          </div>
        </div>
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-stone-950">{user?.displayName || 'Gusu Wanderer'}</h2>
          <p className="mt-1 font-sans text-xs font-bold uppercase tracking-[0.2em] text-stone-400">@{user?.username || 'visitor'}</p>
        </div>
      </header>

      <section className="rounded-[2rem] border border-stone-100 bg-white p-5 shadow-sm">
        <p className="mb-3 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-red">Profile</p>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="展示名：2-24位，支持中英文和常见符号"
          className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3 font-sans text-sm outline-none focus:border-heritage-olive"
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={saveProfile}
            disabled={isSavingProfile}
            className="flex items-center justify-center gap-2 rounded-full bg-heritage-ink px-4 py-3 font-sans text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 rounded-full bg-stone-100 px-4 py-3 font-sans text-[10px] font-bold uppercase tracking-widest text-stone-500"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-red">Messages</p>
            <h3 className="font-serif text-2xl font-bold text-stone-950">Private Inbox</h3>
          </div>
          <Mail className="h-6 w-6 text-heritage-olive" />
        </div>

        {conversations.length === 0 ? (
          <div className="rounded-2xl bg-stone-50 p-5 text-center">
            <p className="font-sans text-sm font-bold text-stone-600">No private messages yet</p>
            <p className="mt-1 font-sans text-xs leading-5 text-stone-400">Start from the message buttons in Community.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {conversations.map((conversation) => {
              const isActive = activeChatUser?.id === conversation.participant.id;

              return (
                <button
                  key={conversation.participant.id}
                  type="button"
                  onClick={() => openConversation(conversation.participant)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl p-3 text-left transition',
                    isActive ? 'bg-heritage-olive text-white' : 'bg-stone-50 text-stone-700',
                  )}
                >
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl', isActive ? 'bg-white/15' : 'bg-white')}>
                    {conversation.participant.avatarUrl ? (
                      <ImageWithFallback
                        src={resolveMediaUrl(conversation.participant.avatarUrl) || ''}
                        alt={`${conversation.participant.displayName} avatar`}
                        className="h-full w-full object-cover"
                        fallbackTitle={conversation.participant.displayName.slice(0, 1).toUpperCase()}
                        fallbackSubtitle="avatar"
                      />
                    ) : (
                      <Mail className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-bold">{conversation.participant.displayName}</p>
                    <p className={cn('truncate font-sans text-xs', isActive ? 'text-white/65' : 'text-stone-400')}>
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeChatUser && (
          <div className="mt-4 rounded-[1.5rem] border border-stone-100 bg-stone-50 p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-stone-500">Chat with {activeChatUser.displayName}</p>
              <button
                type="button"
                onClick={() => {
                  setActiveChatUser(null);
                  setMessages([]);
                  setMessageDraft('');
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-400"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {isLoadingMessages ? (
                <p className="py-4 text-center font-sans text-xs text-stone-400">Loading...</p>
              ) : messages.length === 0 ? (
                <p className="py-4 text-center font-sans text-xs text-stone-400">No messages in this chat yet.</p>
              ) : (
                messages.map((message) => {
                  const isMine = message.fromUserId === user.id;

                  return (
                    <div key={message.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                      <p
                        className={cn(
                          'max-w-[78%] rounded-2xl px-4 py-2 font-sans text-xs leading-5',
                          isMine ? 'bg-heritage-ink text-white' : 'bg-white text-stone-600',
                        )}
                      >
                        {message.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                placeholder="Write a private message..."
                className="min-w-0 flex-1 rounded-full border border-stone-100 bg-white px-4 py-3 font-sans text-xs outline-none focus:border-heritage-olive"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={isSendingMessage}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-heritage-olive text-white disabled:opacity-50"
                aria-label="Send private message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

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
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Suzhou Heritage 路 EST. 2026</p>
      </div>
    </div>
  );
}

