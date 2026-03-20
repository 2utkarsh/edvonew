import { Model, model, models, Schema, Types } from 'mongoose';

const payoutMethodSchema = new Schema(
  {
    type: String,
    subType: String,
    title: String,
    fields: { type: Schema.Types.Mixed as any, default: {} },
  },
  { _id: false }
);

const defaultPayoutMethods = [
  { type: 'payout', subType: 'paypal', title: 'Paypal Settings', fields: { active: false, test_mode: false, currency: 'USD', sandbox_client_id: '', sandbox_secret_key: '', production_client_id: '', production_secret_key: '' } },
  { type: 'payout', subType: 'stripe', title: 'Stripe Settings', fields: { active: false, test_mode: false, currency: 'USD', test_public_key: '', test_secret_key: '', live_public_key: '', live_secret_key: '', webhook_secret: '' } },
  { type: 'payout', subType: 'mollie', title: 'Mollie Settings', fields: { active: false, test_mode: false, currency: 'USD', test_api_key: '', live_api_key: '' } },
  { type: 'payout', subType: 'paystack', title: 'Paystack Settings', fields: { active: false, test_mode: false, currency: 'USD', test_public_key: '', test_secret_key: '', live_public_key: '', live_secret_key: '' } },
  { type: 'payout', subType: 'sslcommerz', title: 'SSLCommerz Settings', fields: { active: false, test_mode: true, currency: 'BDT', store_id: '', store_password: '' } },
  { type: 'payout', subType: 'razorpay', title: 'Razorpay Settings', fields: { active: false, test_mode: true, currency: 'INR', api_key: '', api_secret: '' } },
];

export interface InstructorDocument {
  userId?: Types.ObjectId;
  skills: string[];
  biography: string;
  resume?: string;
  status: string;
  designation?: string;
  payoutMethods: Array<Record<string, unknown>>;
  createdAt: Date;
  updatedAt: Date;
}

const instructorSchema = new Schema<InstructorDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    skills: { type: [String], default: [] },
    biography: { type: String, default: '' },
    resume: String,
    status: { type: String, default: 'pending' },
    designation: String,
    payoutMethods: { type: [payoutMethodSchema], default: defaultPayoutMethods },
  },
  { timestamps: true }
);

export const InstructorModel = (models.Instructor as Model<InstructorDocument>) || model<InstructorDocument>('Instructor', instructorSchema);

