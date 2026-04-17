// src/db.ts
import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`✅ Connected to MongoDB Atlas (${config.isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode)`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
}