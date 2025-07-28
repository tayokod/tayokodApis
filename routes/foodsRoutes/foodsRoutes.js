import express from 'express';
import { GetFoodByIdController,  GetFoodsController, PostFoodsController, searchFoodsByCategoryNameController } from '../../controllers/foodsController/foodsController.js';

const router = express.Router();

router.get('/foods', GetFoodsController);
router.post('/foods', PostFoodsController);

// get food by id
router.get('/foods/:id', GetFoodByIdController);

// get food by category
router.get('/foods/category/:categoryName', searchFoodsByCategoryNameController);




export default router;
