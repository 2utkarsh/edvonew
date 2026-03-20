import { Model, model, models, Schema, Types } from 'mongoose';

export interface UserDocument {
  name: string;
  email: string;
  mobile?: string;
  passwordHash: string;
  role: 'student' | 'instructor' | 'admin';
  status?: number;
  isActive: boolean;
  photo?: string;
  avatar?: string;
  googleId?: string;
  socialLinks: Array<Record<string, unknown>>;
  instructorId?: Types.ObjectId;
  bio?: string;
  headline?: string;
  skills: string[];
  enrolledCourses: Types.ObjectId[];
  enrolledExams: Types.ObjectId[];
  createdCourses: Types.ObjectId[];
  createdExams: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    status: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    photo: String,
    avatar: String,
    googleId: String,
    socialLinks: { type: [Schema.Types.Mixed] as any, default: [] },
    instructorId: { type: Schema.Types.ObjectId, ref: 'Instructor' },
    bio: String,
    headline: String,
    skills: { type: [String], default: [] },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    enrolledExams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
    createdCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    createdExams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
  },
  { timestamps: true }
);

export const UserModel = (models.User as Model<UserDocument>) || model<UserDocument>('User', userSchema);

