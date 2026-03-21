import { Model, model, models, Schema, Types } from 'mongoose';

export interface CertificateDocument {
  certificateNumber: string;
  userId: Types.ObjectId;
  courseId?: Types.ObjectId;
  examId?: Types.ObjectId;
  issuedAt: Date;
  expiresAt?: Date;
  grade?: string;
  score?: number;
  recipientName: string;
  courseName?: string;
  instructorName?: string;
  credentialUrl: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<CertificateDocument>(
  {
    certificateNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    grade: String,
    score: Number,
    recipientName: { type: String, required: true },
    courseName: String,
    instructorName: String,
    credentialUrl: { type: String, required: true },
    verified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CertificateModel = (models.Certificate as Model<CertificateDocument>) || 
  model<CertificateDocument>('Certificate', certificateSchema);
