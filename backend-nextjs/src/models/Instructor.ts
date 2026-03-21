import { Model, model, models, Schema, Types } from 'mongoose';

export interface InstructorDocument {
  userId: Types.ObjectId;
  bio: string;
  headline: string;
  expertise: string[];
  experience: string;
  education: string;
  certifications: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  isFeatured: boolean;
  joinDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const instructorSchema = new Schema<InstructorDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, required: true },
    headline: String,
    expertise: [String],
    experience: String,
    education: String,
    certifications: [String],
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
      website: String,
    },
    totalStudents: { type: Number, default: 0 },
    totalCourses: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    joinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const InstructorModel = (models.Instructor as Model<InstructorDocument>) || 
  model<InstructorDocument>('Instructor', instructorSchema);
