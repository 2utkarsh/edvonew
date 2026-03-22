export interface ChallengeItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  phase: 'ongoing' | 'completed';
  visibility: 'active' | 'inactive';
  order: number;
  prize: string;
  participants: string;
  href: string;
  badge?: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

export async function fetchChallenges(): Promise<ChallengeItem[]> {
  const response = await fetch(`${apiBase}/api/challenges`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || 'Failed to load challenges');
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.map((item: Record<string, unknown>) => ({ id: String(item.id || ''), slug: String(item.slug || ''), title: String(item.title || 'Untitled Challenge'), description: String(item.description || ''), image: String(item.image || '/images/edvo-official-logo-v10.png'), category: String(item.category || 'General'), phase: item.phase === 'completed' ? 'completed' : 'ongoing', visibility: item.visibility === 'inactive' ? 'inactive' : 'active', order: Number(item.order || 0), prize: String(item.prize || ''), participants: String(item.participants || ''), href: String(item.href || '/challenges'), badge: item.badge ? String(item.badge) : undefined }));
}
