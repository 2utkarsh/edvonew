import { Model, model, models, Schema, Types } from 'mongoose';

export interface PaymentDocument {
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  transactionId: string;
  gatewayResponse?: Record<string, any>;
  purpose: 'course' | 'exam' | 'subscription' | 'donation';
  courseId?: Types.ObjectId;
  examId?: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  invoiceUrl?: string;
  refundedAt?: Date;
  refundReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'], 
      default: 'pending' 
    },
    paymentMethod: { 
      type: String, 
      enum: ['card', 'upi', 'netbanking', 'wallet']
    },
    transactionId: { type: String, required: true, unique: true },
    gatewayResponse: Schema.Types.Mixed,
    purpose: { 
      type: String, 
      enum: ['course', 'exam', 'subscription', 'donation'],
      required: true
    },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    invoiceUrl: String,
    refundedAt: Date,
    refundReason: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });

export const PaymentModel = (models.Payment as Model<PaymentDocument>) || 
  model<PaymentDocument>('Payment', paymentSchema);
