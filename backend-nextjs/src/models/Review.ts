import { Model, model, models, Schema, Types } from 'mongoose';

export interface ReviewDocument {
  courseId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment?: string;
  isApproved: boolean;
  helpful: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    isApproved: { type: Boolean, default: true },
    helpful: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });

export const ReviewModel = (models.Review as Model<ReviewDocument>) || 
  model<ReviewDocument>('Review', reviewSchema);
