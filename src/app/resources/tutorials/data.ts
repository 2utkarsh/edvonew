import { publicFetchJson } from '@/lib/backend-api';

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
  tutorialDocumentName: string;
  tutorialDocumentUrl: string;
  order?: number;
}

export interface TutorialCategoryOption {
  id: string;
  label: string;
}

type PublicListResponse<T> = {
  success: boolean;
  data: T[];
};

export async function fetchTutorials(): Promise<TutorialItem[]> {
  const payload = await publicFetchJson<PublicListResponse<Record<string, unknown>>>('/api/tutorials');
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.map((item) => ({
    id: String(item.id || item.slug),
    slug: String(item.slug || item.id),
    title: String(item.title || 'Untitled Tutorial'),
    description: String(item.description || ''),
    tool: String(item.tool || 'Tool'),
    duration: String(item.duration || '1h 00m'),
    level: String(item.level || 'Beginner'),
    thumbnail: String(item.thumbnail || '/images/edvo-official-logo-v10.png'),
    category: String(item.category || 'General'),
    tutorialDocumentName: String(item.tutorialDocumentName || `${String(item.slug || item.id || 'tutorial')}.txt`),
    tutorialDocumentUrl: String(item.tutorialDocumentUrl || ''),
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
