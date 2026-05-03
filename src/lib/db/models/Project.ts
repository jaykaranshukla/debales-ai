import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProject extends Document {
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Project: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>('Project', ProjectSchema);
