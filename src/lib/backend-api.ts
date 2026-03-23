export const defaultApiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

export function getStoredAuthToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('auth_token') || '';
}

export function getStoredAuthUser() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function publicFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${defaultApiBase}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Request failed');
  }

  return payload as T;
}

export async function authFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredAuthToken();
  if (!token) {
    throw new Error('Please log in to continue');
  }

  const response = await fetch(`${defaultApiBase}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Request failed');
  }

  return payload as T;
}

export async function loadScript(src: string) {
  if (typeof window === 'undefined') return false;
  if (document.querySelector(`script[src="${src}"]`)) return true;

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
