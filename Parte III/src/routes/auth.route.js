import { Router } from 'express';
import { userController } from '../controllers/auth.controller.js';

// Inicialización de router de express
const router = Router();

// Rutas de autenticación

// -- Ruta para iniciar sesión
router.post('/login', userController.login);

// -- Ruta para crear un nuevo usuario
router.post('/signup', userController.signup);

// -- Ruta para cerrar sesión
router.get('/logout', userController.logout);

export default router;
