import { Model, model, models, Schema, Types } from 'mongoose';

export interface PageSectionDocument {
  name: string;
  slug: string;
  sort: number;
  title?: string;
  subTitle?: string;
  description?: string;
  thumbnail?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  videoUrl?: string;
  flags: unknown[];
  properties: Record<string, unknown>;
  active: boolean;
  pageId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pageSectionSchema = new Schema<PageSectionDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    sort: { type: Number, default: 0 },
    title: String,
    subTitle: String,
    description: String,
    thumbnail: String,
    backgroundImage: String,
    backgroundColor: String,
    videoUrl: String,
    flags: { type: [Schema.Types.Mixed] as any, default: [] },
    properties: { type: Schema.Types.Mixed as any, default: {} },
    active: { type: Boolean, default: true },
    pageId: { type: Schema.Types.ObjectId, ref: 'Page' },
  },
  { timestamps: true }
);

export const PageSectionModel = (models.PageSection as Model<PageSectionDocument>) || model<PageSectionDocument>('PageSection', pageSectionSchema);

