import express from 'express';
import { GetRegionsController, PostRegionsController, UpdateRegionController } from '../../controllers/regionsController/regionsController.js';
const router = express.Router();


// get all regions
router.get("/region", GetRegionsController)

// post a new region
router.post("/region", PostRegionsController);

// update a region by id
router.put("/region/:id",UpdateRegionController);



export default router;