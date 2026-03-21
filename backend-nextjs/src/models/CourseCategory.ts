import { Model, model, models, Schema } from 'mongoose';

export interface CourseCategoryDocument {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  courseCount: number;
  parentCategoryId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courseCategorySchema = new Schema<CourseCategoryDocument>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    icon: String,
    color: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    courseCount: { type: Number, default: 0 },
    parentCategoryId: { type: Schema.Types.ObjectId, ref: 'CourseCategory' },
  },
  { timestamps: true }
);

export const CourseCategoryModel = (models.CourseCategory as Model<CourseCategoryDocument>) || 
  model<CourseCategoryDocument>('CourseCategory', courseCategorySchema);

// Child/Sub-category model (same schema, references parent)
export const CourseCategoryChildModel = CourseCategoryModel;
