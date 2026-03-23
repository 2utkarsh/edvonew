import { Model, model, models, Schema, Types } from 'mongoose';

const curriculumLectureSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    isFree: { type: Boolean, default: false },
    duration: String,
    videoUrl: String,
    resourceUrl: String,
    notes: String,
    releaseAt: String,
    contentType: {
      type: String,
      enum: ['recorded', 'live', 'quiz', 'assignment', 'resource'],
      default: 'recorded',
    },
  },
  { _id: true }
);

const curriculumModuleSchema = new Schema(
  {
    label: String,
    title: { type: String, required: true },
    description: String,
    estimatedMinutes: { type: Number, default: 0 },
    lectures: { type: [curriculumLectureSchema], default: [] },
  },
  { _id: true }
);

const curriculumSubjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    modules: { type: [curriculumModuleSchema], default: [] },
  },
  { _id: true }
);

const mentorSchema = new Schema(
  {
    name: { type: String, required: true },
    designation: String,
    company: String,
    experience: String,
    image: String,
  },
  { _id: true }
);

const planSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    isRecommended: { type: Boolean, default: false },
    features: {
      type: [
        new Schema(
          {
            label: String,
            value: String,
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { _id: true }
);

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: true }
);

const testimonialSchema = new Schema(
  {
    name: String,
    role: String,
    company: String,
    quote: String,
    rating: Number,
  },
  { _id: true }
);

const offeringSchema = new Schema(
  {
    icon: String,
    title: String,
  },
  { _id: true }
);

const liveSessionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    hostName: String,
    startTime: { type: String, required: true },
    endTime: String,
    timezone: { type: String, default: 'Asia/Kolkata' },
    meetingUrl: String,
    recordingUrl: String,
    attendanceRequired: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { _id: true }
);

const certificateSettingsSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    minProgressPercentage: { type: Number, default: 100 },
    minAttendancePercentage: { type: Number, default: 70 },
    minPerformanceScore: { type: Number, default: 60 },
    templateName: { type: String, default: 'EDVO Completion Certificate' },
    badgeLabel: { type: String, default: 'Course Graduate' },
  },
  { _id: false }
);

const notificationSettingsSchema = new Schema(
  {
    enrollmentConfirmation: { type: Boolean, default: true },
    liveClassReminder: { type: Boolean, default: true },
    certificateIssued: { type: Boolean, default: true },
  },
  { _id: false }
);

export interface CourseDocument {
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  order: number;
  instructorId?: Types.ObjectId;
  instructorName?: string;
  thumbnail?: string;
  banner?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  startDate?: string;
  duration?: string;
  delivery?: string;
  deliveryMode?: 'recorded' | 'live' | 'hybrid';
  language?: string;
  jobAssistance?: boolean;
  bannerTag?: string;
  bannerSubtag?: string;
  bannerExtra?: string;
  cohortLabel?: string;
  supportEmail?: string;
  accessDurationMonths?: number;
  stats?: { hiringPartners?: string; careerTransitions?: string; highestPackage?: string };
  tags: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  featuredOutcomes: string[];
  curriculum: unknown[];
  liveSessions: unknown[];
  mentors: unknown[];
  plans: unknown[];
  offerings: unknown[];
  faqs: unknown[];
  testimonials: unknown[];
  certifications: Array<{ name: string; provider?: string }>;
  certificateSettings?: {
    enabled?: boolean;
    minProgressPercentage?: number;
    minAttendancePercentage?: number;
    minPerformanceScore?: number;
    templateName?: string;
    badgeLabel?: string;
  };
  notificationSettings?: {
    enrollmentConfirmation?: boolean;
    liveClassReminder?: boolean;
    certificateIssued?: boolean;
  };
  rating: number;
  reviewCount: number;
  studentsEnrolled: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<CourseDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    shortDescription: String,
    description: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    order: { type: Number, default: 0 },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User' },
    instructorName: String,
    thumbnail: String,
    banner: String,
    price: { type: Number, default: 0 },
    originalPrice: Number,
    discount: Number,
    startDate: String,
    duration: String,
    delivery: String,
    deliveryMode: { type: String, enum: ['recorded', 'live', 'hybrid'], default: 'recorded' },
    language: String,
    jobAssistance: Boolean,
    bannerTag: String,
    bannerSubtag: String,
    bannerExtra: String,
    cohortLabel: String,
    supportEmail: String,
    accessDurationMonths: { type: Number, default: 12 },
    stats: {
      hiringPartners: String,
      careerTransitions: String,
      highestPackage: String,
    },
    tags: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    whatYouWillLearn: { type: [String], default: [] },
    featuredOutcomes: { type: [String], default: [] },
    curriculum: { type: [curriculumSubjectSchema], default: [] },
    liveSessions: { type: [liveSessionSchema], default: [] },
    mentors: { type: [mentorSchema], default: [] },
    plans: { type: [planSchema], default: [] },
    offerings: { type: [offeringSchema], default: [] },
    faqs: { type: [faqSchema], default: [] },
    testimonials: { type: [testimonialSchema], default: [] },
    certifications: {
      type: [
        new Schema(
          {
            name: String,
            provider: String,
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    certificateSettings: { type: certificateSettingsSchema, default: () => ({}) },
    notificationSettings: { type: notificationSettingsSchema, default: () => ({}) },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    studentsEnrolled: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true }
);

export const CourseModel = (models.Course as Model<CourseDocument>) || model<CourseDocument>('Course', courseSchema);
