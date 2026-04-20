import Fastify from 'fastify';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { appRoutes } from './routes/index.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';
import middie from '@fastify/middie';
import { initNexoGuard } from 'nexoguard';

const fastify = Fastify({
  logger: config.isDev, // Only show noisy logs in development
});

fastify.setErrorHandler(globalErrorHandler);

fastify.get('/health', async () => {
  return { status: 'healthy', production: config.isProd };
});

fastify.register(appRoutes, { prefix: '/api/v1' });

const start = async () => {
  try {
    await connectDB();
    await fastify.register(middie); // Enable Express middleware support

    const shield = initNexoGuard({
      apiKey: 'nx_test_9988776655', 
      ingestUrl: `http://localhost:${config.port}/api/v1/ingest/logs`, // Send logs to its own route
      flushIntervalMs: 3000, // Set to 3 seconds for fast testing
      excludePaths: ['/api/v1/ingest/logs']
    });

    fastify.use(shield.protect());
    // fastify.use('/health', shield.protect())
    await fastify.listen({ port: config.port, host: '127.0.0.1' });
    console.log(`🚀 Fastify running on http://localhost:${config.port}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
