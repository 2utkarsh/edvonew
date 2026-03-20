import { Model, model, models, Schema } from 'mongoose';

export interface NewsletterDocument {
  subject: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new Schema<NewsletterDocument>(
  {
    subject: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const NewsletterModel = (models.Newsletter as Model<NewsletterDocument>) || model<NewsletterDocument>('Newsletter', newsletterSchema);
