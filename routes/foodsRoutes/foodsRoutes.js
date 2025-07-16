import express from 'express';
import { GetFoodByIdController, GetFoodsController, PostFoodsController } from '../../controllers/foodsController/foodsController.js';

const router = express.Router();

router.get('/foods', GetFoodsController);
router.post('/foods', PostFoodsController);

// get food by id
router.get('/foods/:id', GetFoodByIdController);




export default router;
