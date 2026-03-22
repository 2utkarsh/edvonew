import { Model, model, models, Schema } from 'mongoose';

export interface CourseReviewItemDocument {
  reviewerName: string;
  reviewerAvatar: string;
  reviewerRole: string;
  courseName: string;
  courseSlug?: string;
  category: string;
  rating: number;
  comment: string;
  helpful: number;
  externalUrl?: string;
  sourceLabel?: string;
  sourceType: 'manual';
  status: 'active' | 'inactive';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseReviewItemSchema = new Schema<CourseReviewItemDocument>(
  {
    reviewerName: { type: String, required: true, trim: true },
    reviewerAvatar: { type: String, required: true, trim: true },
    reviewerRole: { type: String, default: 'Learner', trim: true },
    courseName: { type: String, required: true, trim: true },
    courseSlug: { type: String, default: '', trim: true },
    category: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    helpful: { type: Number, default: 0 },
    externalUrl: { type: String, default: '', trim: true },
    sourceLabel: { type: String, default: 'EDVO Website', trim: true },
    sourceType: { type: String, enum: ['manual'], default: 'manual' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CourseReviewItemModel = (models.CourseReviewItem as Model<CourseReviewItemDocument>) ||
  model<CourseReviewItemDocument>('CourseReviewItem', courseReviewItemSchema);

export interface CourseReviewCategoryDocument {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseReviewCategorySchema = new Schema<CourseReviewCategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CourseReviewCategoryModel = (models.CourseReviewCategory as Model<CourseReviewCategoryDocument>) ||
  model<CourseReviewCategoryDocument>('CourseReviewCategory', courseReviewCategorySchema);
