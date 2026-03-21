import { Model, model, models, Schema, Types } from 'mongoose';

const questionSchema = new Schema(
  {
    question: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['multiple-choice', 'true-false', 'short-answer'],
      default: 'multiple-choice'
    },
    options: [String],
    correctAnswer: { type: String, required: true },
    marks: { type: Number, default: 1 },
  },
  { _id: true }
);

export interface ExamDocument {
  title: string;
  slug: string;
  description: string;
  category: string;
  duration: number; // minutes
  totalMarks: number;
  passingMarks: number;
  questions: Array<{
    _id: Types.ObjectId;
    question: string;
    type: string;
    options?: string[];
    correctAnswer: string;
    marks: number;
  }>;
  attempts: number;
  price: number;
  status: 'draft' | 'published' | 'archived';
  instructorId: Types.ObjectId;
  instructions?: string[];
  negativeMarks?: number;
  showResults: boolean;
  certificateEnabled: boolean;
  rating: number;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<ExamDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    duration: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    passingMarks: { type: Number, required: true, min: 1 },
    questions: { type: [questionSchema], required: true },
    attempts: { type: Number, default: 1, min: 1 },
    price: { type: Number, default: 0, min: 0 },
    status: { 
      type: String, 
      enum: ['draft', 'published', 'archived'], 
      default: 'draft' 
    },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instructions: [String],
    negativeMarks: Number,
    showResults: { type: Boolean, default: true },
    certificateEnabled: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    attemptCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ExamModel = (models.Exam as Model<ExamDocument>) || 
  model<ExamDocument>('Exam', examSchema);
