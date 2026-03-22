import { Model, model, models, Schema } from 'mongoose';

export type EventType = 'webinar' | 'workshop' | 'hackathon';
export type EventVisibility = 'active' | 'inactive';
export type EventLifecycle = 'Upcoming' | 'Live' | 'Ended';

export interface EventSpeaker {
  name: string;
  role: string;
  avatar: string;
}

export interface EventItemDocument {
  type: EventType;
  title: string;
  slug: string;
  description: string;
  category: string;
  image: string;
  date: string;
  time: string;
  location: string;
  status: EventLifecycle;
  visibility: EventVisibility;
  order: number;
  speakers: EventSpeaker[];
  prizes?: string;
  duration?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventCategoryDocument {
  type: EventType;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSpeakerSchema = new Schema<EventSpeaker>(
  {
    name: { type: String, trim: true, required: true },
    role: { type: String, trim: true, default: '' },
    avatar: { type: String, trim: true, default: '/images/edvo-official-logo-v10.png' },
  },
  { _id: false }
);

const eventItemSchema = new Schema<EventItemDocument>(
  {
    type: { type: String, enum: ['webinar', 'workshop', 'hackathon'], required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Upcoming', 'Live', 'Ended'], default: 'Upcoming' },
    visibility: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
    speakers: { type: [eventSpeakerSchema], default: [] },
    prizes: { type: String, trim: true },
    duration: { type: String, trim: true },
  },
  { timestamps: true }
);

const eventCategorySchema = new Schema<EventCategoryDocument>(
  {
    type: { type: String, enum: ['webinar', 'workshop', 'hackathon'], required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

eventCategorySchema.index({ type: 1, name: 1 }, { unique: true });

export const EventItemModel = (models.EventItem as Model<EventItemDocument>) ||
  model<EventItemDocument>('EventItem', eventItemSchema);

export const EventCategoryModel = (models.EventCategory as Model<EventCategoryDocument>) ||
  model<EventCategoryDocument>('EventCategory', eventCategorySchema);
