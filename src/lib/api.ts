import type {
  AiGuideContext,
  AiGuideMessage,
  CommunityComment,
  CommunityPost,
  DirectMessage,
  MessageConversation,
  UserProfile,
} from '../types';

const TOKEN_KEY = 'maple-bridge-auth-token-v1';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function apiUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}

export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data as T;
}

export const api = {
  register(input: { username: string; password: string; displayName?: string }) {
    return request<{ token: string; user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  login(input: { username: string; password: string }) {
    return request<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  me() {
    return request<{ user: UserProfile }>('/api/auth/me');
  },
  logout() {
    return request<{ ok: true }>('/api/auth/logout', { method: 'POST' });
  },
  updateProfile(input: { displayName?: string; avatarDataUrl?: string }) {
    return request<{ user: UserProfile }>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  listPosts() {
    return request<{ posts: CommunityPost[] }>('/api/community/posts');
  },
  createPost(input: { content: string; imageDataUrl?: string; locationName?: string }) {
    return request<{ post: CommunityPost }>('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  createComment(postId: string, content: string) {
    return request<{ comment: CommunityComment }>(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
  listConversations() {
    return request<{ conversations: MessageConversation[] }>('/api/messages/conversations');
  },
  listMessages(otherUserId: string) {
    return request<{ participant: UserProfile; messages: DirectMessage[] }>(`/api/messages/${otherUserId}`);
  },
  sendMessage(toUserId: string, content: string) {
    return request<{ message: DirectMessage }>('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ toUserId, content }),
    });
  },
  chatAi(input: {
    message: string;
    context?: AiGuideContext;
    history?: Pick<AiGuideMessage, 'role' | 'content'>[];
  }) {
    return request<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

export function resolveMediaUrl(url?: string) {
  if (!url) return undefined;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return `${API_BASE_URL}${url}`;
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image.'));
    reader.readAsDataURL(file);
  });
}
