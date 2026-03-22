export type EventType = 'webinar' | 'workshop' | 'hackathon';
export type EventLifecycle = 'Upcoming' | 'Live' | 'Ended';

export interface EventSpeaker {
  name: string;
  role: string;
  avatar: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: EventType;
  image: string;
  status: EventLifecycle;
  visibility: 'active' | 'inactive';
  category: string;
  order: number;
  speakers?: EventSpeaker[];
  prizes?: string;
  duration?: string;
}

export interface EventCategoryOption {
  id: string;
  label: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

export async function fetchEvents(type: EventType): Promise<EventItem[]> {
  const response = await fetch(`${apiBase}/api/events?type=${type}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || 'Failed to load events');
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.map((item: Record<string, unknown>) => ({
    id: String(item.id || ''), slug: String(item.slug || ''), title: String(item.title || 'Untitled Event'), description: String(item.description || ''), date: String(item.date || ''), time: String(item.time || ''), location: String(item.location || ''), type: (['workshop', 'hackathon'].includes(String(item.type)) ? item.type : 'webinar') as EventType, image: String(item.image || '/images/edvo-official-logo-v10.png'), status: (['Live', 'Ended'].includes(String(item.status)) ? item.status : 'Upcoming') as EventLifecycle, visibility: item.visibility === 'inactive' ? 'inactive' : 'active', category: String(item.category || 'General'), order: Number(item.order || 0), speakers: Array.isArray(item.speakers) ? item.speakers.map((speaker: any) => ({ name: String(speaker?.name || 'Speaker'), role: String(speaker?.role || ''), avatar: String(speaker?.avatar || '/images/edvo-official-logo-v10.png') })) : [], prizes: item.prizes ? String(item.prizes) : undefined, duration: item.duration ? String(item.duration) : undefined,
  }));
}

export async function fetchEventCategories(type: EventType): Promise<EventCategoryOption[]> {
  const response = await fetch(`${apiBase}/api/event-categories?type=${type}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || 'Failed to load event categories');
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return [{ id: 'all', label: 'All Categories' }].concat(items.map((item: Record<string, unknown>) => ({ id: String(item.name || item.id || ''), label: String(item.name || 'General') })));
}
