import { FastifyInstance } from 'fastify';
import { ingestRoutes } from './ingest.routes.js';
import { authRoutes } from './auth.routes.js';

export async function appRoutes(fastify: FastifyInstance) {
  fastify.register(ingestRoutes, { prefix: '/ingest' });
  fastify.register(authRoutes, { prefix: '/auth' });
}