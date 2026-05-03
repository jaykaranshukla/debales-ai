import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMembership {
  projectId: mongoose.Types.ObjectId;
  role: 'admin' | 'member';
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  memberships: IMembership[];
  createdAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    role: { type: String, enum: ['admin', 'member'], required: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    memberships: { type: [MembershipSchema], default: [] },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);
