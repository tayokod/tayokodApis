import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../../controllers/productsController/productsController.js';
const router = express.Router();

// get all products (supports ?search=, ?category=, ?minPrice=, ?maxPrice=, ?page=, ?limit=, ?sort=)
router.get('/products', getProducts);

// get a product by id
router.get('/products/:id', getProductById);

// create a new product
router.post('/products', createProduct);

// update a product by id
router.patch('/products/:id', updateProduct);

// delete a product by id
router.delete('/products/:id', deleteProduct);

export default router;
