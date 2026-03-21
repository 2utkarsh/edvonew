import { Model, model, models, Schema } from 'mongoose';

export interface ContactMessageDocument {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  ip?: string;
  userAgent?: string;
  repliedAt?: Date;
  repliedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<ContactMessageDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['new', 'read', 'replied', 'archived'], 
      default: 'new' 
    },
    ip: String,
    userAgent: String,
    repliedAt: Date,
    repliedBy: String,
    notes: String,
  },
  { timestamps: true }
);

export const ContactMessageModel = (models.ContactMessage as Model<ContactMessageDocument>) || 
  model<ContactMessageDocument>('ContactMessage', contactMessageSchema);
