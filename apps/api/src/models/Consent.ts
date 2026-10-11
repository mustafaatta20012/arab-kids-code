import { Schema, model, Document, Types } from 'mongoose';

export interface IConsentDocument extends Document {
  parentId: Types.ObjectId;
  policyVersion: string;
  acceptedAt: Date;
  ip: string;
}

const ConsentSchema = new Schema<IConsentDocument>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
      index: true,
    },
    policyVersion: {
      type: String,
      required: true,
      default: 'v1.0',
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
    },
    ip: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Consent = model<IConsentDocument>('Consent', ConsentSchema);
