import { Model, model, models, Schema, Types } from 'mongoose';

export interface BlogDocument {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category: string;
  categories?: string[];
  tags: string[];
  author: Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  order: number;
  views: number;
  readTime: number;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<BlogDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: String,
    featuredImage: String,
    category: { type: String, required: true },
    categories: { type: [String], default: [] },
    tags: [String],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    order: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    readTime: Number,
    metaTitle: String,
    metaDescription: String,
    publishedAt: Date,
  },
  { timestamps: true }
);

blogSchema.index({ order: 1, updatedAt: -1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ status: 1, category: 1, order: 1, updatedAt: -1 });
blogSchema.index({ status: 1, categories: 1, order: 1, updatedAt: -1 });

export const BlogModel = (models.Blog as Model<BlogDocument>) ||
  model<BlogDocument>('Blog', blogSchema);

export interface BlogCategoryDocument {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogCategorySchema = new Schema<BlogCategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogCategorySchema.index({ order: 1, updatedAt: -1 });

export const BlogCategoryModel = (models.BlogCategory as Model<BlogCategoryDocument>) ||
  model<BlogCategoryDocument>('BlogCategory', blogCategorySchema);