import { Model, model, models, Schema } from 'mongoose';

export interface SystemSettingDocument {
  key: string;
  value: any;
  category: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  isPublic: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const systemSettingSchema = new Schema<SystemSettingDocument>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    category: { type: String, default: 'general' },
    description: String,
    type: { 
      type: String, 
      enum: ['string', 'number', 'boolean', 'object', 'array'],
      default: 'string'
    },
    isPublic: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SystemSettingModel = (models.SystemSetting as Model<SystemSettingDocument>) || 
  model<SystemSettingDocument>('SystemSetting', systemSettingSchema);
