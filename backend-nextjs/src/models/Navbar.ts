import { Model, model, models, Schema } from 'mongoose';

const navigationItemSchema = new Schema(
  {
    sort: { type: Number, default: 1 },
    type: String,
    slug: String,
    title: String,
    value: String,
    items: { type: [Schema.Types.Mixed] as any, default: [] },
    active: { type: Boolean, default: true },
  },
  { _id: true }
);

export interface NavbarDocument {
  title: string;
  slug: string;
  active: boolean;
  items: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

const navbarSchema = new Schema<NavbarDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    active: { type: Boolean, default: false },
    items: { type: [navigationItemSchema], default: [] },
  },
  { timestamps: true }
);

export const NavbarModel = (models.Navbar as Model<NavbarDocument>) || model<NavbarDocument>('Navbar', navbarSchema);

