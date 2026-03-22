import { Model, model, models, Schema } from 'mongoose';

export interface HomeContentDocument {
  key: string;
  heroSlides: unknown[];
  socialStats: unknown[];
  features: unknown[];
  careerTransformations: unknown[];
  instructorsIntro: Record<string, unknown>;
  cinematicSection: Record<string, unknown>;
  portfoliosIntro: Record<string, unknown>;
  portfolios: unknown[];
  youtubeSection: Record<string, unknown>;
  youtubeVideos: unknown[];
  hiringPartnersSection: Record<string, unknown>;
  hiringPartners: unknown[];
  testimonialsIntro: Record<string, unknown>;
  homeTestimonials: unknown[];
  ctaSection: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const homeContentSchema = new Schema<HomeContentDocument>(
  {
    key: { type: String, required: true, unique: true, default: 'home' },
    heroSlides: { type: [Schema.Types.Mixed] as any, default: [] },
    socialStats: { type: [Schema.Types.Mixed] as any, default: [] },
    features: { type: [Schema.Types.Mixed] as any, default: [] },
    careerTransformations: { type: [Schema.Types.Mixed] as any, default: [] },
    instructorsIntro: { type: Schema.Types.Mixed as any, default: {} },
    cinematicSection: { type: Schema.Types.Mixed as any, default: {} },
    portfoliosIntro: { type: Schema.Types.Mixed as any, default: {} },
    portfolios: { type: [Schema.Types.Mixed] as any, default: [] },
    youtubeSection: { type: Schema.Types.Mixed as any, default: {} },
    youtubeVideos: { type: [Schema.Types.Mixed] as any, default: [] },
    hiringPartnersSection: { type: Schema.Types.Mixed as any, default: {} },
    hiringPartners: { type: [Schema.Types.Mixed] as any, default: [] },
    testimonialsIntro: { type: Schema.Types.Mixed as any, default: {} },
    homeTestimonials: { type: [Schema.Types.Mixed] as any, default: [] },
    ctaSection: { type: Schema.Types.Mixed as any, default: {} },
  },
  { timestamps: true }
);

export const HomeContentModel = (models.HomeContent as Model<HomeContentDocument>) || model<HomeContentDocument>('HomeContent', homeContentSchema);
