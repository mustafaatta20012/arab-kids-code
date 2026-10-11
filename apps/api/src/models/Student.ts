import { Schema, model, Document, Types } from 'mongoose';

export interface IStudentDocument extends Document {
  userId: Types.ObjectId;
  parentId: Types.ObjectId;
  displayName: string;
  birthYear: number;
  avatar: string;
  level: number;
  xp: number;
  streakDays: number;
  lastActiveDate?: string; // YYYY-MM-DD
  badges: string[];
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    birthYear: {
      type: Number,
      required: true,
    },
    avatar: {
      type: String,
      default: 'avatar_default_robot.png',
    },
    level: {
      type: Number,
      default: 1,
    },
    xp: {
      type: Number,
      default: 0,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: String,
    },
    badges: {
      type: [String],
      default: [],
    },
    subscriptionStart: {
      type: Date,
    },
    subscriptionEnd: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const Student = model<IStudentDocument>('Student', StudentSchema);
