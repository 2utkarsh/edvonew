import { Model, model, models, Schema, Types } from 'mongoose';

export interface EventRegistrationDocument {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userEmail: string;
  status: 'registered' | 'attended' | 'no-show' | 'cancelled';
  registeredAt: Date;
  joinedAt?: Date;
  leftAt?: Date;
  attendanceDuration?: number; // minutes
  certificateIssued: boolean;
  certificateId?: Types.ObjectId;
  feedback?: {
    rating: number;
    comment: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const eventRegistrationSchema = new Schema<EventRegistrationDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['registered', 'attended', 'no-show', 'cancelled'],
      default: 'registered'
    },
    registeredAt: { type: Date, default: Date.now },
    joinedAt: Date,
    leftAt: Date,
    attendanceDuration: Number,
    certificateIssued: { type: Boolean, default: false },
    certificateId: { type: Schema.Types.ObjectId, ref: 'Certificate' },
    feedback: {
      rating: Number,
      comment: String,
    },
  },
  { timestamps: true }
);

eventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
eventRegistrationSchema.index({ userId: 1, status: 1 });

export const EventRegistrationModel = (models.EventRegistration as Model<EventRegistrationDocument>) || 
  model<EventRegistrationDocument>('EventRegistration', eventRegistrationSchema);
