import { Model, model, models, Schema } from 'mongoose';

export interface SuccessStoryDocument {
  name: string;
  slug: string;
  location: string;
  beforeRole: string;
  afterRole: string;
  companyLogo: string;
  avatar: string;
  linkedinUrl: string;
  category: string;
  tags: string[];
  status: 'active' | 'inactive';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const successStorySchema = new Schema<SuccessStoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    location: { type: String, required: true, trim: true },
    beforeRole: { type: String, required: true, trim: true },
    afterRole: { type: String, required: true, trim: true },
    companyLogo: { type: String, required: true, trim: true },
    avatar: { type: String, required: true, trim: true },
    linkedinUrl: { type: String, default: '', trim: true },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SuccessStoryModel = (models.SuccessStory as Model<SuccessStoryDocument>) ||
  model<SuccessStoryDocument>('SuccessStory', successStorySchema);

export interface SuccessStoryCategoryDocument {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const successStoryCategorySchema = new Schema<SuccessStoryCategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SuccessStoryCategoryModel = (models.SuccessStoryCategory as Model<SuccessStoryCategoryDocument>) ||
  model<SuccessStoryCategoryDocument>('SuccessStoryCategory', successStoryCategorySchema);
