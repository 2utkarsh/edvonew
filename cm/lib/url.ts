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

const DEFAULT_BASE_PATH = '/live';

export const APP_BASE_PATH = normalizeBase(process.env.NEXT_PUBLIC_BASE_PATH || DEFAULT_BASE_PATH);
export const API_BASE_URL = normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL || APP_BASE_PATH);

export function withBasePath(path: string) {
  return joinBase(APP_BASE_PATH, path);
}

export function roomPath(roomName: string) {
  return `/room/${encodeURIComponent(String(roomName || '').trim())}`;
}

export function roomHref(roomName: string, search = '', hash = '') {
  const normalizedSearch = !search ? '' : search.startsWith('?') ? search : `?${search}`;
  const normalizedHash = !hash ? '' : hash.startsWith('#') ? hash : `#${hash}`;
  return `${withBasePath(roomPath(roomName))}${normalizedSearch}${normalizedHash}`;
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
