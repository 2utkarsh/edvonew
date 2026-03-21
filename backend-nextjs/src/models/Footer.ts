import { Model, model, models, Schema } from 'mongoose';

export interface FooterDocument {
  name: string;
  sections: Array<{
    title: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }>;
  socialLinks: Array<{
    platform: string;
    url: string;
    icon?: string;
  }>;
  copyright: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const footerSchema = new Schema<FooterDocument>(
  {
    name: { type: String, required: true },
    sections: [{
      title: { type: String, required: true },
      links: [{
        label: { type: String, required: true },
        href: { type: String, required: true },
      }],
    }],
    socialLinks: [{
      platform: String,
      url: String,
      icon: String,
    }],
    copyright: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const FooterModel = (models.Footer as Model<FooterDocument>) || 
  model<FooterDocument>('Footer', footerSchema);
