import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from '../lib/errors.js';
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

// importing food routes
import foodsRoutes from '../routes/foodsRoutes/foodsRoutes.js';
app.use('/api', foodsRoutes);


// importing categories routes
import categoriesRoutes from '../routes/categoreisRoutes/categoriesRoute.js';
app.use('/api', categoriesRoutes);


// importing regions routes
import regionsRoutes from '../routes/regionsRoutes/regionsRoute.js';
app.use('/api', regionsRoutes);


// importing zones routes
import zonesRoutes from '../routes/zonesRoutes/zonesRoute.js';
app.use('/api', zonesRoutes);


// unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// central error handler (must be registered last)
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});