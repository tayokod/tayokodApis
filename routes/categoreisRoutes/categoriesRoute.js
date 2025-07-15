import express from 'express';
import { getCategories, createCategory } from '../../controllers/categoriesController/categoriesController.js';
const router = express.Router();

// Route to get all categories
router.get('/categories', getCategories);

// Route to create a new category
router.post('/categories', createCategory);

export default router;
