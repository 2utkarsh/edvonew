import { Model, model, models, Schema } from 'mongoose';

export type ChallengePhase = 'ongoing' | 'completed';
export type ChallengeVisibility = 'active' | 'inactive';

export interface ChallengeQuestionDocument {
  prompt: string;
  type: string;
  options: string[];
  required: boolean;
  placeholder: string;
}

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
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  registrationDeadline: string;
  expiryDate: string;
  competitionMode: string;
  maxSubmissions: number;
  teamSize: string;
  statusNote: string;
  eligibility: string[];
  rules: string[];
  questions: ChallengeQuestionDocument[];
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

const challengeQuestionSchema = new Schema<ChallengeQuestionDocument>(
  {
    prompt: { type: String, required: true, trim: true },
    type: { type: String, default: 'textarea', trim: true },
    options: { type: [String], default: [] },
    required: { type: Boolean, default: true },
    placeholder: { type: String, default: '', trim: true },
  },
  { _id: false }
);

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
    startDate: { type: String, default: '', trim: true },
    startTime: { type: String, default: '', trim: true },
    endDate: { type: String, default: '', trim: true },
    endTime: { type: String, default: '', trim: true },
    registrationDeadline: { type: String, default: '', trim: true },
    expiryDate: { type: String, default: '', trim: true },
    competitionMode: { type: String, default: 'Individual', trim: true },
    maxSubmissions: { type: Number, default: 1 },
    teamSize: { type: String, default: 'Solo or small team', trim: true },
    statusNote: { type: String, default: '', trim: true },
    eligibility: { type: [String], default: [] },
    rules: { type: [String], default: [] },
    questions: { type: [challengeQuestionSchema], default: [] },
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
