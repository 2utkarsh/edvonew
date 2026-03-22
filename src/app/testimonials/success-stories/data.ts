export interface SuccessStoryItem {
  id: string;
  name: string;
  location: string;
  beforeRole: string;
  afterRole: string;
  companyLogo: string;
  avatar: string;
  linkedinUrl: string;
  category: string;
  tags: string[];
  status: 'active' | 'inactive';
  order: number;
}

export interface SuccessStoryCategoryOption {
  id: string;
  label: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

export async function fetchSuccessStories(): Promise<SuccessStoryItem[]> {
  const response = await fetch(`${apiBase}/api/job-success-stories`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Failed to load success stories');
  }

  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.map((item: Record<string, unknown>) => ({
    id: String(item.id || ''),
    name: String(item.name || 'EDVO Learner'),
    location: String(item.location || ''),
    beforeRole: String(item.beforeRole || ''),
    afterRole: String(item.afterRole || ''),
    companyLogo: String(item.companyLogo || '/images/edvo-official-logo-v10.png'),
    avatar: String(item.avatar || '/images/edvo-official-logo-v10.png'),
    linkedinUrl: String(item.linkedinUrl || '#'),
    category: String(item.category || 'Career Growth'),
    tags: Array.isArray(item.tags) ? item.tags.map((tag: unknown) => String(tag)) : [],
    status: item.status === 'inactive' ? 'inactive' : 'active',
    order: Number(item.order || 0),
  }));
}

export async function fetchSuccessStoryCategories(): Promise<SuccessStoryCategoryOption[]> {
  const response = await fetch(`${apiBase}/api/job-success-story-categories`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Failed to load success story categories');
  }

  const items = Array.isArray(payload?.data) ? payload.data : [];
  return [{ id: 'All', label: 'All Categories' }].concat(
    items.map((item: Record<string, unknown>) => ({
      id: String(item.name || item.id || ''),
      label: String(item.name || item.label || 'Career Growth'),
    }))
  );
}
