import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'student' | 'alumni' | 'admin';

export interface Education {
  institution: string;
  degree: string;
  year: number;
}

export interface Experience {
  title: string;
  company: string;
  from: Date;
  to?: Date;
  description?: string;
}

export interface Badge {
  key: string;
  points: number;
  awardedAt: Date;
}

export interface ConnectionRequest {
  from: Types.ObjectId;
  createdAt: Date;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  bio?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  profilePicture?: string;
  resumeUrl?: string;
  portfolioLinks: string[];
  connections: Types.ObjectId[];
  connectionRequests: ConnectionRequest[];
  badges: Badge[];
  points: number;
  isActive: boolean;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const ConnectionRequestSchema = new Schema<ConnectionRequest>({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
  bio: String,
  skills: { type: [String], default: [] },
  education: [
    {
      institution: String,
      degree: String,
      year: Number
    }
  ],
  experience: [
    {
      title: String,
      company: String,
      from: Date,
      to: Date,
      description: String
    }
  ],
  profilePicture: String,
  resumeUrl: String,
  portfolioLinks: { type: [String], default: [] },
  connections: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  connectionRequests: { type: [ConnectionRequestSchema], default: [] },
  badges: {
    type: [
      {
        key: String,
        points: Number,
        awardedAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  points: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

import bcrypt from 'bcryptjs';

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<UserDocument>('User', UserSchema);
