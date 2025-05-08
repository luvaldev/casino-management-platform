import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { verifyAdminToken } from '../middleware.js';

// Inicialización de router de express
const router = Router();

router.get('/admin/totalEarned', verifyAdminToken, adminController.getTotalEarned);

router.post('/admin/products', verifyAdminToken, adminController.createProduct);

router.post('/admin/products/:id', verifyAdminToken, adminController.updateProduct);

router.delete('/admin/products/:id', verifyAdminToken, adminController.deleteProduct);

export default router;
