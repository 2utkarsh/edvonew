import { Model, model, models, Schema, Types } from 'mongoose';

export interface ExamAttemptDocument {
  examId: Types.ObjectId;
  userId: Types.ObjectId;
  answers: Array<{
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    marks: number;
  }>;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const examAttemptSchema = new Schema<ExamAttemptDocument>(
  {
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{
      questionId: String,
      userAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean,
      marks: Number,
    }],
    obtainedMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ['in-progress', 'completed', 'abandoned'], 
      default: 'in-progress' 
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
  },
  { timestamps: true }
);

examAttemptSchema.index({ userId: 1, examId: 1 });

export const ExamAttemptModel = (models.ExamAttempt as Model<ExamAttemptDocument>) || 
  model<ExamAttemptDocument>('ExamAttempt', examAttemptSchema);
