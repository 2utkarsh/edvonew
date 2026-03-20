import { Model, model, models, Schema, Types } from 'mongoose';

const examFaqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: true }
);

export interface ExamDocument {
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  category?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  pricingType: 'free' | 'paid';
  price: number;
  discountPrice?: number;
  durationHours?: number;
  durationMinutes?: number;
  passMark?: number;
  maxAttempts?: number;
  totalMarks?: number;
  expiryType?: 'lifetime' | 'limited_time';
  expiryDuration?: string;
  thumbnail?: string;
  banner?: string;
  instructorId?: Types.ObjectId;
  faqs: unknown[];
  outcomes: string[];
  requirements: string[];
  reviewCount: number;
  averageRating: number;
  enrollmentsCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<ExamDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: String,
    description: { type: String, required: true },
    category: String,
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    pricingType: { type: String, enum: ['free', 'paid'], default: 'paid' },
    price: { type: Number, default: 0 },
    discountPrice: Number,
    durationHours: Number,
    durationMinutes: Number,
    passMark: Number,
    maxAttempts: Number,
    totalMarks: Number,
    expiryType: { type: String, enum: ['lifetime', 'limited_time'], default: 'lifetime' },
    expiryDuration: String,
    thumbnail: String,
    banner: String,
    instructorId: { type: Schema.Types.ObjectId, ref: 'User' },
    faqs: { type: [examFaqSchema], default: [] },
    outcomes: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    reviewCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    enrollmentsCount: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true }
);

export const ExamModel = (models.Exam as Model<ExamDocument>) || model<ExamDocument>('Exam', examSchema);

