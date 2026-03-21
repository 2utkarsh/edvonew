import { Model, model, models, Schema, Types } from 'mongoose';

export interface SubscriptionDocument {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  planName: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  startDate: Date;
  endDate: Date;
  paymentId?: Types.ObjectId;
  autoRenew: boolean;
  cancelledAt?: Date;
  cancelReason?: string;
  pausedAt?: Date;
  resumedAt?: Date;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    planName: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['active', 'cancelled', 'expired', 'paused'], 
      default: 'active' 
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    autoRenew: { type: Boolean, default: true },
    cancelledAt: Date,
    cancelReason: String,
    pausedAt: Date,
    resumedAt: Date,
    features: [String],
  },
  { timestamps: true }
);

export const SubscriptionModel = (models.Subscription as Model<SubscriptionDocument>) || 
  model<SubscriptionDocument>('Subscription', subscriptionSchema);
