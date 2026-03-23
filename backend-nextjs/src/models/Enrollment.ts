import { Model, model, models, Schema, Types } from 'mongoose';

const attendanceRecordSchema = new Schema(
  {
    sessionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'attended', 'missed'],
      default: 'scheduled',
    },
    markedAt: Date,
    minutesPresent: { type: Number, default: 0 },
  },
  { _id: false }
);

const moduleProgressSchema = new Schema(
  {
    moduleId: { type: String, required: true },
    lectureIds: { type: [String], default: [] },
    percentage: { type: Number, default: 0 },
  },
  { _id: false }
);

const attendanceSummarySchema = new Schema(
  {
    totalSessions: { type: Number, default: 0 },
    attendedSessions: { type: Number, default: 0 },
    overallPercentage: { type: Number, default: 100 },
  },
  { _id: false }
);

const performanceSummarySchema = new Schema(
  {
    averageQuizScore: { type: Number, default: 0 },
    assignmentScore: { type: Number, default: 0 },
    finalScore: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
  },
  { _id: false }
);

const participationSummarySchema = new Schema(
  {
    discussionCount: { type: Number, default: 0 },
    questionsAsked: { type: Number, default: 0 },
    resourcesDownloaded: { type: Number, default: 0 },
    lastActiveAt: Date,
  },
  { _id: false }
);

export interface EnrollmentDocument {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: 'active' | 'completed' | 'expired' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: Types.ObjectId;
  gatewayOrderId?: string;
  planName?: string;
  amountPaid?: number;
  currency?: string;
  progress: number;
  completedLectures: string[];
  currentSubjectId?: string;
  currentModuleId?: string;
  currentLectureId?: string;
  moduleProgress: Array<{ moduleId: string; lectureIds: string[]; percentage: number }>;
  attendanceRecords: Array<{ sessionId: string; status: 'scheduled' | 'attended' | 'missed'; markedAt?: Date; minutesPresent?: number }>;
  attendanceSummary?: { totalSessions: number; attendedSessions: number; overallPercentage: number };
  performanceSummary?: { averageQuizScore: number; assignmentScore: number; finalScore: number; streakDays: number; completionRate: number };
  participationSummary?: { discussionCount: number; questionsAsked: number; resourcesDownloaded: number; lastActiveAt?: Date };
  certificateEligible?: boolean;
  enrolledAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  certificateId?: Types.ObjectId;
  certificateIssuedAt?: Date;
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
      default: 'active',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid',
    },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    gatewayOrderId: String,
    planName: String,
    amountPaid: Number,
    currency: { type: String, default: 'INR' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLectures: [{ type: String }],
    currentSubjectId: String,
    currentModuleId: String,
    currentLectureId: String,
    moduleProgress: { type: [moduleProgressSchema], default: [] },
    attendanceRecords: { type: [attendanceRecordSchema], default: [] },
    attendanceSummary: { type: attendanceSummarySchema, default: () => ({}) },
    performanceSummary: { type: performanceSummarySchema, default: () => ({}) },
    participationSummary: { type: participationSummarySchema, default: () => ({}) },
    certificateEligible: { type: Boolean, default: false },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: Date,
    expiresAt: Date,
    certificateId: { type: Schema.Types.ObjectId, ref: 'Certificate' },
    certificateIssuedAt: Date,
    lastAccessedAt: Date,
  },
  { timestamps: true }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const EnrollmentModel = (models.Enrollment as Model<EnrollmentDocument>) || model<EnrollmentDocument>('Enrollment', enrollmentSchema);
