import MarketingPage from '@/components/marketing/MarketingPageHomePalette';
import { publicPageConfigs } from '@/lib/public-pages';
import { notFound } from 'next/navigation';

type Params = {
  slug: string[];
};

const included = new Set([
  'about',
  'resources',
  'resources/blog',
  'resources/guides',
  'resources/tutorials',
  'events',
  'events/webinars',
  'events/workshops',
  'events/hackathons',
  'blog',
  'pricing',
  'business',
  'students',
  'careers',
  'press',
  'partners',
  'help',
  'contact',
  'privacy',
  'terms',
  'faq',
  'challenges',
  'hire-talent',
  'testimonials',
  'courses/ds-gen-ai'
]);

export function generateStaticParams() {
  return Object.values(publicPageConfigs)
    .map((config) => config.slug)
    .filter((slug) => included.has(slug))
    .map((slug) => ({ slug: slug.split('/') }));
}

export default async function GenericMarketingPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join('/');

  if (!included.has(slug)) {
    notFound();
  }

  const config = Object.values(publicPageConfigs).find((entry) => entry.slug === slug);

  if (!config) {
    notFound();
  }

  return <MarketingPage config={config} />;
}
