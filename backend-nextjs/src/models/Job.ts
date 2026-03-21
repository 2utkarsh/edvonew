import { Model, model, models, Schema, Types } from 'mongoose';

export interface JobDocument {
  title: string;
  slug: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  mode: 'remote' | 'onsite' | 'hybrid';
  description: string;
  requirements: string[];
  responsibilities?: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'year' | 'month' | 'hour';
  };
  benefits?: string[];
  applicationUrl: string;
  applicationDeadline?: Date;
  postedBy: Types.ObjectId;
  status: 'active' | 'closed' | 'expired';
  applicationCount: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<JobDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      required: true
    },
    mode: { 
      type: String, 
      enum: ['remote', 'onsite', 'hybrid'],
      required: true
    },
    description: { type: String, required: true },
    requirements: { type: [String], required: true },
    responsibilities: [String],
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['year', 'month', 'hour'], default: 'year' },
    },
    benefits: [String],
    applicationUrl: { type: String, required: true },
    applicationDeadline: Date,
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['active', 'closed', 'expired'], 
      default: 'active' 
    },
    applicationCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const JobModel = (models.Job as Model<JobDocument>) || 
  model<JobDocument>('Job', jobSchema);
