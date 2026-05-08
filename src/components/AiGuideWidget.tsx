import { AnimatePresence, motion } from 'motion/react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { LoaderCircle, Send, Sparkles, X } from 'lucide-react';
import type { AiGuideContext, AiGuideMessage } from '../types';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

interface AiGuideWidgetProps {
  context: AiGuideContext;
  forceClosedKey: number;
}

const quickPrompts = [
  '介绍一下这里',
  '这条路线怎么走？',
  '这个景点和诗有什么关系？',
  '帮我推荐拍照打卡点',
];

function makeMessageId() {
  return `ai_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function GuideAvatar({ size = 'large' }: { size?: 'small' | 'large' }) {
  const isSmall = size === 'small';

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-2xl border border-white/80 bg-[#f4dfc8] shadow-sm',
        isSmall ? 'h-10 w-10' : 'h-14 w-14',
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-x-2 top-1 h-4 rounded-b-full bg-heritage-ink" />
      <div className="absolute left-1/2 top-0 h-3 w-5 -translate-x-1/2 rounded-full bg-heritage-ink" />
      <div className="absolute left-1/2 top-5 h-6 w-8 -translate-x-1/2 rounded-full bg-[#f8cfae]" />
      <div className="absolute left-[38%] top-8 h-1 w-1 rounded-full bg-heritage-ink" />
      <div className="absolute right-[38%] top-8 h-1 w-1 rounded-full bg-heritage-ink" />
      <div className="absolute bottom-0 left-1/2 h-5 w-10 -translate-x-1/2 rounded-t-2xl bg-heritage-olive" />
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-serif text-[10px] font-bold text-white">
        导
      </span>
    </div>
  );
}

export default function AiGuideWidget({ context, forceClosedKey }: AiGuideWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiGuideMessage[]>([
    {
      id: makeMessageId(),
      role: 'assistant',
      content: '我是枫桥小导游。你可以问我景点故事、路线走法、诗词关系和打卡建议。',
      createdAt: new Date().toISOString(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [forceClosedKey]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [isOpen, messages, isLoading]);

  const sendMessage = async (value = input) => {
    const text = value.trim();
    if (!text || isLoading) return;

    const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));
    const userMessage: AiGuideMessage = {
      id: makeMessageId(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const result = await api.chatAi({ message: text, context, history });
      setMessages((current) => [
        ...current,
        {
          id: makeMessageId(),
          role: 'assistant',
          content: result.reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'AI guide is unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="ai-guide-button"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            className="fixed left-5 bottom-28 z-[65] flex items-center gap-3 rounded-[1.35rem] border border-white/80 bg-white/90 p-2 pr-4 text-left shadow-2xl backdrop-blur-md"
            aria-label="Open AI guide"
          >
            <GuideAvatar />
            <div className="hidden sm:block">
              <p className="font-serif text-sm font-bold text-stone-950">枫桥小导游</p>
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-heritage-red">
                Ask AI
              </p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="ai-guide-panel"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="fixed bottom-28 left-4 right-4 z-[65] flex max-h-[65vh] flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-heritage-paper shadow-2xl backdrop-blur md:left-5 md:right-auto md:w-[24rem]"
          >
            <header className="flex items-center justify-between border-b border-stone-100 bg-white/85 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <GuideAvatar size="small" />
                <div className="min-w-0">
                  <h2 className="truncate font-serif text-lg font-bold text-stone-950">枫桥小导游</h2>
                  <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    {context.markerName || context.spotName || context.routeTitle || 'Heritage guide'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-400"
                aria-label="Close AI guide"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    disabled={isLoading}
                    className="rounded-full border border-heritage-olive/15 bg-white px-3 py-2 font-sans text-[10px] font-bold text-heritage-olive shadow-sm disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[82%] rounded-3xl px-4 py-3 font-sans text-sm leading-6 shadow-sm',
                      message.role === 'user'
                        ? 'rounded-br-md bg-heritage-ink text-white'
                        : 'rounded-bl-md border border-stone-100 bg-white text-stone-600',
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-sans text-xs font-bold text-stone-400 shadow-sm">
                  <LoaderCircle className="h-4 w-4 animate-spin text-heritage-olive" />
                  小导游正在整理答案
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-heritage-red/10 bg-heritage-red/5 px-4 py-3 font-sans text-xs font-bold text-heritage-red">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={submitMessage} className="border-t border-stone-100 bg-white/85 p-3">
              <div className="flex items-center gap-2 rounded-full border border-stone-100 bg-stone-50 px-4 py-2">
                <Sparkles className="h-4 w-4 shrink-0 text-heritage-red" />
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  maxLength={500}
                  placeholder="问问枫桥故事"
                  className="min-w-0 flex-1 bg-transparent font-sans text-sm text-stone-700 outline-none placeholder:text-stone-300"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-heritage-olive text-white disabled:opacity-45"
                  aria-label="Send AI guide message"
                >
                  {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
