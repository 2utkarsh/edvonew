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
  objective: string;
  duration: string;
  difficulty: string;
  tools: string[];
  deliverables: string[];
  steps: string[];
  actionUrl: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

function mapChallenge(item: Record<string, unknown>): ChallengeItem {
  return {
    id: String(item.id || ''),
    slug: String(item.slug || ''),
    title: String(item.title || 'Untitled Challenge'),
    description: String(item.description || ''),
    image: String(item.image || '/images/edvo-official-logo-v10.png'),
    category: String(item.category || 'General'),
    phase: item.phase === 'completed' ? 'completed' : 'ongoing',
    visibility: item.visibility === 'inactive' ? 'inactive' : 'active',
    order: Number(item.order || 0),
    prize: String(item.prize || ''),
    participants: String(item.participants || ''),
    href: String(item.href || '/challenges'),
    badge: item.badge ? String(item.badge) : undefined,
    objective: String(item.objective || item.description || ''),
    duration: String(item.duration || ''),
    difficulty: String(item.difficulty || 'Intermediate'),
    tools: Array.isArray(item.tools) ? item.tools.map((tool) => String(tool || '')).filter(Boolean) : [],
    deliverables: Array.isArray(item.deliverables) ? item.deliverables.map((entry) => String(entry || '')).filter(Boolean) : [],
    steps: Array.isArray(item.steps) ? item.steps.map((entry) => String(entry || '')).filter(Boolean) : [],
    actionUrl: String(item.actionUrl || '/courses'),
  };
}

export async function fetchChallenges(): Promise<ChallengeItem[]> {
  const response = await fetch(`${apiBase}/api/challenges`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || 'Failed to load challenges');
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.map((item: Record<string, unknown>) => mapChallenge(item));
}

export async function fetchChallengeBySlug(slug: string): Promise<ChallengeItem> {
  const response = await fetch(`${apiBase}/api/challenges/${slug}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || 'Failed to load challenge');
  return mapChallenge((payload?.data || {}) as Record<string, unknown>);
}
