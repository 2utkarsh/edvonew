import { Model, model, models, Schema } from 'mongoose';

export interface SubscriptionDocument {
  email: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: String,
  },
  { timestamps: true }
);

export const SubscriptionModel =
  (models.Subscription as Model<SubscriptionDocument>) || model<SubscriptionDocument>('Subscription', subscriptionSchema);

