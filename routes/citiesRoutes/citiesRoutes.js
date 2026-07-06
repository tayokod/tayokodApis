import express from 'express';
import {
    getCities,
    getCityById,
    createCity,
    updateCity,
    deleteCity,
} from '../../controllers/citiesController/citiesController.js';
const router = express.Router();

// get all cities (supports ?search=, ?country=, ?page=, ?limit=)
router.get('/cities', getCities);

// get a city by id
router.get('/cities/:id', getCityById);

// create a new city
router.post('/cities', createCity);

// update a city by id
router.patch('/cities/:id', updateCity);

// delete a city by id
router.delete('/cities/:id', deleteCity);

export default router;
