import MarketingPage from '@/components/marketing/MarketingPageHomePalette';
import { getPublicPageConfig } from '@/lib/public-pages';

export default function TestimonialsReviewsPage() {
  return <MarketingPage config={getPublicPageConfig('testimonials')} />;
}
