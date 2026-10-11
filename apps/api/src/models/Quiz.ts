import { Schema, model, Document, Types } from 'mongoose';

export interface IQuizQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface IQuizDocument extends Document {
  lessonId: Types.ObjectId;
  title: string;
  questions: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String },
});

const QuizSchema = new Schema<IQuizDocument>(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    questions: [QuizQuestionSchema],
  },
  {
    timestamps: true,
  },
);

export const Quiz = model<IQuizDocument>('Quiz', QuizSchema);
