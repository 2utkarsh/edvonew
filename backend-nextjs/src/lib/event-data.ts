import { slugify } from '@/lib/query';

export type PublicEventType = 'webinar' | 'workshop' | 'hackathon';
export type PublicEventVisibility = 'active' | 'inactive';
export type PublicEventLifecycle = 'Upcoming' | 'Live' | 'Ended';

export interface PublicEventSpeaker {
  name: string;
  role: string;
  avatar: string;
}

export interface PublicEventRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  liveUrl?: string;
  type: PublicEventType;
  image: string;
  status: PublicEventLifecycle;
  visibility: PublicEventVisibility;
  category: string;
  order: number;
  speakers?: PublicEventSpeaker[];
  prizes?: string;
  duration?: string;
}

export const MOCK_EVENTS: PublicEventRecord[] = [
  {
    id: 'future-of-generative-ai-in-enterprise-solutions',
    slug: 'future-of-generative-ai-in-enterprise-solutions',
    title: 'Future of Generative AI in Enterprise Solutions',
    description: 'Join industry experts to discuss how LLMs are transforming enterprise-grade software development and automation.',
    date: '15th March, 2026',
    time: '07:30 PM IST',
    location: 'Online (Zoom)',
    type: 'webinar',
    image: 'https://images.unsplash.com/photo-1591115765373-520b7a217217?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming',
    visibility: 'active',
    category: 'AI & Enterprise',
    order: 1,
    speakers: [
      { name: 'Dr. Arpit Jain', role: 'AI Research Lead', avatar: 'https://i.pravatar.cc/100?u=12' },
      { name: 'Sarah Chen', role: 'CTO @ Innovate', avatar: 'https://i.pravatar.cc/100?u=34' },
    ],
  },
];

export function mapEventDocumentToPublicEvent(item: any): PublicEventRecord {
  return {
    id: String(item._id || item.id || item.slug),
    slug: String(item.slug || slugify(String(item.title || item._id || 'event'))),
    title: String(item.title || 'Untitled Event'),
    description: String(item.description || ''),
    date: String(item.date || ''),
    time: String(item.time || ''),
    location: String(item.location || ''),
    liveUrl: item.liveUrl ? String(item.liveUrl) : undefined,
    type: (['webinar', 'workshop', 'hackathon'].includes(String(item.type)) ? item.type : 'webinar') as PublicEventType,
    image: String(item.image || '/images/edvo-official-logo-v10.png'),
    status: (['Live', 'Ended'].includes(String(item.status)) ? item.status : 'Upcoming') as PublicEventLifecycle,
    visibility: item.visibility === 'inactive' ? 'inactive' : 'active',
    category: String(item.category || 'General'),
    order: Number(item.order || 0),
    speakers: Array.isArray(item.speakers)
      ? item.speakers.map((speaker: any) => ({
          name: String(speaker?.name || 'Speaker'),
          role: String(speaker?.role || ''),
          avatar: String(speaker?.avatar || '/images/edvo-official-logo-v10.png'),
        }))
      : [],
    prizes: item.prizes ? String(item.prizes) : undefined,
    duration: item.duration ? String(item.duration) : undefined,
  };
}
