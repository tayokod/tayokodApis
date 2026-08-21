import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

// Set test API keys before importing the app
process.env.API_KEY = 'test-key-1';
process.env.API_KEYS = 'test-key-1,test-key-2,test-key-3';

const app = (await import('../helpers/app.js')).default;

describe('Auth middleware', () => {
  describe('GET requests (public reads)', () => {
    it('allows GET without API key', async () => {
      const res = await request(app).get('/api/books');
      expect(res.status).not.toBe(403);
    });

    it('allows GET with wrong API key', async () => {
      const res = await request(app)
        .get('/api/books')
        .set('x-api-key', 'wrong-key');
      expect(res.status).not.toBe(403);
    });

    it('allows HEAD without API key', async () => {
      const res = await request(app).head('/api/books');
      expect(res.status).not.toBe(403);
    });
  });

  describe('POST requests (writes)', () => {
    it('rejects POST without API key', async () => {
      const res = await request(app)
        .post('/api/books')
        .send({ title: 'Test' });
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden');
    });

    it('rejects POST with wrong API key', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-api-key', 'wrong-key')
        .send({ title: 'Test' });
      expect(res.status).toBe(403);
    });

    it('accepts POST with valid API key (test-key-1)', async () => {
      // This will fail with 400 (validation) or 500 (no DB), but NOT 403
      const res = await request(app)
        .post('/api/books')
        .set('x-api-key', 'test-key-1')
        .send({ title: 'Test' });
      expect(res.status).not.toBe(403);
    });

    it('accepts POST with second valid key (test-key-2)', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-api-key', 'test-key-2')
        .send({ title: 'Test' });
      expect(res.status).not.toBe(403);
    });

    it('accepts POST with third valid key (test-key-3)', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-api-key', 'test-key-3')
        .send({ title: 'Test' });
      expect(res.status).not.toBe(403);
    });
  });

  describe('PUT/PATCH requests (updates)', () => {
    it('rejects PATCH without API key', async () => {
      const res = await request(app)
        .patch('/api/books/1')
        .send({ title: 'Updated' });
      expect(res.status).toBe(403);
    });

    it('rejects PUT without API key', async () => {
      const res = await request(app)
        .put('/api/foods/1')
        .send({ name: 'Updated' });
      expect(res.status).toBe(403);
    });

    it('accepts PATCH with valid key', async () => {
      const res = await request(app)
        .patch('/api/books/1')
        .set('x-api-key', 'test-key-1')
        .send({ title: 'Updated' });
      expect(res.status).not.toBe(403);
    });
  });

  describe('DELETE requests', () => {
    it('rejects DELETE without API key', async () => {
      const res = await request(app).delete('/api/books/1');
      expect(res.status).toBe(403);
    });

    it('accepts DELETE with valid key', async () => {
      const res = await request(app)
        .delete('/api/books/1')
        .set('x-api-key', 'test-key-1');
      expect(res.status).not.toBe(403);
    });
  });

  describe('Unknown routes', () => {
    it('returns 404 for unknown paths', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });
  });
});
