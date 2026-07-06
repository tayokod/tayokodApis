import express from 'express';
import {
    GetRegionsController,
    GetRegionByIdController,
    GetRegionZonesController,
    PostRegionsController,
    UpdateRegionController,
    DeleteRegionController,
} from '../../controllers/regionsController/regionsController.js';
const router = express.Router();

// get all regions ("/region" kept as an alias for older clients)
router.get('/regions', GetRegionsController);
router.get('/region', GetRegionsController);

// get a region by id
router.get('/regions/:id', GetRegionByIdController);

// get the zones of a region
router.get('/regions/:id/zones', GetRegionZonesController);

// post a new region
router.post('/regions', PostRegionsController);
router.post('/region', PostRegionsController);

// update a region by id
router.put('/regions/:id', UpdateRegionController);
router.put('/region/:id', UpdateRegionController);

// delete a region by id
router.delete('/regions/:id', DeleteRegionController);

export default router;
