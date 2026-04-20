import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string; // Optional because Google Auth users might not have a password
  workspaceId: mongoose.Types.ObjectId;
  role: 'admin' | 'developer' | 'viewer';
  
  // Verification & Resets
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiresAt?: Date;
  resetPasswordCode?: string;
  resetPasswordExpiresAt?: Date;
  
  // Tokens & OAuth
  refreshToken?: string;
  googleId?: string;
  
  // Lifecycle
  lastLoginAt?: Date;
  deletedAt?: Date | null; // For the 30-day soft delete cron job
  
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String }, 
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    role: { type: String, enum: ['admin', 'developer', 'viewer'], default: 'admin' },
    
    isEmailVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpiresAt: { type: Date },
    resetPasswordCode: { type: String },
    resetPasswordExpiresAt: { type: Date },
    
    refreshToken: { type: String },
    googleId: { type: String, unique: true, sparse: true }, 
    
    lastLoginAt: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Filter out soft-deleted users in normal queries automatically
userSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.find({ deletedAt: null });
  next();
});

export const UserModel = mongoose.model<IUser>('User', userSchema);