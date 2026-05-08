import { FormEvent, useState } from 'react';
import { Lock, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import type { UserProfile } from '../types';
import { api, setAuthToken } from '../lib/api';
import { cn } from '../lib/utils';

interface AuthGateProps {
  onAuthed: (user: UserProfile) => void;
  compact?: boolean;
}

export default function AuthGate({ onAuthed, compact = false }: AuthGateProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = mode === 'login'
        ? await api.login({ username, password })
        : await api.register({ username, password, displayName });
      setAuthToken(result.token);
      onAuthed(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('flex items-center justify-center', compact ? 'min-h-0' : 'min-h-[70vh]')}>
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className={cn('w-full rounded-[2rem] border border-stone-100 bg-white shadow-xl', compact ? 'p-4' : 'p-6')}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-heritage-olive text-white">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-red">Account</p>
            <h2 className={cn('font-serif font-bold text-stone-950', compact ? 'text-2xl' : 'text-3xl')}>
              {mode === 'login' ? 'Welcome Back' : 'Create Journey'}
            </h2>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-full bg-stone-100 p-1">
          {(['login', 'register'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn(
                'rounded-full px-4 py-3 font-sans text-[10px] font-bold uppercase tracking-widest transition',
                mode === item ? 'bg-white text-heritage-ink shadow-sm' : 'text-stone-400',
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="username"
            className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-4 py-4 font-sans text-sm outline-none focus:border-heritage-olive"
            autoComplete="username"
          />
          {mode === 'register' && (
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="display name"
              className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-4 py-4 font-sans text-sm outline-none focus:border-heritage-olive"
            />
          )}
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
            type="password"
            className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-4 py-4 font-sans text-sm outline-none focus:border-heritage-olive"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {error && <p className="mt-4 text-center font-sans text-xs font-bold text-heritage-red">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-heritage-ink px-6 py-4 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-50"
        >
          {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {isSubmitting ? 'Please wait' : mode === 'login' ? 'Log in' : 'Register'}
        </button>
      </motion.form>
    </div>
  );
}
