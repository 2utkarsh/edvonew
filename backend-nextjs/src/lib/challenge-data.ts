import { slugify } from '@/lib/query';

export interface PublicChallengeRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  phase: 'ongoing' | 'completed';
  visibility: 'active' | 'inactive';
  order: number;
  prize: string;
  participants: string;
  href: string;
  badge?: string;
}

export const MOCK_CHALLENGES: PublicChallengeRecord[] = [
  {
    id: 'databricks-2',
    slug: 'databricks-2',
    title: 'Build With Databricks: Hands-On Project Challenge - 2',
    description: 'Solve practical data problems through our resume project challenge and gain hands-on experience to boost your skills.',
    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1200',
    category: 'Resume Projects',
    phase: 'ongoing',
    visibility: 'active',
    order: 1,
    prize: 'Rs 2,00,000',
    participants: '2.5k+',
    href: '/challenges/databricks-2',
    badge: 'Certified Submissions',
  },
  {
    id: 'food-delivery',
    slug: 'food-delivery',
    title: 'Providing Insights for Crisis Recovery in an Online Food Delivery Startup',
    description: 'Explore retention, operations, and performance levers for a food delivery business recovering from disruption.',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&q=80&w=1200',
    category: 'Business Analytics',
    phase: 'completed',
    visibility: 'active',
    order: 1,
    prize: 'Rs 25,000',
    participants: '2265',
    href: '/challenges/food-delivery',
  },
  {
    id: 'newspaper',
    slug: 'newspaper',
    title: 'Provide Insights to Guide a Legacy Newspaper\'s Survival in a Post-COVID Digital Era',
    description: 'Use customer and content analytics to recommend sustainable digital growth for a media business.',
    image: 'https://images.unsplash.com/photo-1504711331083-9c895941bf81?auto=format&fit=crop&q=80&w=1200',
    category: 'Strategy & Insights',
    phase: 'completed',
    visibility: 'active',
    order: 2,
    prize: 'Rs 50,000',
    participants: '1551',
    href: '/challenges/newspaper',
  },
  {
    id: 'air-purifier',
    slug: 'air-purifier',
    title: 'Conduct Product Market Fit Research for Air Purifier Development Using AQI Analytics',
    description: 'Blend market sizing, AQI analysis, and product positioning to validate an air purifier opportunity.',
    image: 'https://images.unsplash.com/photo-1620912189866-b8d3421f3e37?auto=format&fit=crop&q=80&w=1200',
    category: 'Product Research',
    phase: 'completed',
    visibility: 'active',
    order: 3,
    prize: 'Rs 50,000',
    participants: '2810',
    href: '/challenges/air-purifier',
  },
];

export function mapChallengeDocumentToPublicChallenge(item: any): PublicChallengeRecord {
  return {
    id: String(item._id || item.id || item.slug),
    slug: String(item.slug || slugify(String(item.title || item._id || 'challenge'))),
    title: String(item.title || 'Untitled Challenge'),
    description: String(item.description || ''),
    image: String(item.image || '/images/edvo-official-logo-v10.png'),
    category: String(item.category || 'General'),
    phase: item.phase === 'completed' ? 'completed' : 'ongoing',
    visibility: item.visibility === 'inactive' ? 'inactive' : 'active',
    order: Number(item.order || 0),
    prize: String(item.prize || ''),
    participants: String(item.participants || ''),
    href: String(item.href || `/challenges/${item.slug || ''}`),
    badge: item.badge ? String(item.badge) : undefined,
  };
}
