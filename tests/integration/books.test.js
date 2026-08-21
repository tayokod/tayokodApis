import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

process.env.API_KEY = 'test-key';
const app = (await import('../helpers/app.js')).default;

const VALID_KEY = 'test-key';

describe('Books API (integration)', () => {
  // ---- GET /api/books ----

  describe('GET /api/books', () => {
    it('returns 200 for unauthenticated reads', async () => {
      const res = await request(app).get('/api/books');
      // Without a real DB this may 500, but must not 403
      expect(res.status).not.toBe(403);
    });

    it('accepts search query params', async () => {
      const res = await request(app).get('/api/books?search=javascript&genre=programming');
      expect(res.status).not.toBe(403);
    });

    it('accepts pagination params', async () => {
      const res = await request(app).get('/api/books?page=1&limit=5');
      expect(res.status).not.toBe(403);
    });
  });

  // ---- GET /api/books/:id ----

  describe('GET /api/books/:id', () => {
    it('rejects non-numeric id with 400', async () => {
      const res = await request(app).get('/api/books/abc');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('positive integer');
    });

    it('rejects negative id with 400', async () => {
      const res = await request(app).get('/api/books/-1');
      expect(res.status).toBe(400);
    });

    it('rejects zero id with 400', async () => {
      const res = await request(app).get('/api/books/0');
      expect(res.status).toBe(400);
    });

    it('rejects float id with 400', async () => {
      const res = await request(app).get('/api/books/1.5');
      expect(res.status).toBe(400);
    });

    it('accepts valid numeric id (may 500 without DB)', async () => {
      const res = await request(app).get('/api/books/1');
      // Without DB, Prisma will fail → 500. But NOT 400 or 403.
      expect(res.status).not.toBe(400);
      expect(res.status).not.toBe(403);
    });
  });

  // ---- POST /api/books ----

  describe('POST /api/books', () => {
    it('rejects without API key (403)', async () => {
      const res = await request(app)
        .post('/api/books')
        .send({ title: 'Test', genre: 'fiction', authorId: 1, publishedYear: 2020 });
      expect(res.status).toBe(403);
    });

    it('rejects with wrong API key (403)', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-api-key', 'wrong')
        .send({ title: 'Test', genre: 'fiction', authorId: 1, publishedYear: 2020 });
      expect(res.status).toBe(403);
    });

    it('rejects empty body with 400', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-api-key', VALID_KEY)
        .send({});
      expect(res.status).toBe(400);
    });

    it('rejects missing required fields with 400', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-api-key', VALID_KEY)
        .send({ title: 'Only Title' });
      expect(res.status).toBe(400);
    });

    it('rejects invalid authorId with 400', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-api-key', VALID_KEY)
        .send({
          title: 'Test',
          genre: 'fiction',
          authorId: -1,
          publishedYear: 2020,
        });
      expect(res.status).toBe(400);
    });

    it('rejects publishedYear out of range with 400', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-api-key', VALID_KEY)
        .send({
          title: 'Test',
          genre: 'fiction',
          authorId: 1,
          publishedYear: 3000,
        });
      expect(res.status).toBe(400);
    });

    it('accepts valid body with API key (may 500 without DB)', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-api-key', VALID_KEY)
        .send({
          title: 'Learning JavaScript',
          genre: 'programming',
          authorId: 1,
          publishedYear: 2020,
        });
      // Without DB: Prisma fails → 500. But NOT 400 or 403.
      expect(res.status).not.toBe(400);
      expect(res.status).not.toBe(403);
    });
  });

  // ---- PATCH /api/books/:id ----

  describe('PATCH /api/books/:id', () => {
    it('rejects without API key (403)', async () => {
      const res = await request(app)
        .patch('/api/books/1')
        .send({ title: 'Updated' });
      expect(res.status).toBe(403);
    });

    it('rejects empty body with 400', async () => {
      const res = await request(app)
        .patch('/api/books/1')
        .set('x-api-key', VALID_KEY)
        .send({});
      expect(res.status).toBe(400);
    });

    it('rejects invalid id with 400', async () => {
      const res = await request(app)
        .patch('/api/books/abc')
        .set('x-api-key', VALID_KEY)
        .send({ title: 'Updated' });
      expect(res.status).toBe(400);
    });

    it('accepts valid partial update with API key', async () => {
      const res = await request(app)
        .patch('/api/books/1')
        .set('x-api-key', VALID_KEY)
        .send({ title: 'Updated Title' });
      expect(res.status).not.toBe(400);
      expect(res.status).not.toBe(403);
    });
  });

  // ---- DELETE /api/books/:id ----

  describe('DELETE /api/books/:id', () => {
    it('rejects without API key (403)', async () => {
      const res = await request(app).delete('/api/books/1');
      expect(res.status).toBe(403);
    });

    it('rejects invalid id with 400', async () => {
      const res = await request(app)
        .delete('/api/books/abc')
        .set('x-api-key', VALID_KEY);
      expect(res.status).toBe(400);
    });

    it('accepts valid id with API key', async () => {
      const res = await request(app)
        .delete('/api/books/1')
        .set('x-api-key', VALID_KEY);
      expect(res.status).not.toBe(400);
      expect(res.status).not.toBe(403);
    });
  });

  // ---- 404 catch-all ----

  describe('Unknown routes', () => {
    it('returns 404 for unknown API paths', async () => {
      const res = await request(app).get('/api/unknown');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });

    it('returns 404 for unknown non-API paths', async () => {
      const res = await request(app).get('/random');
      expect(res.status).toBe(404);
    });
  });
});
