import { Model, model, models, Schema, Types } from 'mongoose';

export interface EnrollmentDocument {
  userId: Types.ObjectId;
  itemType: 'course' | 'exam';
  itemId: Types.ObjectId;
  progress: number;
  completedLessonIds: string[];
  completedAt?: Date;
  lastAccessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<EnrollmentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['course', 'exam'], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    progress: { type: Number, default: 0 },
    completedLessonIds: { type: [String], default: [] },
    completedAt: Date,
    lastAccessedAt: Date,
  },
  { timestamps: true }
);

export const EnrollmentModel =
  (models.Enrollment as Model<EnrollmentDocument>) || model<EnrollmentDocument>('Enrollment', enrollmentSchema);

