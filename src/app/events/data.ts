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

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function fetchEvents(type?: EventType): Promise<EventItem[]> {
  const url = type ? `${apiBase}/api/v1/events?type=${type}` : `${apiBase}/api/v1/events`;
  const response = await fetch(url, { 
    headers: { Accept: 'application/json' }, 
    cache: 'no-store' 
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || 'Failed to load events');
  
  const items = Array.isArray(payload?.data?.events) ? payload.data.events : [];
  return items.map((item: any) => ({
    id: item.id || String(item._id || ''),
    slug: item.slug || '',
    title: item.title || 'Untitled Event',
    description: item.description || '',
    date: item.scheduledAt ? new Date(item.scheduledAt).toISOString().split('T')[0] : '',
    time: item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString() : '',
    location: item.liveUrl || 'Online',
    type: (['webinar', 'workshop', 'hackathon'].includes(item.type) ? item.type : 'webinar') as EventType,
    image: item.thumbnail || item.banner || '/images/edvo-official-logo-v10.png',
    status: item.status === 'live' ? 'Live' : item.status === 'ended' ? 'Ended' : 'Upcoming',
    visibility: item.status === 'draft' || item.status === 'cancelled' ? 'inactive' : 'active',
    category: item.tags?.[0] || 'General',
    order: 0,
    speakers: item.instructorName ? [{ name: item.instructorName, role: 'Instructor', avatar: '' }] : [],
    prizes: item.type === 'hackathon' ? 'Prizes TBA' : undefined,
    duration: item.duration ? `${item.duration} minutes` : undefined,
  }));
}

export async function fetchEventCategories(type: EventType): Promise<EventCategoryOption[]> {
  const response = await fetch(`${apiBase}/api/event-categories?type=${type}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || 'Failed to load event categories');
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return [{ id: 'all', label: 'All Categories' }].concat(items.map((item: Record<string, unknown>) => ({ id: String(item.name || item.id || ''), label: String(item.name || 'General') })));
}
