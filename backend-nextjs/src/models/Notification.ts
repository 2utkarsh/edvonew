import { Model, model, models, Schema, Types } from 'mongoose';

export interface NotificationDocument {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'enrollment' | 'course' | 'exam' | 'payment' | 'system' | 'job';
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info'
    },
    category: {
      type: String,
      enum: ['enrollment', 'course', 'exam', 'payment', 'system', 'job'],
      default: 'info'
    },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    actionUrl: String,
    actionLabel: String,
    metadata: Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = (models.Notification as Model<NotificationDocument>) || 
  model<NotificationDocument>('Notification', notificationSchema);
