import { Model, model, models, Schema } from 'mongoose';

export interface HiringPartnerApplicationDocument {
  companyName: string;
  contactName: string;
  workEmail: string;
  phone?: string;
  website?: string;
  hiringNeeds?: string;
  roles?: string;
  companySize?: string;
  message?: string;
  status: 'new' | 'reviewed' | 'contacted' | 'archived';
  ip?: string;
  userAgent?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const hiringPartnerApplicationSchema = new Schema<HiringPartnerApplicationDocument>(
  {
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    workEmail: { type: String, required: true },
    phone: String,
    website: String,
    hiringNeeds: String,
    roles: String,
    companySize: String,
    message: String,
    status: {
      type: String,
      enum: ['new', 'reviewed', 'contacted', 'archived'],
      default: 'new',
    },
    ip: String,
    userAgent: String,
    notes: String,
  },
  { timestamps: true }
);

export const HiringPartnerApplicationModel =
  (models.HiringPartnerApplication as Model<HiringPartnerApplicationDocument>) ||
  model<HiringPartnerApplicationDocument>('HiringPartnerApplication', hiringPartnerApplicationSchema);
