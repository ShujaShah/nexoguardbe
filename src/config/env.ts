// src/config/env.ts
import dotenv from 'dotenv';
import { z } from 'zod';

// Load the standard .env file
dotenv.config();

// Define the simplified schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().transform(Number).default('8000'),
  MONGO_URI: z.string().url({ message: "Missing or invalid MongoDB URL" }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

const rawEnv = parsedEnv.data;

// Export the clean configuration object
export const config = {
  isDev: rawEnv.NODE_ENV === 'development',
  isProd: rawEnv.NODE_ENV === 'production',
  port: rawEnv.PORT,
  mongoUri: rawEnv.MONGO_URI,
};