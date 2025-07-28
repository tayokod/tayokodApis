import express from 'express';
import { getCategories, createCategory, updateCategory } from '../../controllers/categoriesController/categoriesController.js';
const router = express.Router();

// Route to get all categories
router.get('/categories', getCategories);

// Route to create a new category
router.post('/categories', createCategory);

// Route to update a category by id
router.put('/categories/:id', updateCategory);

export default router;
