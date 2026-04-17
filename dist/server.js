// src/server.ts
import Fastify from 'fastify';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
// Load environment variables from .env
dotenv.config();
// Initialize Fastify
const fastify = Fastify({
    logger: false // We will turn this off for now to keep our console clean
});
// A simple health-check route to ensure the server is alive
fastify.get('/health', async (request, reply) => {
    return { status: 'healthy', service: 'NexoGuard Ingestion API' };
});
// Start the server
const start = async () => {
    try {
        // 1. Connect to MongoDB Atlas first
        await connectDB();
        // 2. Start listening for incoming traffic
        const port = Number(process.env.PORT) || 8000;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 Fastify Ingestion Engine running on http://localhost:${port}`);
    }
    catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};
start();
