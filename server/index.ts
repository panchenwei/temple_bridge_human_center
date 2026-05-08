import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import dotenv from 'dotenv';

interface User {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  salt: string;
  avatarUrl?: string;
  createdAt: string;
}

interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
}

interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  imageUrl?: string;
  locationName?: string;
  createdAt: string;
  comments: CommunityComment[];
}

interface DirectMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
}

interface AiGuideContextPayload {
  view?: string;
  routeTitle?: string;
  spotName?: string;
  markerName?: string;
  description?: string;
  story?: string;
  poem?: string;
  coordinates?: [number, number];
}

interface AiChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

interface AiProviderConfig {
  apiKey: string;
  modelId: string;
  openaiUrl: string;
}

interface Database {
  users: User[];
  sessions: Session[];
  posts: CommunityPost[];
  messages: DirectMessage[];
}

interface AuthedRequest extends Request {
  user?: User;
  token?: string;
}

interface RateBucket {
  count: number;
  resetAt: number;
}

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });

const dataDir = path.join(projectRoot, 'server', 'data');
const uploadsDir = path.join(projectRoot, 'server', 'uploads');
const dbPath = path.join(dataDir, 'db.json');
const port = Number(process.env.PORT ?? 3001);
const maxImageBytes = 4 * 1024 * 1024;
const maxPostComments = 100;
const maxMessagesPerUser = 500;
const maxReturnedPosts = 100;
const maxAiHistoryItems = 8;
const idPattern = /^[a-z]+_[a-f0-9]{18}$/;
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'https://panchenwei.github.io',
]);

const emptyDb: Database = {
  users: [],
  sessions: [],
  posts: [],
  messages: [],
};

const rateBuckets = new Map<string, RateBucket>();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function normalizeUser(value: unknown): User | null {
  if (!isPlainObject(value)) return null;
  const id = normalizeString(value.id);
  const username = normalizeString(value.username);
  const displayName = normalizeString(value.displayName, username);
  const passwordHash = normalizeString(value.passwordHash);
  const salt = normalizeString(value.salt);
  const createdAt = normalizeString(value.createdAt, new Date().toISOString());
  const avatarUrl = typeof value.avatarUrl === 'string' ? value.avatarUrl : undefined;

  if (!idPattern.test(id) || !username || !displayName || !passwordHash || !salt) return null;
  return { id, username, displayName, passwordHash, salt, avatarUrl, createdAt };
}

function normalizeSession(value: unknown): Session | null {
  if (!isPlainObject(value)) return null;
  const token = normalizeString(value.token);
  const userId = normalizeString(value.userId);
  const createdAt = normalizeString(value.createdAt, new Date().toISOString());

  if (!idPattern.test(token) || !idPattern.test(userId)) return null;
  return { token, userId, createdAt };
}

function normalizeComment(value: unknown, fallbackPostId: string): CommunityComment | null {
  if (!isPlainObject(value)) return null;
  const id = normalizeString(value.id);
  const postId = normalizeString(value.postId, fallbackPostId);
  const userId = normalizeString(value.userId);
  const authorName = normalizeString(value.authorName, 'Unknown User');
  const authorAvatarUrl = typeof value.authorAvatarUrl === 'string' ? value.authorAvatarUrl : undefined;
  const content = normalizeString(value.content).trim();
  const createdAt = normalizeString(value.createdAt, new Date().toISOString());

  if (!idPattern.test(id) || !idPattern.test(postId) || !idPattern.test(userId) || !content) return null;
  return { id, postId, userId, authorName, authorAvatarUrl, content, createdAt };
}

function normalizePost(value: unknown): CommunityPost | null {
  if (!isPlainObject(value)) return null;
  const id = normalizeString(value.id);
  const userId = normalizeString(value.userId);
  const authorName = normalizeString(value.authorName, 'Unknown User');
  const authorAvatarUrl = typeof value.authorAvatarUrl === 'string' ? value.authorAvatarUrl : undefined;
  const content = normalizeString(value.content).trim();
  const imageUrl = typeof value.imageUrl === 'string' ? value.imageUrl : undefined;
  const locationName = typeof value.locationName === 'string' ? value.locationName : undefined;
  const createdAt = normalizeString(value.createdAt, new Date().toISOString());
  const comments = Array.isArray(value.comments)
    ? value.comments.map((comment) => normalizeComment(comment, id)).filter((comment): comment is CommunityComment => Boolean(comment))
    : [];

  if (!idPattern.test(id) || !idPattern.test(userId) || !content) return null;
  return { id, userId, authorName, authorAvatarUrl, content, imageUrl, locationName, createdAt, comments: comments.slice(-maxPostComments) };
}

function normalizeMessage(value: unknown): DirectMessage | null {
  if (!isPlainObject(value)) return null;
  const id = normalizeString(value.id);
  const fromUserId = normalizeString(value.fromUserId);
  const toUserId = normalizeString(value.toUserId);
  const content = normalizeString(value.content).trim();
  const createdAt = normalizeString(value.createdAt, new Date().toISOString());

  if (!idPattern.test(id) || !idPattern.test(fromUserId) || !idPattern.test(toUserId) || !content) return null;
  return { id, fromUserId, toUserId, content, createdAt };
}

function normalizeDb(value: unknown): Database {
  if (!isPlainObject(value)) return { ...emptyDb };

  const users = Array.isArray(value.users)
    ? value.users.map(normalizeUser).filter((user): user is User => Boolean(user))
    : [];
  const sessions = Array.isArray(value.sessions)
    ? value.sessions.map(normalizeSession).filter((session): session is Session => Boolean(session))
    : [];
  const posts = Array.isArray(value.posts)
    ? value.posts.map(normalizePost).filter((post): post is CommunityPost => Boolean(post))
    : [];
  const messages = Array.isArray(value.messages)
    ? value.messages.map(normalizeMessage).filter((message): message is DirectMessage => Boolean(message))
    : [];

  return { users, sessions, posts, messages };
}

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });

  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(emptyDb, null, 2), 'utf-8');
  }
}

async function readDb(): Promise<Database> {
  await ensureStorage();

  try {
    const raw = await fs.readFile(dbPath, 'utf-8');
    return normalizeDb(JSON.parse(raw));
  } catch (error) {
    const backupPath = path.join(dataDir, `db.corrupt-${Date.now()}.json`);

    try {
      await fs.rename(dbPath, backupPath);
    } catch {
      // If the corrupt file cannot be moved, still restore a usable database.
    }

    await fs.writeFile(dbPath, JSON.stringify(emptyDb, null, 2), 'utf-8');
    console.error('Database was corrupt and has been reset.', error);
    return { ...emptyDb };
  }
}

async function writeDb(db: Database) {
  await ensureStorage();
  const normalized = normalizeDb(db);
  const tmpPath = `${dbPath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(normalized, null, 2), 'utf-8');
  await fs.rename(tmpPath, dbPath);
}

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(9).toString('hex')}`;
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const passwordHash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return { salt, passwordHash };
}

function verifyPassword(password: string, user: User) {
  const { passwordHash } = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(passwordHash, 'hex'), Buffer.from(user.passwordHash, 'hex'));
}

function publicUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

function publicUserById(db: Database, userId: string) {
  const user = db.users.find((item) => item.id === userId);
  return user
    ? publicUser(user)
    : {
        id: userId,
        username: 'unknown',
        displayName: 'Unknown User',
        avatarUrl: undefined,
        createdAt: '',
      };
}

function requestBody(req: Request) {
  if (!isPlainObject(req.body)) throw new HttpError(400, 'Request body must be a JSON object.');
  return req.body;
}

function readString(source: Record<string, unknown>, field: string, options: { min?: number; max: number; label?: string; pattern?: RegExp } | { min?: number; max: number; label?: string; pattern?: RegExp }) {
  const value = source[field];
  const label = options.label ?? field;
  const min = options.min ?? 1;

  if (typeof value !== 'string') throw new HttpError(400, `${label} must be a string.`);

  const trimmed = value.trim();
  if (trimmed.length < min) throw new HttpError(400, `${label} cannot be empty.`);
  if (trimmed.length > options.max) throw new HttpError(400, `${label} is too long.`);
  if (options.pattern && !options.pattern.test(trimmed)) throw new HttpError(400, `${label} format is invalid.`);

  return trimmed;
}

function readOptionalString(source: Record<string, unknown>, field: string, options: { min?: number; max: number; label?: string; pattern?: RegExp }) {
  if (!(field in source)) return undefined;
  return readString(source, field, options);
}

function readId(source: Record<string, unknown>, field: string, label = field) {
  return readString(source, field, { max: 40, label, pattern: idPattern });
}

function readParamId(req: Request, field: string, label = field) {
  return readId(req.params, field, label);
}

function readAiContext(source: Record<string, unknown>): AiGuideContextPayload | undefined {
  if (!('context' in source) || source.context === undefined) return undefined;
  if (!isPlainObject(source.context)) throw new HttpError(400, 'AI context must be a JSON object.');

  const rawContext = source.context;
  const context: AiGuideContextPayload = {};
  const fields: Array<keyof Omit<AiGuideContextPayload, 'coordinates'>> = [
    'view',
    'routeTitle',
    'spotName',
    'markerName',
    'description',
    'story',
    'poem',
  ];

  for (const field of fields) {
    const value = readOptionalString(rawContext, field, {
      max: field === 'story' || field === 'description' ? 1200 : 160,
      label: `AI context ${field}`,
    });
    if (value) context[field] = value;
  }

  if ('coordinates' in rawContext) {
    const coordinates = rawContext.coordinates;
    if (
      !Array.isArray(coordinates)
      || coordinates.length !== 2
      || typeof coordinates[0] !== 'number'
      || typeof coordinates[1] !== 'number'
      || !Number.isFinite(coordinates[0])
      || !Number.isFinite(coordinates[1])
    ) {
      throw new HttpError(400, 'AI context coordinates must be [lng, lat].');
    }

    context.coordinates = [coordinates[0], coordinates[1]];
  }

  return Object.keys(context).length ? context : undefined;
}

function readAiHistory(source: Record<string, unknown>): AiChatHistoryItem[] {
  if (!('history' in source) || source.history === undefined) return [];
  if (!Array.isArray(source.history)) throw new HttpError(400, 'AI history must be an array.');

  return source.history.slice(-maxAiHistoryItems).map((item, index) => {
    if (!isPlainObject(item)) throw new HttpError(400, `AI history item ${index + 1} must be a JSON object.`);
    const role = readString(item, 'role', {
      max: 10,
      label: `AI history role ${index + 1}`,
      pattern: /^(user|assistant)$/,
    }) as AiChatHistoryItem['role'];
    const content = readString(item, 'content', {
      max: 1000,
      label: `AI history content ${index + 1}`,
    });

    return { role, content };
  });
}

function formatAiContext(context?: AiGuideContextPayload) {
  if (!context) return 'No current page context was provided.';

  const lines = [
    context.view ? `Page: ${context.view}` : undefined,
    context.routeTitle ? `Route: ${context.routeTitle}` : undefined,
    context.spotName ? `Spot: ${context.spotName}` : undefined,
    context.markerName ? `Landmark: ${context.markerName}` : undefined,
    context.description ? `Description: ${context.description}` : undefined,
    context.story ? `Story: ${context.story}` : undefined,
    context.poem ? `Poem: ${context.poem}` : undefined,
    context.coordinates ? `Coordinates: ${context.coordinates[0]}, ${context.coordinates[1]}` : undefined,
  ].filter(Boolean);

  return lines.join('\n') || 'No current page context was provided.';
}

function formatAiHistory(history: AiChatHistoryItem[]) {
  if (!history.length) return 'No recent conversation.';
  return history.map((item) => `${item.role}: ${item.content}`).join('\n');
}

function getAiProviderConfig(): AiProviderConfig {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) throw new HttpError(503, 'AI guide is not configured. Add AI_API_KEY on the server.');

  return {
    apiKey,
    modelId: process.env.AI_MODEL_ID?.trim() || 'astron-code-latest',
    openaiUrl: (process.env.AI_OPENAI_URL?.trim() || 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2').replace(/\/$/, ''),
  };
}

function buildAiPrompt(message: string, context?: AiGuideContextPayload, history: AiChatHistoryItem[] = []) {
  return [
    'prompt:',
    '你是“枫桥小导游”，服务于枫桥、寒山寺、大运河文化导览网站。',
    '你要根据当前页面资料回答用户问题，重点解释景点故事、路线走法、诗词关系、历史背景和拍照打卡建议。',
    '当前页面资料是可信资料，必须优先使用；即使资料很短，也要直接基于它回答。',
    '如果当前页面资料包含景点名、路线名或描述，不要说资料没有加载。',
    '默认用简洁自然的中文回答；用户用英文提问时，也可以用英文回答。',
    '不要编造门票、开放时间、实时天气、实时人流等未提供的信息。',
    '务必纯文本回答，无法渲染markdown。',
    '不要使用 Markdown 标题、表格、代码块、加粗、引用格式；如果需要分点，用普通短句和换行。',
    '',
    `当前页面资料:\n${formatAiContext(context)}`,
    '',
    `最近对话:\n${formatAiHistory(history)}`,
    '',
    `用户问题:\n${message}`,
  ].join('\n');
}

function extractAiReply(data: unknown) {
  if (!isPlainObject(data)) return undefined;

  if (typeof data.output_text === 'string') return data.output_text;
  if (typeof data.text === 'string') return data.text;

  if (Array.isArray(data.choices)) {
    for (const choice of data.choices) {
      if (!isPlainObject(choice)) continue;
      if (typeof choice.text === 'string') return choice.text;

      const message = choice.message;
      if (!isPlainObject(message)) continue;
      const content = message.content;

      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        const text = content
          .map((item) => (isPlainObject(item) && typeof item.text === 'string' ? item.text : ''))
          .join('')
          .trim();
        if (text) return text;
      }
    }
  }

  return undefined;
}

function cleanPlainTextReply(reply: string) {
  return reply
    .replace(/```[a-zA-Z0-9_-]*\n?/g, '')
    .replace(/```/g, '')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .trim();
}

function parseJsonResponse(text: string) {
  if (!text) return {};

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HttpError(502, 'AI guide returned an invalid response.');
  }
}

async function requestAiReply(prompt: string) {
  const config = getAiProviderConfig();
  const response = await fetch(`${config.openaiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.modelId,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.55,
      max_tokens: 650,
      stream: false,
    }),
  });

  const text = await response.text();
  const data = parseJsonResponse(text);

  if (!response.ok) {
    console.error('AI provider request failed.', response.status, data);
    throw new HttpError(502, 'AI guide is unavailable right now.');
  }

  const reply = extractAiReply(data);
  if (!reply?.trim()) throw new HttpError(502, 'AI guide did not return a reply.');

  return cleanPlainTextReply(reply);
}

function pruneMessagesForUser(messages: DirectMessage[], userId: string) {
  const related = messages
    .filter((message) => message.fromUserId === userId || message.toUserId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const keepRelatedIds = new Set(related.slice(0, maxMessagesPerUser).map((message) => message.id));

  return messages.filter((message) => {
    if (message.fromUserId !== userId && message.toUserId !== userId) return true;
    return keepRelatedIds.has(message.id);
  });
}

async function saveDataImage(dataUrl: unknown, folder: 'avatars' | 'posts') {
  if (dataUrl === undefined) return undefined;
  if (typeof dataUrl !== 'string') throw new HttpError(400, 'Image must be a data URL string.');
  if (!dataUrl.trim()) throw new HttpError(400, 'Image cannot be empty.');

  const match = dataUrl.match(/^data:image\/(png|jpe?g|webp);base64,([a-zA-Z0-9+/=]+)$/);
  if (!match) throw new HttpError(400, 'Only png, jpg, jpeg, or webp images are supported.');

  const base64 = match[2];
  const estimatedBytes = Math.floor((base64.length * 3) / 4);
  if (estimatedBytes <= 0) throw new HttpError(400, 'Image cannot be empty.');
  if (estimatedBytes > maxImageBytes + 4096) throw new HttpError(400, 'Image must be smaller than 4MB.');

  const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.byteLength <= 0) throw new HttpError(400, 'Image cannot be empty.');
  if (buffer.byteLength > maxImageBytes) throw new HttpError(400, 'Image must be smaller than 4MB.');

  const targetDir = path.join(uploadsDir, folder);
  await fs.mkdir(targetDir, { recursive: true });
  const fileName = `${makeId(folder)}.${extension}`;
  await fs.writeFile(path.join(targetDir, fileName), buffer);
  return `/uploads/${folder}/${fileName}`;
}

function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

function createRateLimiter(name: string, maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${name}:${ip}`;
    const current = rateBuckets.get(key);

    if (!current || current.resetAt <= now) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;
    if (current.count > maxRequests) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    next();
  };
}

function cleanupRateBuckets() {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets.entries()) {
    if (bucket.resetAt <= now) rateBuckets.delete(key);
  }
}

async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const rawToken = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!rawToken || !idPattern.test(rawToken)) {
    res.status(401).json({ error: 'Please log in first.' });
    return;
  }

  const db = await readDb();
  const session = db.sessions.find((item) => item.token === rawToken);
  const user = session ? db.users.find((item) => item.id === session.userId) : undefined;

  if (!session || !user) {
    res.status(401).json({ error: 'Session expired.' });
    return;
  }

  req.user = user;
  req.token = rawToken;
  next();
}

const app = express();
const authRateLimit = createRateLimiter('auth', 30, 10 * 60 * 1000);
const writeRateLimit = createRateLimiter('write', 30, 60 * 1000);
const aiRateLimit = createRateLimiter('ai', 20, 60 * 1000);

app.disable('x-powered-by');
app.set('trust proxy', 1);

setInterval(cleanupRateBuckets, 60 * 1000).unref();

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');

  const origin = req.header('origin');
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

app.use(express.json({ limit: '6mb' }));
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  const maybeError = err as { type?: string; message?: string; status?: number };

  if (maybeError.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body is too large.' });
    return;
  }

  if (err instanceof SyntaxError) {
    res.status(400).json({ error: 'Invalid JSON body.' });
    return;
  }

  next(err);
});
app.use('/uploads', express.static(uploadsDir, {
  fallthrough: false,
  immutable: true,
  maxAge: '7d',
}));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', authRateLimit, asyncRoute(async (req, res) => {
  const body = requestBody(req);
  const username = readString(body, 'username', {
    max: 20,
    label: 'Username',
    pattern: /^[a-z0-9_]{3,20}$/i,
  }).toLowerCase();
  const password = readString(body, 'password', { min: 6, max: 128, label: 'Password' });
  const displayName = readOptionalString(body, 'displayName', { max: 24, label: 'Display name' }) ?? username;

  const db = await readDb();
  if (db.users.some((user) => user.username === username)) {
    res.status(409).json({ error: 'This username is already taken.' });
    return;
  }

  const { salt, passwordHash } = hashPassword(password);
  const now = new Date().toISOString();
  const user: User = {
    id: makeId('user'),
    username,
    displayName,
    salt,
    passwordHash,
    createdAt: now,
  };
  const token = makeId('session');

  db.users.push(user);
  db.sessions.push({ token, userId: user.id, createdAt: now });
  await writeDb(db);

  res.status(201).json({ token, user: publicUser(user) });
}));

app.post('/api/auth/login', authRateLimit, asyncRoute(async (req, res) => {
  const body = requestBody(req);
  const username = readString(body, 'username', {
    max: 20,
    label: 'Username',
    pattern: /^[a-z0-9_]{3,20}$/i,
  }).toLowerCase();
  const password = readString(body, 'password', { min: 6, max: 128, label: 'Password' });
  const db = await readDb();
  const user = db.users.find((item) => item.username === username);

  if (!user || !verifyPassword(password, user)) {
    res.status(401).json({ error: 'Wrong username or password.' });
    return;
  }

  const token = makeId('session');
  db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  await writeDb(db);

  res.json({ token, user: publicUser(user) });
}));

app.get('/api/auth/me', requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  res.json({ user: publicUser(req.user!) });
}));

app.post('/api/auth/logout', requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  const db = await readDb();
  db.sessions = db.sessions.filter((session) => session.token !== req.token);
  await writeDb(db);
  res.json({ ok: true });
}));

app.patch('/api/profile', writeRateLimit, requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  const body = requestBody(req);
  const displayName = readOptionalString(body, 'displayName', { max: 24, label: 'Display name' });
  const db = await readDb();
  const user = db.users.find((item) => item.id === req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (displayName) user.displayName = displayName;
  const avatarUrl = await saveDataImage(body.avatarDataUrl, 'avatars');
  if (avatarUrl) user.avatarUrl = avatarUrl;

  db.posts = db.posts.map((post) => {
    if (post.userId !== user.id) return post;
    return {
      ...post,
      authorName: user.displayName,
      authorAvatarUrl: user.avatarUrl,
      comments: post.comments.map((comment) => (
        comment.userId === user.id
          ? { ...comment, authorName: user.displayName, authorAvatarUrl: user.avatarUrl }
          : comment
      )),
    };
  });

  await writeDb(db);
  res.json({ user: publicUser(user) });
}));

app.get('/api/community/posts', asyncRoute(async (_req, res) => {
  const db = await readDb();
  res.json({
    posts: [...db.posts]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, maxReturnedPosts),
  });
}));

app.post('/api/community/posts', writeRateLimit, requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  const body = requestBody(req);
  const content = readString(body, 'content', { max: 600, label: 'Post content' });
  const locationName = readOptionalString(body, 'locationName', { max: 40, label: 'Location' });
  const db = await readDb();
  const imageUrl = await saveDataImage(body.imageDataUrl, 'posts');
  const post: CommunityPost = {
    id: makeId('post'),
    userId: req.user!.id,
    authorName: req.user!.displayName,
    authorAvatarUrl: req.user!.avatarUrl,
    content,
    imageUrl,
    locationName,
    createdAt: new Date().toISOString(),
    comments: [],
  };

  db.posts.push(post);
  await writeDb(db);
  res.status(201).json({ post });
}));

app.post('/api/community/posts/:postId/comments', writeRateLimit, requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  const postId = readParamId(req, 'postId', 'Post id');
  const body = requestBody(req);
  const content = readString(body, 'content', { max: 300, label: 'Comment' });
  const db = await readDb();
  const post = db.posts.find((item) => item.id === postId);
  if (!post) {
    res.status(404).json({ error: 'Post not found.' });
    return;
  }

  const comment: CommunityComment = {
    id: makeId('comment'),
    postId: post.id,
    userId: req.user!.id,
    authorName: req.user!.displayName,
    authorAvatarUrl: req.user!.avatarUrl,
    content,
    createdAt: new Date().toISOString(),
  };

  post.comments.push(comment);
  post.comments = post.comments.slice(-maxPostComments);
  await writeDb(db);
  res.status(201).json({ comment });
}));

app.get('/api/messages/conversations', requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  const db = await readDb();
  const userId = req.user!.id;
  const conversations = new Map<string, DirectMessage>();

  db.messages
    .filter((message) => message.fromUserId === userId || message.toUserId === userId)
    .forEach((message) => {
      const otherUserId = message.fromUserId === userId ? message.toUserId : message.fromUserId;
      const current = conversations.get(otherUserId);
      if (!current || current.createdAt.localeCompare(message.createdAt) < 0) {
        conversations.set(otherUserId, message);
      }
    });

  res.json({
    conversations: [...conversations.entries()]
      .map(([otherUserId, lastMessage]) => ({
        participant: publicUserById(db, otherUserId),
        lastMessage,
        updatedAt: lastMessage.createdAt,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  });
}));

app.get('/api/messages/:otherUserId', requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  const db = await readDb();
  const userId = req.user!.id;
  const otherUserId = readParamId(req, 'otherUserId', 'User id');

  if (!db.users.some((user) => user.id === otherUserId)) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const messages = db.messages
    .filter((message) => (
      (message.fromUserId === userId && message.toUserId === otherUserId)
      || (message.fromUserId === otherUserId && message.toUserId === userId)
    ))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  res.json({ participant: publicUserById(db, otherUserId), messages });
}));

app.post('/api/messages', writeRateLimit, requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  const body = requestBody(req);
  const db = await readDb();
  const toUserId = readId(body, 'toUserId', 'Recipient');
  const content = readString(body, 'content', { max: 500, label: 'Message' });

  if (toUserId === req.user!.id) {
    res.status(400).json({ error: 'You cannot message yourself.' });
    return;
  }

  if (!db.users.some((user) => user.id === toUserId)) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const message: DirectMessage = {
    id: makeId('message'),
    fromUserId: req.user!.id,
    toUserId,
    content,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(message);
  db.messages = pruneMessagesForUser(db.messages, req.user!.id);
  db.messages = pruneMessagesForUser(db.messages, toUserId);
  await writeDb(db);
  res.status(201).json({ message });
}));

app.post('/api/ai/chat', aiRateLimit, asyncRoute(async (req, res) => {
  const body = requestBody(req);
  const message = readString(body, 'message', { max: 500, label: 'AI message' });
  const context = readAiContext(body);
  const history = readAiHistory(body);
  const prompt = buildAiPrompt(message, context, history);

  try {
    res.json({ reply: await requestAiReply(prompt) });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('AI guide request failed.', error);
    throw new HttpError(502, 'AI guide is unavailable right now.');
  }
}));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Server error.' });
});

const distDir = path.join(projectRoot, 'dist');
const clientBase = '/temple_bridge_human_center';
app.use(clientBase, express.static(distDir));
app.use(express.static(distDir));
app.get(`${clientBase}/*`, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

ensureStorage().then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Temple Bridge API listening on ${port}`);
  });
});
