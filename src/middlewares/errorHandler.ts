// src/middlewares/errorHandler.ts
import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { config } from '../config/env.js';

export function globalErrorHandler(
  error: FastifyError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // 1. Log the error to the console (Verbose in Dev, clean in Prod)
  if (config.isDev) {
    console.error(`[❌ ERROR] ${request.method} ${request.url}`, error);
  } else {
    console.error(`[❌ ERROR] ${request.method} ${request.url} - ${error.message}`);
  }

  // 2. Catch Zod Validation Errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: 'Validation Error',
      // Map Zod's complex error array into a clean, readable format
      issues: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // 3. Catch Fastify/HTTP Errors (e.g., 401 Unauthorized, 404 Not Found)
  if ('statusCode' in error && error.statusCode) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.name || 'Request Error',
      message: error.message,
    });
  }

  // 4. Catch Everything Else (Unhandled Exceptions / Database Crashes)
  return reply.status(500).send({
    success: false,
    error: 'Internal Server Error',
    message: config.isDev ? error.message : 'Something went critically wrong.',
  });
}