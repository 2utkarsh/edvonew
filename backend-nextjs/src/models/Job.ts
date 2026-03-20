import { Model, model, models, Schema } from 'mongoose';

export interface JobDocument {
  title: string;
  company: string;
  logo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'remote' | 'internship';
  salary?: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience?: string;
  status: 'draft' | 'published' | 'archived';
  applyUrl?: string;
  postedDate?: Date;
  applicationDeadline?: Date;
  applicants: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<JobDocument>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    logo: String,
    location: { type: String, required: true },
    type: { type: String, enum: ['full-time', 'part-time', 'remote', 'internship'], required: true },
    salary: String,
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    experience: String,
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    applyUrl: String,
    postedDate: Date,
    applicationDeadline: Date,
    applicants: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const JobModel = (models.Job as Model<JobDocument>) || model<JobDocument>('Job', jobSchema);

