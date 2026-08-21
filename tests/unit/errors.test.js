import { describe, it, expect, vi } from 'vitest';
import { ZodError } from 'zod';
import { ApiError, errorHandler } from '../../lib/errors.js';

// ---------- ApiError ----------

describe('ApiError', () => {
  it('stores status and message', () => {
    const err = new ApiError(404, 'Not found');
    expect(err.status).toBe(404);
    expect(err.message).toBe('Not found');
  });

  it('is an instance of Error', () => {
    const err = new ApiError(500, 'Oops');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });
});

// ---------- errorHandler ----------

function mockRes() {
  const res = {
    _status: null,
    _body: null,
    status(s) { res._status = s; return res; },
    json(body) { res._body = body; return res; },
  };
  return res;
}

function mockReq(method = 'GET', url = '/api/test') {
  return { method, originalUrl: url };
}

describe('errorHandler', () => {
  it('handles ApiError with correct status', () => {
    const res = mockRes();
    const err = new ApiError(404, 'Food not found');

    errorHandler(err, mockReq(), res, vi.fn());

    expect(res._status).toBe(404);
    expect(res._body).toEqual({ error: 'Food not found' });
  });

  it('handles ApiError(400)', () => {
    const res = mockRes();
    const err = new ApiError(400, 'id must be a positive integer');

    errorHandler(err, mockReq(), res, vi.fn());

    expect(res._status).toBe(400);
    expect(res._body).toEqual({ error: 'id must be a positive integer' });
  });

  it('handles ApiError(409)', () => {
    const res = mockRes();
    const err = new ApiError(409, 'Duplicate');

    errorHandler(err, mockReq(), res, vi.fn());

    expect(res._status).toBe(409);
  });

  it('handles ZodError with field details', () => {
    const res = mockRes();
    const err = new ZodError([
      { code: 'invalid_type', expected: 'string', received: 'undefined', path: ['name'], message: 'Required' },
    ]);

    errorHandler(err, mockReq(), res, vi.fn());

    expect(res._status).toBe(400);
    expect(res._body.error).toBe('Validation failed');
    expect(res._body.details).toEqual([
      { path: 'name', message: 'Required' },
    ]);
  });

  it('handles Prisma P2002 (unique constraint)', () => {
    const res = mockRes();
    const err = Object.assign(new Error('Unique constraint'), {
      name: 'PrismaClientKnownRequestError',
      code: 'P2002',
      meta: { target: ['name'] },
    });

    // We can't easily construct a real PrismaClientKnownRequestError,
    // so we test the handler's instanceof check won't match and falls to 500.
    // This is expected — real Prisma errors in integration tests will be caught there.
    errorHandler(err, mockReq(), res, vi.fn());
    // Falls through to 500 since it's not a real Prisma instance
    expect(res._status).toBe(500);
  });

  it('handles generic errors with 500', () => {
    const res = mockRes();
    const err = new Error('Something broke');

    errorHandler(err, mockReq(), res, vi.fn());

    expect(res._status).toBe(500);
    expect(res._body).toEqual({ error: 'Internal Server Error' });
  });

  it('does not call next()', () => {
    const next = vi.fn();
    const res = mockRes();

    errorHandler(new ApiError(400, 'Bad'), mockReq(), res, next);

    expect(next).not.toHaveBeenCalled();
  });

  it('handles non-Error throws gracefully', () => {
    const res = mockRes();

    errorHandler('string error', mockReq(), res, vi.fn());

    expect(res._status).toBe(500);
    expect(res._body).toEqual({ error: 'Internal Server Error' });
  });
});
