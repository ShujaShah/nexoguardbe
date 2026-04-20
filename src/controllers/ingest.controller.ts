// src/controllers/ingest.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { ingestPayloadSchema } from '../validations/ingest.validation.js';
import { LogModel } from '../models/log.model.js';

export const ingestLogs = async (request: FastifyRequest, reply: FastifyReply) => {
  // 1. Validate the incoming payload.
  // If hackers send junk, Zod throws an error here and Fastify routes it to your global handler.
  const payload = ingestPayloadSchema.parse(request.body);

  // 2. Prepare the data for Time Series insertion.
  // We map over the array to attach the tenant's API key to every individual log document.
  const logsToInsert = payload.logs.map((log) => ({
    ...log,
    apiKey: payload.apiKey, 
  }));

  // 3. Bulk insert the logs into MongoDB.
  // insertMany is highly optimized for writing large arrays of data simultaneously.
  const result = await LogModel.insertMany(logsToInsert);

  // 4. Return a fast, lightweight acknowledgement to the agent.
  return reply.status(200).send({
    success: true,
    message: 'Telemetry ingested successfully',
    insertedCount: result.length,
  });
};