import { Model, model, models, Schema } from 'mongoose';

export interface NewsletterDocument {
  email: string;
  isSubscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  metadata?: {
    source?: string;
    ip?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new Schema<NewsletterDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isSubscribed: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: Date,
    metadata: {
      source: String,
      ip: String,
      userAgent: String,
    },
  },
  { timestamps: true }
);

export const NewsletterModel = (models.Newsletter as Model<NewsletterDocument>) || 
  model<NewsletterDocument>('Newsletter', newsletterSchema);
