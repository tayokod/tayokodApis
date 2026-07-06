import express from 'express';
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../../controllers/categoriesController/categoriesController.js';
const router = express.Router();

// Route to get all categories
router.get('/categories', getCategories);

// Route to get a category by id
router.get('/categories/:id', getCategoryById);

// Route to create a new category
router.post('/categories', createCategory);

// Route to update a category by id
router.put('/categories/:id', updateCategory);

// Route to delete a category by id
router.delete('/categories/:id', deleteCategory);

export default router;
