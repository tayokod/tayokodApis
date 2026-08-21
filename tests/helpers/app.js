// Test helper: builds the Express app without calling app.listen().
// Mirrors server/index.js structure so integration tests hit the real middleware stack.

import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from '../../lib/errors.js';

import foodsRoutes from '../../routes/foodsRoutes/foodsRoutes.js';
import categoriesRoutes from '../../routes/categoriesRoutes/categoriesRoutes.js';
import citiesRoutes from '../../routes/citiesRoutes/citiesRoutes.js';
import productsRoutes from '../../routes/productsRoutes/productsRoutes.js';
import studentsRoutes from '../../routes/studentsRoutes/studentsRoutes.js';
import marksRoutes from '../../routes/marksRoutes/marksRoutes.js';
import authorsRoutes from '../../routes/authorsRoutes/authorsRoutes.js';
import booksRoutes from '../../routes/booksRoutes/booksRoutes.js';
import companiesRoutes from '../../routes/companiesRoutes/companiesRoutes.js';
import jobsRoutes from '../../routes/jobsRoutes/jobsRoutes.js';

// Parse valid keys into a Set (same logic as server/index.js)
const validKeys = new Set(
  (process.env.API_KEYS ?? process.env.API_KEY ?? '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(process.cwd(), 'images')));

const authMiddleware = (req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !validKeys.has(apiKey)) {
      return res.status(403).json({ error: 'Forbidden. Invalid API key.' });
    }
  }
  next();
};

app.use(authMiddleware);

app.use('/api', foodsRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', citiesRoutes);
app.use('/api', productsRoutes);
app.use('/api', studentsRoutes);
app.use('/api', marksRoutes);
app.use('/api', authorsRoutes);
app.use('/api', booksRoutes);
app.use('/api', companiesRoutes);
app.use('/api', jobsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export default app;
