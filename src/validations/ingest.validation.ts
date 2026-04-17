// src/validations/ingest.validation.ts
import { z } from 'zod';

// 1. Define the schema for a single log entry
const logEntrySchema = z.object({
  timestamp: z.string().datetime(), // Ensures it's a valid ISO 8601 date string
  request: z.object({
    ip: z.string(),
    method: z.string(),
    path: z.string(),
    browser: z.string(),
    os: z.string(),
    country: z.string(),
  }),
  threat_intel: z.object({
    was_blocked: z.boolean(),
    tags: z.array(z.string()),
  }),
  payload: z.object({
    headers: z.record(z.any()).nullable().optional(), // Maps to our sanitized headers
    body: z.any().nullable().optional(),              // Maps to our sanitized body
  }),
  response: z.object({
    statusCode: z.number(),
    latency_ms: z.number(),
  }),
});

// 2. Define the schema for the incoming POST request body
export const ingestPayloadSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  logs: z.array(logEntrySchema),
});

// 3. EXTREMELY POWERFUL: Extract the TypeScript type directly from the schema!
export type IngestPayload = z.infer<typeof ingestPayloadSchema>;