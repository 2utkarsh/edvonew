import { publicFetchJson } from '@/lib/backend-api';

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

type HomeContentResponse = {
  success: boolean;
  data: HomeContentPayload;
};

export async function fetchHomeContent(): Promise<HomeContentPayload> {
  const payload = await publicFetchJson<HomeContentResponse>('/api/home-content');
  return (payload?.data || {}) as HomeContentPayload;
}
