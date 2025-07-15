import express from 'express';
import { GetFoodsController, PostFoodsController } from '../../controllers/foodsController/foodsController.js';

const router = express.Router();

router.get('/foods', GetFoodsController);
router.post('/foods', PostFoodsController);




export default router;
