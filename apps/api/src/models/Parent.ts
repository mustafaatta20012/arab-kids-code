import { Schema, model, Document, Types } from 'mongoose';

export interface IParentDocument extends Document {
  userId: Types.ObjectId;
  phone: string;
  whatsapp?: string;
  children: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ParentSchema = new Schema<IParentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Parent = model<IParentDocument>('Parent', ParentSchema);
