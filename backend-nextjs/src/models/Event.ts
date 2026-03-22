import { Model, model, models, Schema, Types } from 'mongoose';

export interface EventDocument {
  title: string;
  slug: string;
  type: 'webinar' | 'workshop' | 'hackathon';
  description: string;
  instructorId: Types.ObjectId;
  instructorName: string;
  thumbnail?: string;
  banner?: string;
  scheduledAt: Date;
  duration: number; // minutes
  maxParticipants: number;
  registeredCount: number;
  status: 'draft' | 'published' | 'live' | 'ended' | 'cancelled';
  liveUrl?: string;
  recordingUrl?: string;
  resources: string[];
  requirements: string[];
  tags: string[];
  price: number;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    type: { 
      type: String, 
      enum: ['webinar', 'workshop', 'hackathon'],
      required: true 
    },
    description: { type: String, required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instructorName: { type: String, required: true },
    thumbnail: String,
    banner: String,
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 },
    maxParticipants: { type: Number, default: 100 },
    registeredCount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['draft', 'published', 'live', 'ended', 'cancelled'],
      default: 'draft'
    },
    liveUrl: String,
    recordingUrl: String,
    resources: [String],
    requirements: [String],
    tags: [String],
    price: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

eventSchema.index({ type: 1, status: 1, scheduledAt: -1 });

export const EventModel = (models.Event as Model<EventDocument>) || 
  model<EventDocument>('Event', eventSchema);
