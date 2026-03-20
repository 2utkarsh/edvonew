import { Model, model, models, Schema } from 'mongoose';

export interface SystemSettingDocument {
  siteName: string;
  siteDescription?: string;
  logoUrl?: string;
  header: Record<string, unknown>;
  footer: Record<string, unknown>;
  contact: Record<string, unknown>;
  socialLinks: Array<{ label: string; href: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const systemSettingSchema = new Schema<SystemSettingDocument>(
  {
    siteName: { type: String, required: true, default: 'EDVO' },
    siteDescription: String,
    logoUrl: String,
    header: { type: Schema.Types.Mixed as any, default: {} },
    footer: { type: Schema.Types.Mixed as any, default: {} },
    contact: { type: Schema.Types.Mixed as any, default: {} },
    socialLinks: {
      type: [
        new Schema(
          {
            label: String,
            href: String,
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const SystemSettingModel =
  (models.SystemSetting as Model<SystemSettingDocument>) || model<SystemSettingDocument>('SystemSetting', systemSettingSchema);


