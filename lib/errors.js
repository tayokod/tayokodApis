import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Central error handler. Express 5 forwards rejected promises from async
// handlers here automatically, so controllers can just throw.
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = err.meta?.target?.join(', ') ?? 'field';
      return res.status(409).json({ error: `A record with this ${fields} already exists` });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Related record does not exist' });
    }
  }

  console.error(`Error handling ${req.method} ${req.originalUrl}:`, err);
  return res.status(500).json({ error: 'Internal Server Error' });
};
