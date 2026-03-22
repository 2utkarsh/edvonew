export interface GuideItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  track: string;
  steps: number;
  highlight: string;
  icon: string;
  thumbnail: string;
  roadmapSteps: string[];
  roadmapFileName: string;
  roadmapFileUrl: string;
  order?: number;
}

export interface GuideCategoryOption {
  id: string;
  label: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

export async function fetchGuides(): Promise<GuideItem[]> {
  const response = await fetch(`${apiBase}/api/career-guides`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Failed to load guides');
  }
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.map((item: Record<string, unknown>) => ({
    id: String(item.id || item.slug),
    slug: String(item.slug || item.id),
    title: String(item.title || 'Untitled Guide'),
    description: String(item.description || ''),
    track: String(item.track || item.category || 'Career Growth'),
    steps: Number(item.steps || 0),
    highlight: String(item.highlight || 'Featured'),
    icon: String(item.icon || 'Map'),
    thumbnail: String(item.thumbnail || '/images/edvo-official-logo-v10.png'),
    roadmapSteps: Array.isArray(item.roadmapSteps) ? item.roadmapSteps.map((step) => String(step || '')).filter(Boolean) : [],
    roadmapFileName: String(item.roadmapFileName || `${String(item.slug || item.id || 'guide')}-roadmap.txt`),
    roadmapFileUrl: String(item.roadmapFileUrl || ''),
    order: Number(item.order || 0),
  }));
}

export function deriveGuideCategories(items: GuideItem[]): GuideCategoryOption[] {
  const seen = new Set<string>();
  const ordered = items
    .map((item) => item.track)
    .filter((track) => {
      const normalized = track.trim();
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });

  return [{ id: 'All Tracks', label: 'All Tracks' }, ...ordered.map((track) => ({ id: track, label: track }))];
}
