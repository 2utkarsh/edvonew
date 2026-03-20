import { Model, model, models, Schema, Types } from 'mongoose';

export interface PageDocument {
  name: string;
  slug: string;
  type: string;
  title: string;
  banner?: string;
  favicon?: string;
  description?: string;
  metaDescription?: string;
  metaKeywords?: string;
  active: boolean;
  sections: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<PageDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, default: 'inner_page' },
    title: { type: String, required: true },
    banner: String,
    favicon: String,
    description: String,
    metaDescription: String,
    metaKeywords: String,
    active: { type: Boolean, default: true },
    sections: [{ type: Schema.Types.ObjectId, ref: 'PageSection' }],
  },
  { timestamps: true }
);

export const PageModel = (models.Page as Model<PageDocument>) || model<PageDocument>('Page', pageSchema);
