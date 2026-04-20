// src/routes/index.ts
import { FastifyInstance } from 'fastify';
import { ingestRoutes } from './ingest.routes.js';

export async function appRoutes(fastify: FastifyInstance) {
  fastify.register(ingestRoutes, { prefix: '/ingest' });
}