import { FastifyInstance } from 'fastify';
import { 
  register, login, verifyEmail, resendVerificationCode, 
  refreshAccessToken, forgotPassword, resetPassword, 
  googleAuth, softDeleteAccount 
} from '../controllers/auth.controller.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Standard Auth
  fastify.post('/register', register);
  fastify.post('/login', login);
  
  // Email Verification
  fastify.post('/verify-email', verifyEmail);
  fastify.post('/resend-verification', resendVerificationCode);
  
  // Token Management
  fastify.post('/refresh-token', refreshAccessToken);
  
  // Password Management
  fastify.post('/forgot-password', forgotPassword);
  fastify.post('/reset-password', resetPassword);
  
  // OAuth
  fastify.post('/google', googleAuth);
  
  // Account Management
  fastify.post('/delete-account', softDeleteAccount);
}