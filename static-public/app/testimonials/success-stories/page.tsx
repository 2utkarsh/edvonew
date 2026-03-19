import MarketingPage from '@/components/marketing/MarketingPageHomePalette';
import { getPublicPageConfig } from '@/lib/public-pages';

export default function TestimonialsSuccessStoriesPage() {
  return <MarketingPage config={getPublicPageConfig('testimonials')} />;
}
