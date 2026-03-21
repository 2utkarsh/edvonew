import { Model, model, models, Schema, Types } from 'mongoose';

export interface BlogDocument {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  author: Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  order: number;
  views: number;
  readTime: number; // minutes
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
    tags: [String],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['draft', 'published', 'archived'], 
      default: 'draft' 
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

export const BlogModel = (models.Blog as Model<BlogDocument>) ||
  model<BlogDocument>('Blog', blogSchema);

// Blog Category model
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

export const BlogCategoryModel = (models.BlogCategory as Model<BlogCategoryDocument>) ||
  model<BlogCategoryDocument>('BlogCategory', blogCategorySchema);

