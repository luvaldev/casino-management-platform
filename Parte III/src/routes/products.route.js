import { Router } from 'express';
import { productsController } from '../controllers/products.controller.js';

// Inicialización de router de express
const router = Router();

router.get('/products', productsController.getProducts);

router.get('/products/:id', productsController.getProduct);

export default router;
