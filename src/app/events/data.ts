import { authFetchJson, publicFetchJson } from '@/lib/backend-api';

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
  liveUrl?: string;
  recordingUrl?: string;
  instructorName?: string;
  maxParticipants?: number;
  registeredCount?: number;
  requirements?: string[];
  tags?: string[];
  scheduledAt?: string;
}

export interface EventCategoryOption {
  id: string;
  label: string;
}

export interface EventDetailResponse {
  event: EventItem;
  registration: {
    id: string;
    status: string;
    registeredAt?: string;
    joinedAt?: string;
  } | null;
  viewerRole: 'student' | 'instructor' | 'admin' | null;
}

type EventsPayload = {
  success: boolean;
  data: {
    events: Record<string, unknown>[];
  };
};

type EventDetailPayload = {
  success: boolean;
  data: {
    event: Record<string, unknown>;
    registration: EventDetailResponse['registration'];
    viewerRole: EventDetailResponse['viewerRole'];
  };
};

type CategoryPayload = {
  success: boolean;
  data: Record<string, unknown>[];
};

function mapEvent(item: any): EventItem {
  const scheduledAt = item.scheduledAt ? new Date(item.scheduledAt) : null;
  const normalizedTime = scheduledAt && !Number.isNaN(scheduledAt.getTime())
    ? scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : item.time || '';

  return {
    id: item.id || String(item._id || ''),
    slug: item.slug || '',
    title: item.title || 'Untitled Event',
    description: item.description || '',
    date: scheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt.toISOString().split('T')[0] : item.date || '',
    time: normalizedTime,
    location: item.location || item.liveUrl || 'Online',
    type: (['webinar', 'workshop', 'hackathon'].includes(item.type) ? item.type : 'webinar') as EventType,
    image: item.thumbnail || item.banner || item.image || '/images/edvo-official-logo-v10.png',
    status: item.status === 'live' || item.status === 'Live' ? 'Live' : item.status === 'ended' || item.status === 'Ended' ? 'Ended' : 'Upcoming',
    visibility: item.status === 'draft' || item.status === 'cancelled' || item.visibility === 'inactive' ? 'inactive' : 'active',
    category: item.tags?.[0] || item.category || 'General',
    order: Number(item.order || 0),
    speakers: item.speakers || (item.instructorName ? [{ name: item.instructorName, role: 'Instructor', avatar: '/images/edvo-official-logo-v10.png' }] : []),
    prizes: item.prizes || undefined,
    duration: item.duration ? `${item.duration} minutes` : item.durationLabel || undefined,
    liveUrl: item.liveUrl || undefined,
    recordingUrl: item.recordingUrl || undefined,
    instructorName: item.instructorName || undefined,
    maxParticipants: item.maxParticipants || undefined,
    registeredCount: item.registeredCount || 0,
    requirements: Array.isArray(item.requirements) ? item.requirements : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    scheduledAt: item.scheduledAt || undefined,
  };
}

export async function fetchEvents(type?: EventType): Promise<EventItem[]> {
  const payload = await publicFetchJson<EventsPayload>(type ? `/api/v1/events?type=${type}` : '/api/v1/events');
  const items = Array.isArray(payload?.data?.events) ? payload.data.events : [];
  return items.map(mapEvent);
}

export async function fetchEventById(id: string, token?: string | null): Promise<EventDetailResponse> {
  const payload = token
    ? await authFetchJson<EventDetailPayload>(`/api/v1/events/${id}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } })
    : await publicFetchJson<EventDetailPayload>(`/api/v1/events/${id}`);

  return {
    event: mapEvent(payload?.data?.event || {}),
    registration: payload?.data?.registration || null,
    viewerRole: payload?.data?.viewerRole || null,
  };
}

export async function fetchEventCategories(type: EventType): Promise<EventCategoryOption[]> {
  const payload = await publicFetchJson<CategoryPayload>(`/api/event-categories?type=${type}`);
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return [{ id: 'all', label: 'All Categories' }].concat(items.map((item) => ({ id: String(item.name || item.id || ''), label: String(item.name || 'General') })));
}
