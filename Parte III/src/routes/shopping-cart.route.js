import { Router } from 'express';
import { verifyUserToken } from '../middleware.js';
import { shoppingCartController } from '../controllers/shopping-cart.controller.js';

// Inicialización de router de express
const router = Router();

router.get('/shoppingcart', verifyUserToken, shoppingCartController.getShoppingCart);

router.post(
	'/shoppingcart/add/product/:productId/quantity/:quantity',
	verifyUserToken,
	shoppingCartController.addToShoppingCart
);

router.delete(
	'/shoppingcart/remove/product/:productId',
	verifyUserToken,
	shoppingCartController.removeFromShoppingCart
);

export default router;
