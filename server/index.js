import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// importing food routes
import foodsRoutes from '../routes/foodsRoutes/foodsRoutes.js';
app.use('/api', foodsRoutes);


// importing categories routes
import categoriesRoutes from '../routes/categoreisRoutes/categoriesRoute.js';
app.use('/api', categoriesRoutes);



app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});