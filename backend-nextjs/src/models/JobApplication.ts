import { Model, model, models, Schema, Types } from 'mongoose';

export interface JobApplicationDocument {
  jobId: Types.ObjectId;
  userId: Types.ObjectId;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn';
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<JobApplicationDocument>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coverLetter: String,
    resumeUrl: String,
    status: { 
      type: String, 
      enum: ['pending', 'shortlisted', 'rejected', 'accepted', 'withdrawn'], 
      default: 'pending' 
    },
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  },
  { timestamps: true }
);

jobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const JobApplicationModel = (models.JobApplication as Model<JobApplicationDocument>) || 
  model<JobApplicationDocument>('JobApplication', jobApplicationSchema);
