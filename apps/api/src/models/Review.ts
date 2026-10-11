import { Schema, model, Document, Types } from 'mongoose';
import { ReviewStatus } from '@arab-kids-code/shared';

export interface IReviewDocument extends Document {
  authorName: string;
  authorType: 'parent' | 'student';
  rating: number; // 1-5
  text: string;
  status: ReviewStatus;
  moderatedBy?: Types.ObjectId;
  moderatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorType: {
      type: String,
      enum: ['parent', 'student'],
      default: 'parent',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.PENDING,
      index: true,
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    moderatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const Review = model<IReviewDocument>('Review', ReviewSchema);
