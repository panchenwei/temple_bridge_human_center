export function publicAsset(path: string) {
  if (!path || /^(https?:|data:|blob:)/.test(path)) return path;
  if (path.startsWith('/uploads/')) return path;

  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  return `${normalizedBase}${normalizedPath}`;
}
