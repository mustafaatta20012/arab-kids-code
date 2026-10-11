import { Schema, model, Document } from 'mongoose';
import { UserRole } from '@arab-kids-code/shared';

export interface IUserDocument extends Document {
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  username?: string;
  passwordHash: string;
  status: 'active' | 'inactive' | 'locked';
  approved: boolean; // Access control: true once approved by teacher
  approvalStatus: 'pending' | 'approved' | 'rejected'; // Access control status
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  mustChangePassword?: boolean;
  lastLoginAt?: Date;
  failedLogins: number;
  lockedUntil?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  locale: 'ar' | 'en';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.STUDENT,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      sparse: true,
      index: true,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'locked'],
      default: 'active',
    },
    approved: {
      type: Boolean,
      default: false,
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    subscriptionStart: {
      type: Date,
    },
    subscriptionEnd: {
      type: Date,
      index: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
    failedLogins: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
    },
    locale: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar',
    },
  },
  {
    timestamps: true,
  },
);

export const User = model<IUserDocument>('User', UserSchema);

