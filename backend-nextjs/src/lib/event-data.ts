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
  {
    id: 'career-pivot-from-non-tech-to-data-science',
    slug: 'career-pivot-from-non-tech-to-data-science',
    title: 'Career Pivot: From Non-Tech to Data Science',
    description: 'Listen to someone who actually did it. A real-world journey of transitioning into data analytics from a sales background.',
    date: '20th March, 2026',
    time: '06:00 PM IST',
    location: 'Online (YouTube Live)',
    type: 'webinar',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
    status: 'Live',
    visibility: 'active',
    category: 'Career Transition',
    order: 2,
    speakers: [{ name: 'Rahul Varma', role: 'Data Scientist @ Meta', avatar: 'https://i.pravatar.cc/100?u=56' }],
  },
  {
    id: 'mastering-sql-for-senior-data-roles',
    slug: 'mastering-sql-for-senior-data-roles',
    title: 'Mastering SQL for Senior Data Roles',
    description: 'Deep dive into window functions, recursive CTEs, and query optimization for high-scale data environments.',
    date: '25th March, 2026',
    time: '08:00 PM IST',
    location: 'Online (Zoom)',
    type: 'webinar',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming',
    visibility: 'active',
    category: 'Data Leadership',
    order: 3,
    speakers: [{ name: 'Amit Singh', role: 'Database Architect', avatar: 'https://i.pravatar.cc/100?u=78' }],
  },
  {
    id: 'building-your-first-llm-powered-app',
    slug: 'building-your-first-llm-powered-app',
    title: 'Building Your First LLM-Powered App',
    description: 'A dedicated 4-hour hands-on session where you will build and deploy a RAG-based chatbot using LangChain and OpenAI.',
    date: '18th March, 2026',
    time: '11:00 AM IST',
    location: 'Online (Discord Live)',
    type: 'workshop',
    image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming',
    visibility: 'active',
    category: 'LLM Engineering',
    order: 1,
    duration: '4 Hours',
  },
  {
    id: 'advanced-data-cleaning-with-python-and-pandas',
    slug: 'advanced-data-cleaning-with-python-and-pandas',
    title: 'Advanced Data Cleaning with Python & Pandas',
    description: 'Stop spending 80% of your time cleaning data. Learn advanced vectorized operations to handle messy real-world datasets.',
    date: '22nd March, 2026',
    time: '02:00 PM IST',
    location: 'Online (Zoom)',
    type: 'workshop',
    image: 'https://images.unsplash.com/photo-1551288049-bbbda536ad0a?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming',
    visibility: 'active',
    category: 'Data Analytics',
    order: 2,
    duration: '3 Hours',
  },
  {
    id: 'deployment-mastery-docker-and-aws-for-analysts',
    slug: 'deployment-mastery-docker-and-aws-for-analysts',
    title: 'Deployment Mastery: Docker & AWS for Analysts',
    description: 'Learn how to containerize your dashboards and deploy them to the cloud for real-world business impact.',
    date: '28th March, 2026',
    time: '04:00 PM IST',
    location: 'Online (Google Meet)',
    type: 'workshop',
    image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming',
    visibility: 'active',
    category: 'Cloud & Deployment',
    order: 3,
    duration: '5 Hours',
  },
  {
    id: 'generative-ai-innovation-sprint',
    slug: 'generative-ai-innovation-sprint',
    title: 'Generative AI Innovation Sprint',
    description: 'Build the next generation of AI productivity tools. Participants get exclusive access to enterprise GPUs and mentorship from top AI labs.',
    date: '10-12 April, 2026',
    time: '48 Hours',
    location: 'Hybrid (Bangalore + Online)',
    type: 'hackathon',
    image: 'https://images.unsplash.com/photo-1504384308090-c89eececbf83?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming',
    visibility: 'active',
    category: 'Generative AI',
    order: 1,
    prizes: 'Rs5,00,000 + Funding',
  },
  {
    id: 'data-for-good-global-challenge',
    slug: 'data-for-good-global-challenge',
    title: 'Data-for-Good Global Challenge',
    description: 'Solve real-world sustainability problems using satellite data and machine learning. A global competition for data scientists.',
    date: '5-7 May, 2026',
    time: '72 Hours',
    location: 'Remote Only',
    type: 'hackathon',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming',
    visibility: 'active',
    category: 'Data for Good',
    order: 2,
    prizes: 'Rs2,50,000 + Internship',
  },
  {
    id: 'low-code-automation-builder-cup',
    slug: 'low-code-automation-builder-cup',
    title: 'Low-Code Automation Builder Cup',
    description: 'A rapid prototyping hackathon focused on building complex business workflows using modern low-code/no-code stacks.',
    date: '20th April, 2026',
    time: '24 Hours',
    location: 'Online',
    type: 'hackathon',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming',
    visibility: 'active',
    category: 'Automation',
    order: 3,
    prizes: 'Rs1,00,000 + Tool Credits',
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
