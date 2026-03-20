import { Model, model, models, Schema } from 'mongoose';

export interface ExamCategoryDocument {
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  sort: number;
  status: boolean;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const examCategorySchema = new Schema<ExamCategoryDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: String,
    description: String,
    sort: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    thumbnail: String,
  },
  { timestamps: true }
);

export const ExamCategoryModel = (models.ExamCategory as Model<ExamCategoryDocument>) || model<ExamCategoryDocument>('ExamCategory', examCategorySchema);
