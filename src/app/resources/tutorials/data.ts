export interface TutorialItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  tool: string;
  duration: string;
  level: string;
  thumbnail: string;
  category: string;
  order?: number;
}

export interface TutorialCategoryOption {
  id: string;
  label: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

export async function fetchTutorials(): Promise<TutorialItem[]> {
  const response = await fetch(`${apiBase}/api/tutorials`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Failed to load tutorials');
  }
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.map((item: Record<string, unknown>) => ({
    id: String(item.id || item.slug),
    slug: String(item.slug || item.id),
    title: String(item.title || 'Untitled Tutorial'),
    description: String(item.description || ''),
    tool: String(item.tool || 'Tool'),
    duration: String(item.duration || '1h 00m'),
    level: String(item.level || 'Beginner'),
    thumbnail: String(item.thumbnail || '/images/edvo-official-logo-v10.png'),
    category: String(item.category || 'General'),
    order: Number(item.order || 0),
  }));
}

export function deriveTutorialCategories(items: TutorialItem[]): TutorialCategoryOption[] {
  const seen = new Set<string>();
  const ordered = items
    .map((item) => item.category)
    .filter((category) => {
      const normalized = category.trim();
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });

  return [{ id: 'all', label: 'All' }, ...ordered.map((category) => ({ id: category, label: category }))];
}
