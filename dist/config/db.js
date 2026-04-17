// src/db.ts
import mongoose from 'mongoose';
export async function connectDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("❌ MONGO_URI is missing from the .env file.");
    }
    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB Atlas (NexoGuard Cluster)');
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1); // Kill the server if it can't connect to the DB
    }
}
