import { Router } from 'express';
import { verifyUserToken } from '../middleware.js';
import { userController } from '../controllers/user.controller.js';

// Inicialización de router de express
const router = Router();

router.get('/profile', verifyUserToken, userController.getProfile);

export default router;
