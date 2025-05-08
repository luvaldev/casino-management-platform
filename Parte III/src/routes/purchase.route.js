import { Router } from 'express';
import { verifyUserToken } from '../middleware.js';
import { purchaseController } from '../controllers/purchase.controller.js';

// Inicialización de router de express
const router = Router();

router.post('/purchase', verifyUserToken, purchaseController.createPurchase);

export default router;
