import mongoose, { Schema, Document } from 'mongoose';

export interface IApiKey extends Document {
  name: string; // e.g., "Production Shield"
  keyHash: string; // The securely hashed version of the API key
  prefix: string; // e.g., "nx_live_abc1" (to show in the UI for identification)
  workspaceId: mongoose.Types.ObjectId;
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    name: { type: String, required: true, trim: true },
    keyHash: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date },
  },
  { timestamps: true },
);

apiKeySchema.index({ keyHash: 1 });
apiKeySchema.index({ workspaceId: 1 });

export const ApiKeyModel = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
