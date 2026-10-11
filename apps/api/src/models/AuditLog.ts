import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLogDocument extends Document {
  actorId?: Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  ip?: string;
  userAgent?: string;
  diff?: any;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entity: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: String,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    diff: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const AuditLog = model<IAuditLogDocument>('AuditLog', AuditLogSchema);
