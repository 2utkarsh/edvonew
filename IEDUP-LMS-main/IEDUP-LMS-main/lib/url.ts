function normalizeBase(value: string) {
  const trimmed = String(value || '').trim();
  if (!trimmed || trimmed === '/') return '';
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function joinBase(base: string, path: string) {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  if (!base) return safePath;
  return `${base}${safePath}`;
}

export const APP_BASE_PATH = normalizeBase(process.env.NEXT_PUBLIC_BASE_PATH || '');
export const API_BASE_URL = normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL || APP_BASE_PATH);

export function withBasePath(path: string) {
  return joinBase(APP_BASE_PATH, path);
}

export function apiUrl(path: string) {
  const lowerBase = API_BASE_URL.toLowerCase();
  const isBackendBase = lowerBase.includes('/backend') || lowerBase.includes('backend.');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (isBackendBase && normalizedPath.startsWith('/api/')) {
    // LMS APIs live in the LMS app; avoid CORS by keeping them same-origin.
    return joinBase(APP_BASE_PATH, normalizedPath);
  }

  return joinBase(API_BASE_URL, normalizedPath);
}
