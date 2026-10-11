import { Schema, model, Document, Types } from 'mongoose';
import { PaymentStatus } from '@arab-kids-code/shared';

export interface IPaymentDocument extends Document {
  parentId: Types.ObjectId;
  provider: 'paymob' | 'fawry' | 'stripe' | 'manual';
  providerRef: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  rawWebhook?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['paymob', 'fawry', 'stripe', 'manual'],
      required: true,
    },
    providerRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'EGP',
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    rawWebhook: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

export const Payment = model<IPaymentDocument>('Payment', PaymentSchema);
