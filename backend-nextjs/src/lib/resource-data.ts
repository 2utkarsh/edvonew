import { slugify } from '@/lib/query';

export interface PublicTutorialRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  tool: string;
  duration: string;
  level: string;
  thumbnail: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  order: number;
}

export interface PublicGuideRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  track: string;
  steps: number;
  highlight: string;
  icon: string;
  thumbnail: string;
  status: 'draft' | 'published' | 'archived';
  order: number;
}

export const MOCK_TUTORIALS: PublicTutorialRecord[] = [
  {
    id: 'tutorial-1',
    slug: 'python-for-data-engineering-building-robust-etl-pipelines',
    title: 'Python for Data Engineering: Building Robust ETL Pipelines',
    description: 'Learn how to use Python, Pandas, and SQLAlchemy to build production-grade data pipelines from scratch.',
    tool: 'Python',
    duration: '4h 15m',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    category: 'Data',
    status: 'published',
    order: 1,
  },
  {
    id: 'tutorial-2',
    slug: 'modern-sql-window-functions-and-advanced-joins',
    title: 'Modern SQL: Window Functions and Advanced Joins',
    description: 'Master the complex SQL queries that data analysts use daily to generate insights from large datasets.',
    tool: 'PostgreSQL',
    duration: '2h 30m',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800',
    category: 'Data',
    status: 'published',
    order: 2,
  },
  {
    id: 'tutorial-3',
    slug: 'fine-tuning-llms-with-hugging-face-and-pytorch',
    title: 'Fine-tuning LLMs with Hugging Face and PyTorch',
    description: 'Step-by-step guide to taking a pre-trained model and adapting it to your specific business domain.',
    tool: 'PyTorch',
    duration: '6h 45m',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    category: 'AI',
    status: 'published',
    order: 3,
  },
  {
    id: 'tutorial-4',
    slug: 'git-mastery-branching-strategies-and-conflict-resolution',
    title: 'Git Mastery: Branching Strategies and Conflict Resolution',
    description: 'Never fear a merge conflict again. A practical guide to Git teamwork for modern engineering teams.',
    tool: 'Git',
    duration: '1h 20m',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&q=80&w=800',
    category: 'Tools',
    status: 'published',
    order: 4,
  },
  {
    id: 'tutorial-5',
    slug: 'building-interactive-dashboards-with-power-bi',
    title: 'Building Interactive Dashboards with Power BI',
    description: 'Turn raw data into storytelling visuals that executives can use to make million-dollar decisions.',
    tool: 'Power BI',
    duration: '3h 10m',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bbbda536ad0a?auto=format&fit=crop&q=80&w=800',
    category: 'Data',
    status: 'published',
    order: 5,
  },
  {
    id: 'tutorial-6',
    slug: 'reactive-microservices-with-nodejs-and-redis',
    title: 'Reactive Microservices with Node.js and Redis',
    description: 'Scale your applications by learning how to implement message queues and event-driven architecture.',
    tool: 'Node.js',
    duration: '5h 00m',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=800',
    category: 'Coding',
    status: 'published',
    order: 6,
  },
];

export const MOCK_GUIDES: PublicGuideRecord[] = [
  {
    id: 'guide-1',
    slug: 'the-ai-engineer-blueprint-2026-edition',
    title: 'The AI Engineer Blueprint (2026 Edition)',
    description: 'A comprehensive map from Junior Developer to Senior AI Engineer. Covers math, LLMs, and deployment.',
    track: 'Career Growth',
    steps: 12,
    highlight: 'Trending #1',
    icon: 'Map',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    order: 1,
  },
  {
    id: 'guide-2',
    slug: 'modern-resume-architecture-for-data-science',
    title: 'Modern Resume Architecture for Data Science',
    description: 'Stop being ignored by ATS systems. Learn why formatting matters more than years of experience.',
    track: 'Resume Building',
    steps: 5,
    highlight: 'High Impact',
    icon: 'Blueprint',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    order: 2,
  },
  {
    id: 'guide-3',
    slug: 'negotiation-tactics-for-high-growth-tech-roles',
    title: 'Negotiation Tactics for High-Growth Tech Roles',
    description: 'The exact scripts and psychological framework to land a 40%+ salary increase during your next offer.',
    track: 'Salary Mastery',
    steps: 8,
    highlight: 'Expert Approved',
    icon: 'Target',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    order: 3,
  },
  {
    id: 'guide-4',
    slug: 'cracking-the-big-data-system-design-interview',
    title: 'Cracking the Big Data System Design Interview',
    description: 'Master the architectural patterns needed to pass senior interviews at FAANG and top startups.',
    track: 'Interview Prep',
    steps: 15,
    highlight: 'Advanced',
    icon: 'Star',
    thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    order: 4,
  },
  {
    id: 'guide-5',
    slug: 'transitioning-from-non-it-to-data-analytics',
    title: 'Transitioning from Non-IT to Data Analytics',
    description: 'A structured checklist for professionals making a radical career pivot into the world of data.',
    track: 'Career Growth',
    steps: 10,
    highlight: 'Best for Beginners',
    icon: 'Blueprint',
    thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    order: 5,
  },
  {
    id: 'guide-6',
    slug: 'managing-up-the-soft-skills-of-senior-engineering',
    title: 'Managing Up: The Soft Skills of Senior Engineering',
    description: 'How to communicate impact, handle stakeholders, and secure your promotion without burning out.',
    track: 'Career Growth',
    steps: 7,
    highlight: 'Soft Skills',
    icon: 'Target',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    order: 6,
  },
];

export function mapResourceDocumentToTutorial(item: any): PublicTutorialRecord {
  return {
    id: String(item._id || item.id || item.slug),
    slug: String(item.slug || slugify(String(item.title || item._id || 'tutorial'))),
    title: String(item.title || 'Untitled Tutorial'),
    description: String(item.description || ''),
    tool: String(item.tool || 'Tool'),
    duration: String(item.duration || '1h 00m'),
    level: String(item.level || 'Beginner'),
    thumbnail: String(item.thumbnail || '/images/edvo-official-logo-v10.png'),
    category: String(item.category || 'General'),
    status: item.status === 'draft' || item.status === 'archived' ? item.status : 'published',
    order: Number(item.order || 0),
  };
}

export function mapResourceDocumentToGuide(item: any): PublicGuideRecord {
  return {
    id: String(item._id || item.id || item.slug),
    slug: String(item.slug || slugify(String(item.title || item._id || 'guide'))),
    title: String(item.title || 'Untitled Guide'),
    description: String(item.description || ''),
    track: String(item.track || item.category || 'Career Growth'),
    steps: Number(item.steps || 0),
    highlight: String(item.highlight || 'Featured'),
    icon: String(item.icon || 'Map'),
    thumbnail: String(item.thumbnail || '/images/edvo-official-logo-v10.png'),
    status: item.status === 'draft' || item.status === 'archived' ? item.status : 'published',
    order: Number(item.order || 0),
  };
}
