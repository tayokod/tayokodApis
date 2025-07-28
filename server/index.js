import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// middleware to handle errors
const authMiddleware = (req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
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



app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});