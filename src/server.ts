import Fastify from 'fastify';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';

const fastify = Fastify({ 
  logger: config.isDev // Only show noisy logs in development
});

fastify.setErrorHandler(globalErrorHandler);

fastify.get('/health', async () => {
  return { status: 'healthy', production: config.isProd };
});

const start = async () => {
  try {
    await connectDB();
    await fastify.listen({ port: config.port, host: '127.0.0.1' });
    console.log(`🚀 Fastify running on http://localhost:${config.port}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();