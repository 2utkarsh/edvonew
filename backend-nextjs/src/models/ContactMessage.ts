import { Model, model, models, Schema } from 'mongoose';

export interface ContactMessageDocument {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<ContactMessageDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

export const ContactMessageModel = (models.ContactMessage as Model<ContactMessageDocument>) || model<ContactMessageDocument>('ContactMessage', contactMessageSchema);
