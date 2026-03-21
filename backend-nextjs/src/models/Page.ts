import { Model, model, models, Schema, Types } from 'mongoose';

export interface PageDocument {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  isHome: boolean;
  metaTitle?: string;
  metaDescription?: string;
  order: number;
  author: Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<PageDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: String,
    featuredImage: String,
    status: { 
      type: String, 
      enum: ['draft', 'published', 'archived'], 
      default: 'draft' 
    },
    isHome: { type: Boolean, default: false },
    metaTitle: String,
    metaDescription: String,
    order: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: Date,
  },
  { timestamps: true }
);

export const PageModel = (models.Page as Model<PageDocument>) || 
  model<PageDocument>('Page', pageSchema);
