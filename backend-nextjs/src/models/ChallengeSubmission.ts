import { Model, model, models, Schema } from 'mongoose';

export type ChallengeSubmissionStatus = 'pending' | 'graded';

export interface ChallengeSubmissionDocument {
  challengeId?: string;
  challengeSlug: string;
  challengeTitle: string;
  studentName: string;
  studentEmail: string;
  answerText: string;
  attachmentName: string;
  attachmentUrl: string;
  attachmentMimeType: string;
  attachmentSize: number;
  attemptNumber: number;
  status: ChallengeSubmissionStatus;
  marksObtained?: number | null;
  maxMarks: number;
  teacherFeedback: string;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const challengeSubmissionSchema = new Schema<ChallengeSubmissionDocument>(
  {
    challengeId: { type: String, trim: true },
    challengeSlug: { type: String, required: true, trim: true, index: true },
    challengeTitle: { type: String, required: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    studentEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
    answerText: { type: String, default: '', trim: true },
    attachmentName: { type: String, default: '', trim: true },
    attachmentUrl: { type: String, default: '', trim: true },
    attachmentMimeType: { type: String, default: '', trim: true },
    attachmentSize: { type: Number, default: 0 },
    attemptNumber: { type: Number, default: 1 },
    status: { type: String, enum: ['pending', 'graded'], default: 'pending' },
    marksObtained: { type: Number, default: null },
    maxMarks: { type: Number, default: 100 },
    teacherFeedback: { type: String, default: '', trim: true },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const ChallengeSubmissionModel =
  (models.ChallengeSubmission as Model<ChallengeSubmissionDocument>) ||
  model<ChallengeSubmissionDocument>('ChallengeSubmission', challengeSubmissionSchema);
