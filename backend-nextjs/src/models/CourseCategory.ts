import { Model, model, models, Schema, Types } from 'mongoose';

export interface CourseCategoryDocument {
  title: string;
  slug: string;
  icon?: string;
  sort: number;
  status: boolean;
  description?: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseCategorySchema = new Schema<CourseCategoryDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: String,
    sort: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    description: String,
    thumbnail: String,
  },
  { timestamps: true }
);

export interface CourseCategoryChildDocument {
  title: string;
  slug: string;
  icon?: string;
  sort: number;
  status: boolean;
  description?: string;
  courseCategoryId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courseCategoryChildSchema = new Schema<CourseCategoryChildDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: String,
    sort: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    description: String,
    courseCategoryId: { type: Schema.Types.ObjectId, ref: 'CourseCategory' },
  },
  { timestamps: true }
);

export const CourseCategoryModel = (models.CourseCategory as Model<CourseCategoryDocument>) || model<CourseCategoryDocument>('CourseCategory', courseCategorySchema);
export const CourseCategoryChildModel = (models.CourseCategoryChild as Model<CourseCategoryChildDocument>) || model<CourseCategoryChildDocument>('CourseCategoryChild', courseCategoryChildSchema);
