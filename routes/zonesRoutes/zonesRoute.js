import express from 'express';
const router = express.Router();



// importing zones controller functions
import { getAllZones, registerZone } from '../../controllers/zonesConrollers/zonesController.js';


// get all zones
router.get('/zones', getAllZones);


// register a zone
router.post('/zones', registerZone);

export default router;