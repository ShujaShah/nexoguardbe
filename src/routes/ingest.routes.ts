// src/routes/ingest.routes.ts
import { FastifyInstance } from 'fastify';
import { ingestLogs } from '../controllers/ingest.controller.js';

export async function ingestRoutes(fastify: FastifyInstance) {
  fastify.post('/logs', ingestLogs);
}