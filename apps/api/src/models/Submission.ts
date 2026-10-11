import { Schema, model, Document, Types } from 'mongoose';

export interface ISubmissionDocument extends Document {
  studentId: Types.ObjectId;
  lessonId: Types.ObjectId;
  scratchLink?: string;
  fileAssetId?: string;
  status: 'pending' | 'reviewed';
  teacherFeedback?: string;
  rating?: number; // 1-5 stars
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmissionDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    scratchLink: {
      type: String,
      trim: true,
    },
    fileAssetId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed'],
      default: 'pending',
      index: true,
    },
    teacherFeedback: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

export const Submission = model<ISubmissionDocument>('Submission', SubmissionSchema);
