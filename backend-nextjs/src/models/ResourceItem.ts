import { Model, model, models, Schema } from 'mongoose';

export type ResourceItemType = 'tutorial' | 'guide';
export type ResourceItemStatus = 'draft' | 'published' | 'archived';

export interface ResourceItemDocument {
  type: ResourceItemType;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: string;
  tool?: string;
  duration?: string;
  level?: string;
  track?: string;
  steps?: number;
  highlight?: string;
  icon?: string;
  status: ResourceItemStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const resourceItemSchema = new Schema<ResourceItemDocument>(
  {
    type: { type: String, enum: ['tutorial', 'guide'], required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    thumbnail: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    tool: { type: String, trim: true },
    duration: { type: String, trim: true },
    level: { type: String, trim: true },
    track: { type: String, trim: true },
    steps: { type: Number },
    highlight: { type: String, trim: true },
    icon: { type: String, trim: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ResourceItemModel = (models.ResourceItem as Model<ResourceItemDocument>) ||
  model<ResourceItemDocument>('ResourceItem', resourceItemSchema);
