import { Model, model, models, Schema } from 'mongoose';

export interface TeamMemberDocument {
  name: string;
  slug: string;
  title: string;
  bio: string;
  image: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<TeamMemberDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    bio: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const TeamMemberModel = (models.TeamMember as Model<TeamMemberDocument>) || model<TeamMemberDocument>('TeamMember', teamMemberSchema);
