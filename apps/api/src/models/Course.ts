import { Schema, model, Document } from 'mongoose';

export interface ICourseDocument extends Document {
  slug: string;
  title: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  ageRange: string;
  isPublished: boolean;
  totalLessons: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourseDocument>(
  {
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
    description: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    ageRange: {
      type: String,
      default: '6-14',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    totalLessons: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
  },
);

export const Course = model<ICourseDocument>('Course', CourseSchema);
