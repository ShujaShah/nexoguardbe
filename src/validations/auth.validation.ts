import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  workspaceName: z.string().min(2)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().min(1)
});

export const emailOnlySchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().min(1),
  newPassword: z.string().min(8)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

export const googleAuthSchema = z.object({
  googleToken: z.string().min(1) // Token sent from the frontend
});