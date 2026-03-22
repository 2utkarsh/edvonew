import { Model, model, models, Schema } from 'mongoose';

export type ChallengePhase = 'ongoing' | 'completed';
export type ChallengeVisibility = 'active' | 'inactive';

export interface ChallengeItemDocument {
  title: string;
  slug: string;
  description: string;
  image: string;
  category: string;
  phase: ChallengePhase;
  visibility: ChallengeVisibility;
  order: number;
  prize: string;
  participants: string;
  href: string;
  badge?: string;
  objective: string;
  duration: string;
  difficulty: string;
  tools: string[];
  deliverables: string[];
  steps: string[];
  actionUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeCategoryDocument {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const challengeItemSchema = new Schema<ChallengeItemDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    phase: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
    visibility: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
    prize: { type: String, default: '', trim: true },
    participants: { type: String, default: '', trim: true },
    href: { type: String, default: '', trim: true },
    badge: { type: String, trim: true },
    objective: { type: String, default: '', trim: true },
    duration: { type: String, default: '', trim: true },
    difficulty: { type: String, default: 'Intermediate', trim: true },
    tools: { type: [String], default: [] },
    deliverables: { type: [String], default: [] },
    steps: { type: [String], default: [] },
    actionUrl: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

const challengeCategorySchema = new Schema<ChallengeCategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ChallengeItemModel = (models.ChallengeItem as Model<ChallengeItemDocument>) ||
  model<ChallengeItemDocument>('ChallengeItem', challengeItemSchema);

export const ChallengeCategoryModel = (models.ChallengeCategory as Model<ChallengeCategoryDocument>) ||
  model<ChallengeCategoryDocument>('ChallengeCategory', challengeCategorySchema);
