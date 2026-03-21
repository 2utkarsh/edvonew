import { Model, model, models, Schema } from 'mongoose';

export interface NavbarDocument {
  name: string;
  items: Array<{
    label: string;
    href: string;
    icon?: string;
    children?: Array<{
      label: string;
      href: string;
    }>;
  }>;
  ctaButton?: {
    label: string;
    href: string;
  };
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const navbarSchema = new Schema<NavbarDocument>(
  {
    name: { type: String, required: true },
    items: [{
      label: { type: String, required: true },
      href: { type: String, required: true },
      icon: String,
      children: [{
        label: String,
        href: String,
      }],
    }],
    ctaButton: {
      label: String,
      href: String,
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const NavbarModel = (models.Navbar as Model<NavbarDocument>) || 
  model<NavbarDocument>('Navbar', navbarSchema);
