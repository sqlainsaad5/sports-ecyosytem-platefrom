/** Paths like `/uploads/...` work with the Vite dev proxy to the API server. */
export function publicAssetUrl(path) {
  if (!path || typeof path !== 'string') return '';
  const t = path.trim();
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}
