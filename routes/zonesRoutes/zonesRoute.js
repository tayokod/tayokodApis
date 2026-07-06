import express from 'express';
import {
    getAllZones,
    getZoneById,
    registerZone,
    updateZone,
    deleteZone,
} from '../../controllers/zonesConrollers/zonesController.js';
const router = express.Router();

// get all zones (supports ?regionId=, ?page=, ?limit=)
router.get('/zones', getAllZones);

// get a zone by id
router.get('/zones/:id', getZoneById);

// register a zone
router.post('/zones', registerZone);

// update a zone by id
router.put('/zones/:id', updateZone);

// delete a zone by id
router.delete('/zones/:id', deleteZone);

export default router;
