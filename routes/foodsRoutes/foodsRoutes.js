import express from 'express';
import {
    GetFoodsController,
    GetFoodByIdController,
    PostFoodsController,
    UpdateFoodController,
    DeleteFoodController,
    searchFoodsByCategoryNameController,
} from '../../controllers/foodsController/foodsController.js';

const router = express.Router();

// get all foods (supports search, categoryId, minPrice, maxPrice, page, limit, sort, ...)
router.get('/foods', GetFoodsController);

// create a new food
router.post('/foods', PostFoodsController);

// get food by category (before /foods/:id so "category" is not read as an id)
router.get('/foods/category/:categoryName', searchFoodsByCategoryNameController);

// get food by id
router.get('/foods/:id', GetFoodByIdController);

// update a food by id
router.put('/foods/:id', UpdateFoodController);

// delete a food by id
router.delete('/foods/:id', DeleteFoodController);

export default router;
