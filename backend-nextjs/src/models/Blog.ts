import { Model, model, models, Schema, Types } from 'mongoose';

export interface BlogCategoryDocument {
  name: string;
  slug: string;
  icon?: string;
  sort: number;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const blogCategorySchema = new Schema<BlogCategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: String,
    sort: { type: Number, default: 0 },
    description: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export interface BlogDocument {
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  banner?: string;
  keywords?: string;
  status: 'draft' | 'published' | 'archived';
  userId?: Types.ObjectId;
  blogCategoryId?: Types.ObjectId;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<BlogDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    thumbnail: String,
    banner: String,
    keywords: String,
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    blogCategoryId: { type: Schema.Types.ObjectId, ref: 'BlogCategory' },
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BlogCategoryModel = (models.BlogCategory as Model<BlogCategoryDocument>) || model<BlogCategoryDocument>('BlogCategory', blogCategorySchema);
export const BlogModel = (models.Blog as Model<BlogDocument>) || model<BlogDocument>('Blog', blogSchema);
