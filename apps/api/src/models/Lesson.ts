import { Schema, model, Document, Types } from 'mongoose';

export interface ILessonDocument extends Document {
  courseId: Types.ObjectId;
  order: number;
  slug: string;
  title: {
    ar: string;
    en: string;
  };
  summary: {
    ar: string;
    en: string;
  };
  videoAssetId?: string;
  videoUrl?: string;
  scratchProjectUrl?: string;
  resources: Array<{
    title: string;
    url: string;
    type: 'pdf' | 'image' | 'link';
  }>;
  quizId?: Types.ObjectId;
  isFree: boolean;
  isPublished: boolean;
  durationMin: number;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILessonDocument>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    summary: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    videoAssetId: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    scratchProjectUrl: {
      type: String,
    },
    resources: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, enum: ['pdf', 'image', 'link'], default: 'link' },
      },
    ],
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    durationMin: {
      type: Number,
      default: 15,
    },
    xpReward: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
  },
);

LessonSchema.index({ courseId: 1, order: 1 });

export const Lesson = model<ILessonDocument>('Lesson', LessonSchema);
