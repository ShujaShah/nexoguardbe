import { FastifyRequest, FastifyReply } from 'fastify';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { 
  registerSchema, loginSchema, verifyEmailSchema, 
  emailOnlySchema, resetPasswordSchema, refreshTokenSchema, googleAuthSchema 
} from '../validations/auth.validation.js';
import { UserModel } from '../models/user.model.js';
import { WorkspaceModel } from '../models/workspace.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';

// Helper: Generate Tokens
const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { userId: user._id, workspaceId: user.workspaceId, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' } 
  );
  const refreshToken = jwt.sign(
    { userId: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' } 
  );
  return { accessToken, refreshToken };
};

// ==========================================
// REGISTRATION & EMAIL VERIFICATION
// ==========================================
export const register = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password, workspaceName } = registerSchema.parse(request.body);

  if (await UserModel.findOne({ email })) {
    return reply.status(409).send({ success: false, error: 'Email already in use' });
  }

  const newWorkspace = await WorkspaceModel.create({ name: workspaceName });
  const passwordHash = await bcrypt.hash(password, 10);
  
  // TODO: Implement real random code generation
  const verificationCode = "1234"; 
  const verificationCodeExpiresAt = new Date(Date.now() + 60 * 60 * 1000); 

  const newUser = await UserModel.create({
    email,
    passwordHash,
    workspaceId: newWorkspace._id,
    verificationCode,
    verificationCodeExpiresAt
  });

  // TODO: Send email
  console.log(`[Email Mock] Sent code ${verificationCode} to ${email}`);

  return reply.status(201).send({ 
    success: true, 
    message: 'Registration successful. Please verify email.' 
  });
};

export const verifyEmail = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, code } = verifyEmailSchema.parse(request.body);
  
  // 1. Find the user including the verification fields
  const user = await UserModel.findOne({ email, verificationCode: code });

  // 2. Validate code and expiry
  if (!user || !user.verificationCodeExpiresAt || user.verificationCodeExpiresAt < new Date()) {
    return reply.status(400).send({ 
      success: false, 
      error: 'Invalid or expired verification code' 
    });
  }

  // 3. Update user status and clear codes
  user.isEmailVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpiresAt = undefined;
  
  // 4. Generate tokens so they are logged in immediately
  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  
  await user.save();

  // 5. Return success with tokens
  return reply.status(200).send({ 
    success: true, 
    message: 'Email verified and logged in successfully',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId
    }
  });
};

export const resendVerificationCode = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email } = emailOnlySchema.parse(request.body);
  const user = await UserModel.findOne({ email });

  if (!user) return reply.status(404).send({ success: false, error: 'User not found' });
  if (user.isEmailVerified) return reply.status(400).send({ success: false, error: 'Already verified' });

  user.verificationCode = "1234"; 
  user.verificationCodeExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  // TODO: Send email
  console.log(`[Email Mock] Resent code 1234 to ${email}`);

  return reply.status(200).send({ success: true, message: 'Code resent successfully' });
};

// ==========================================
// LOGIN & TOKENS
// ==========================================
export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = loginSchema.parse(request.body);
  const user = await UserModel.findOne({ email });

  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return reply.status(401).send({ success: false, error: 'Invalid credentials' });
  }
  if (!user.isEmailVerified) {
    return reply.status(403).send({ success: false, error: 'Please verify your email first' });
  }

  const { accessToken, refreshToken } = generateTokens(user);
  
  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save();

  const userResponse = user.toObject();
  // Delete sensitive fields
  delete userResponse.passwordHash;
  delete userResponse.refreshToken;
  delete userResponse.verificationCode;
  delete userResponse.resetPasswordCode;

  return reply.status(200).send({ 
    success: true, 
    message: 'Login successful',
    accessToken, 
    refreshToken,
    user: userResponse
  });
};

export const refreshAccessToken = async (request: FastifyRequest, reply: FastifyReply) => {
  const { refreshToken } = refreshTokenSchema.parse(request.body);

  try {
    const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await UserModel.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error();
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    return reply.status(200).send({
      success: true,
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (err) {
    return reply.status(401).send({ success: false, error: 'Invalid or expired refresh token' });
  }
};

// ==========================================
// PASSWORD RECOVERY
// ==========================================
export const forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email } = emailOnlySchema.parse(request.body);
  const user = await UserModel.findOne({ email });

  if (user) {
    user.resetPasswordCode = "1234"; 
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    // TODO: Send email
    console.log(`[Email Mock] Password reset code 1234 sent to ${email}`);
  }

  return reply.status(200).send({ 
    success: true, 
    message: 'If the email exists, a reset code has been sent.' 
  });
};

export const resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, code, newPassword } = resetPasswordSchema.parse(request.body);
  const user = await UserModel.findOne({ email, resetPasswordCode: code });

  if (!user || !user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
    return reply.status(400).send({ success: false, error: 'Invalid or expired reset code' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordCode = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  return reply.status(200).send({ success: true, message: 'Password reset successful' });
};

// ==========================================
// GOOGLE AUTH (OAUTH)
// ==========================================
export const googleAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  const { googleToken } = googleAuthSchema.parse(request.body);
  
  // Mocking the Google payload for now
  const googlePayload = { email: "user@gmail.com", sub: "google_12345", name: "John" };

  let user = await UserModel.findOne({ email: googlePayload.email });

  if (!user) {
    const workspace = await WorkspaceModel.create({ name: `${googlePayload.name}'s Workspace` });
    user = await UserModel.create({
      email: googlePayload.email,
      googleId: googlePayload.sub,
      workspaceId: workspace._id,
      isEmailVerified: true 
    });
  } else if (!user.googleId) {
    user.googleId = googlePayload.sub;
  }

  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save();

  return reply.status(200).send({ 
    success: true, 
    message: 'Google login successful',
    accessToken, 
    refreshToken 
  });
};

// ==========================================
// ACCOUNT DELETION (SOFT DELETE)
// ==========================================
export const softDeleteAccount = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Make sure you use 'reply' here, not 'res'
    return reply.status(401).send({ success: false, error: 'Unauthorized' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    // Use your JWT_SECRET here
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    
    await UserModel.findByIdAndUpdate(decoded.userId, { 
      deletedAt: new Date() 
    });

    return reply.status(200).send({ 
      success: true, 
      message: 'Account scheduled for deletion in 30 days.' 
    });
  } catch (err) {
    return reply.status(401).send({ success: false, error: 'Unauthorized or token expired' });
  }
};