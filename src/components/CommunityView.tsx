import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, ImagePlus, Mail, MapPin, MessageCircle, RefreshCw, Send, UserCircle, X } from 'lucide-react';
import type { CommunityPost, UserProfile } from '../types';
import { api, fileToDataUrl, resolveMediaUrl } from '../lib/api';
import ImageWithFallback from './ImageWithFallback';
import AuthGate from './AuthGate';

interface CommunityViewProps {
  user: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
}

interface MessageTarget {
  id: string;
  name: string;
  avatarUrl?: string;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Avatar({ src, name }: { src?: string; name: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-heritage-olive/10 text-heritage-olive">
      {src ? (
        <ImageWithFallback
          src={resolveMediaUrl(src) || ''}
          alt={`${name} avatar`}
          className="h-full w-full object-cover"
          fallbackTitle={name.slice(0, 1).toUpperCase()}
          fallbackSubtitle="avatar"
        />
      ) : (
        <UserCircle className="h-6 w-6" />
      )}
    </div>
  );
}

export default function CommunityView({ user, onUserChange }: CommunityViewProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [content, setContent] = useState('');
  const [locationName, setLocationName] = useState('Maple Bridge Scenic Area');
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [activeAuth, setActiveAuth] = useState(false);
  const [messageTarget, setMessageTarget] = useState<MessageTarget | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const loadPosts = async () => {
    setIsLoading(true);
    setStatus(null);

    try {
      const result = await api.listPosts();
      setPosts(result.posts);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to load community posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const pickImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setStatus('Image must be smaller than 4MB');
      return;
    }

    setImageDataUrl(await fileToDataUrl(file));
  };

  const createPost = async (event: FormEvent) => {
    event.preventDefault();

    if (!user) {
      setActiveAuth(true);
      return;
    }

    setIsPosting(true);
    setStatus(null);

    try {
      const result = await api.createPost({ content, locationName, imageDataUrl });
      setPosts((current) => [result.post, ...current]);
      setContent('');
      setImageDataUrl(undefined);
      setStatus('Check-in posted');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Post failed');
    } finally {
      setIsPosting(false);
    }
  };

  const createComment = async (postId: string) => {
    if (!user) {
      setActiveAuth(true);
      return;
    }

    const nextComment = commentDrafts[postId]?.trim();
    if (!nextComment) return;

    setStatus(null);

    try {
      const result = await api.createComment(postId, nextComment);
      setPosts((current) => current.map((post) => (
        post.id === postId ? { ...post, comments: [...post.comments, result.comment] } : post
      )));
      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Comment failed');
    }
  };

  const openMessage = (target: MessageTarget) => {
    if (!user) {
      setActiveAuth(true);
      return;
    }

    if (target.id === user.id) {
      setStatus('This is your own post');
      return;
    }

    setMessageTarget(target);
    setMessageDraft('');
    setStatus(null);
  };

  const sendPrivateMessage = async () => {
    if (!messageTarget) return;

    if (!user) {
      setActiveAuth(true);
      return;
    }

    const content = messageDraft.trim();
    if (!content) return;

    setIsSendingMessage(true);
    setStatus(null);

    try {
      await api.sendMessage(messageTarget.id, content);
      setStatus(`Message sent to ${messageTarget.name}`);
      setMessageTarget(null);
      setMessageDraft('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Message failed');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="pt-4">
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-red">Community</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-4xl font-bold leading-tight text-stone-950">打卡社区</h2>
            <p className="mt-2 font-sans text-sm leading-6 text-stone-500">Share route moments, photo check-ins, and small discoveries from the bridge and temple.</p>
          </div>
          <button
            type="button"
            onClick={loadPosts}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-heritage-olive shadow-sm"
            aria-label="Refresh community posts"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </header>

      <form onSubmit={createPost} className="rounded-[2rem] border border-stone-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <Avatar src={user?.avatarUrl} name={user?.displayName || 'Visitor'} />
          <div>
            <p className="font-serif text-xl font-bold text-stone-950">{user?.displayName || 'Visitor check-in'}</p>
            <p className="font-sans text-xs text-stone-400">{user ? 'Post a travel note' : 'Log in to post and comment'}</p>
          </div>
        </div>

        {activeAuth && !user ? (
          <div className="mb-5 rounded-[1.5rem] bg-stone-50 p-3">
            <AuthGate
              compact
              onAuthed={(nextUser) => {
                onUserChange(nextUser);
                setActiveAuth(false);
              }}
            />
          </div>
        ) : null}

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a check-in note..."
          rows={4}
          className="w-full resize-none rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3 font-sans text-sm leading-6 outline-none focus:border-heritage-olive"
        />

        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-stone-50 px-4 py-3 text-stone-500">
          <MapPin className="h-4 w-4 text-heritage-red" />
          <input
            value={locationName}
            onChange={(event) => setLocationName(event.target.value)}
            placeholder="location"
            className="min-w-0 flex-1 bg-transparent font-sans text-xs outline-none"
          />
        </div>

        {imageDataUrl && (
          <div className="relative mt-4 overflow-hidden rounded-2xl">
            <img src={imageDataUrl} alt="Post preview" className="h-56 w-full object-cover" />
            <button
              type="button"
              onClick={() => setImageDataUrl(undefined)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-500 shadow-sm"
              aria-label="Remove selected image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-4 grid grid-cols-[auto_auto_1fr] items-center gap-3">
          <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-heritage-olive/10 text-heritage-olive">
            <ImagePlus className="h-5 w-5" />
            <input type="file" accept="image/*" className="hidden" onChange={pickImage} />
          </label>
          <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-heritage-red/10 text-heritage-red">
            <Camera className="h-5 w-5" />
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={pickImage} />
          </label>
          <button
            type="submit"
            disabled={isPosting}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-heritage-ink px-4 font-sans text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {isPosting ? 'Posting' : 'Post'}
          </button>
        </div>

        {status && <p className="mt-4 text-center font-sans text-xs font-bold text-heritage-red">{status}</p>}
      </form>

      {messageTarget && (
        <section className="rounded-[2rem] border border-heritage-olive/20 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <Avatar src={messageTarget.avatarUrl} name={messageTarget.name} />
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-red">Private Message</p>
              <h3 className="truncate font-serif text-2xl font-bold text-stone-950">{messageTarget.name}</h3>
            </div>
            <button
              type="button"
              onClick={() => setMessageTarget(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400"
              aria-label="Close private message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <textarea
            value={messageDraft}
            onChange={(event) => setMessageDraft(event.target.value)}
            rows={3}
            placeholder="Say hello..."
            className="w-full resize-none rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3 font-sans text-sm leading-6 outline-none focus:border-heritage-olive"
          />
          <button
            type="button"
            onClick={sendPrivateMessage}
            disabled={isSendingMessage}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-heritage-ink px-4 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            {isSendingMessage ? 'Sending' : 'Send Message'}
          </button>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="border-l-4 border-heritage-olive pl-4 font-serif text-xl font-bold tracking-widest text-stone-800">POSTS</h3>
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-stone-400">{posts.length} notes</span>
        </div>

        {isLoading && <p className="rounded-2xl bg-white p-5 text-center font-sans text-sm text-stone-400">Loading community...</p>}

        {!isLoading && posts.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-stone-200 bg-white/70 p-8 text-center">
            <MessageCircle className="mx-auto mb-3 h-8 w-8 text-heritage-olive" />
            <p className="font-serif text-2xl font-bold text-stone-950">No check-ins yet</p>
            <p className="mt-2 font-sans text-xs leading-6 text-stone-500">Be the first to leave a photo note from the route.</p>
          </div>
        )}

        {posts.map((post) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[2rem] border border-stone-100 bg-white shadow-sm"
          >
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Avatar src={post.authorAvatarUrl} name={post.authorName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-xl font-bold text-stone-950">{post.authorName}</p>
                  <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-stone-400">{formatTime(post.createdAt)}</p>
                </div>
                {post.userId !== user?.id && (
                  <button
                    type="button"
                    onClick={() => openMessage({ id: post.userId, name: post.authorName, avatarUrl: post.authorAvatarUrl })}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-heritage-olive/10 text-heritage-olive"
                    aria-label={`Message ${post.authorName}`}
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                )}
              </div>

              {post.locationName && (
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-heritage-red/10 px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-widest text-heritage-red">
                  <MapPin className="h-3 w-3" />
                  {post.locationName}
                </p>
              )}

              <p className="mt-4 whitespace-pre-wrap font-sans text-sm leading-7 text-stone-600">{post.content}</p>
            </div>

            {post.imageUrl && (
              <ImageWithFallback
                src={resolveMediaUrl(post.imageUrl) || ''}
                alt="Community check-in"
                className="h-72 w-full object-cover"
                fallbackTitle="Check-in image"
                fallbackSubtitle="community"
              />
            )}

            <div className="space-y-3 border-t border-stone-100 p-5">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 rounded-2xl bg-stone-50 p-3">
                  <Avatar src={comment.authorAvatarUrl} name={comment.authorName} />
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-xs font-bold text-stone-800">{comment.authorName}</p>
                    <p className="mt-1 font-sans text-xs leading-5 text-stone-500">{comment.content}</p>
                  </div>
                  {comment.userId !== user?.id && (
                    <button
                      type="button"
                      onClick={() => openMessage({ id: comment.userId, name: comment.authorName, avatarUrl: comment.authorAvatarUrl })}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-heritage-olive"
                      aria-label={`Message ${comment.authorName}`}
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  value={commentDrafts[post.id] ?? ''}
                  onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                  placeholder={user ? 'Write a comment...' : 'Log in to comment'}
                  className="min-w-0 flex-1 rounded-full border border-stone-100 bg-stone-50 px-4 py-3 font-sans text-xs outline-none focus:border-heritage-olive"
                />
                <button
                  type="button"
                  onClick={() => createComment(post.id)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-heritage-olive text-white"
                  aria-label="Send comment"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
