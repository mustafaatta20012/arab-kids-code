import { Schema, model, Document, Types } from 'mongoose';
import { SubscriptionStatus } from '@arab-kids-code/shared';

export interface ISubscriptionDocument extends Document {
  studentId: Types.ObjectId;
  parentId: Types.ObjectId;
  plan: string;
  status: SubscriptionStatus;
  startsAt: Date;
  endsAt?: Date;
  unlockedUpTo: number; // Lesson order unlocked (e.g. 30 for full course)
  paymentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      default: 'full_access',
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
      index: true,
    },
    startsAt: {
      type: Date,
      default: Date.now,
    },
    endsAt: {
      type: Date,
    },
    unlockedUpTo: {
      type: Number,
      default: 30, // Unlocks full 30 lessons by default on active subscription
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
  },
  {
    timestamps: true,
  },
);

export const Subscription = model<ISubscriptionDocument>('Subscription', SubscriptionSchema);
