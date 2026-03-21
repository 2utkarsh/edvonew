import { Model, model, models, Schema, Types } from 'mongoose';

export interface EnrollmentDocument {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: 'active' | 'completed' | 'expired' | 'refunded';
  progress: number;
  completedLectures: string[];
  enrolledAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  certificateId?: Types.ObjectId;
  lastAccessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<EnrollmentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    status: { 
      type: String, 
      enum: ['active', 'completed', 'expired', 'refunded'], 
      default: 'active' 
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLectures: [{ type: String }],
    enrolledAt: { type: Date, default: Date.now },
    completedAt: Date,
    expiresAt: Date,
    certificateId: { type: Schema.Types.ObjectId, ref: 'Certificate' },
    lastAccessedAt: Date,
  },
  { timestamps: true }
);

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const EnrollmentModel = (models.Enrollment as Model<EnrollmentDocument>) || 
  model<EnrollmentDocument>('Enrollment', enrollmentSchema);
