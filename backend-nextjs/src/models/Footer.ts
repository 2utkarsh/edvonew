import { Model, model, models, Schema } from 'mongoose';

const footerItemSchema = new Schema(
  {
    sort: { type: Number, default: 1 },
    type: String,
    slug: String,
    title: String,
    items: { type: [Schema.Types.Mixed] as any, default: [] },
    active: { type: Boolean, default: true },
  },
  { _id: true }
);

export interface FooterDocument {
  title: string;
  slug: string;
  active: boolean;
  items: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

const footerSchema = new Schema<FooterDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    active: { type: Boolean, default: false },
    items: { type: [footerItemSchema], default: [] },
  },
  { timestamps: true }
);

export const FooterModel = (models.Footer as Model<FooterDocument>) || model<FooterDocument>('Footer', footerSchema);

