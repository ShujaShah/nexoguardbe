import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    plan: { 
      type: String, 
      enum: ['free', 'pro', 'enterprise'], 
      default: 'free' 
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const WorkspaceModel = mongoose.model<IWorkspace>('Workspace', workspaceSchema);