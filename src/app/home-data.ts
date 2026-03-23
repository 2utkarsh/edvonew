export interface HomeContentPayload {
  heroSlides?: any[];
  socialStats?: any[];
  features?: any[];
  careerTransformations?: any[];
  instructorsIntro?: Record<string, unknown>;
  cinematicSection?: Record<string, unknown>;
  portfoliosIntro?: Record<string, unknown>;
  portfolios?: any[];
  youtubeSection?: Record<string, unknown>;
  youtubeVideos?: any[];
  hiringPartnersSection?: Record<string, unknown>;
  hiringPartners?: any[];
  testimonialsIntro?: Record<string, unknown>;
  homeTestimonials?: any[];
  hireTalentHero?: Record<string, unknown>;
  hireTalentTestimonials?: any[];
  hireTalentCta?: Record<string, unknown>;
  ctaSection?: Record<string, unknown>;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

export async function fetchHomeContent(): Promise<HomeContentPayload> {
  const response = await fetch(`${apiBase}/api/home-content`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || 'Failed to load home content');
  return (payload?.data || {}) as HomeContentPayload;
}

