import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from '../lib/errors.js';

import foodsRoutes from '../routes/foodsRoutes/foodsRoutes.js';
import categoriesRoutes from '../routes/categoreisRoutes/categoriesRoute.js';
import citiesRoutes from '../routes/citiesRoutes/citiesRoutes.js';
import productsRoutes from '../routes/productsRoutes/productsRoutes.js';
import studentsRoutes from '../routes/studentsRoutes/studentsRoutes.js';
import marksRoutes from '../routes/marksRoutes/marksRoutes.js';
import authorsRoutes from '../routes/authorsRoutes/authorsRoutes.js';
import booksRoutes from '../routes/booksRoutes/booksRoutes.js';
import companiesRoutes from '../routes/companiesRoutes/companiesRoutes.js';
import jobsRoutes from '../routes/jobsRoutes/jobsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable is required');
}

app.use(cors());
app.use(express.json());


// require an API key for anything that isn't a read
const authMiddleware = (req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== process.env.API_KEY) {
      return res.status(403).json({ error: "Forbidden. Invalid API key." });
    }
  }
  next();
};

app.use(authMiddleware);

// all resources live under /api
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


// unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// central error handler (must be registered last)
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
