import { Schema, model, Document, Types } from 'mongoose';
import { LessonProgressStatus } from '@arab-kids-code/shared';

export interface IProgressDocument extends Document {
  studentId: Types.ObjectId;
  lessonId: Types.ObjectId;
  status: LessonProgressStatus;
  watchedSeconds: number;
  completedAt?: Date;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgressDocument>(
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
    status: {
      type: String,
      enum: Object.values(LessonProgressStatus),
      default: LessonProgressStatus.NOT_STARTED,
    },
    watchedSeconds: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    score: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

ProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

export const Progress = model<IProgressDocument>('Progress', ProgressSchema);
