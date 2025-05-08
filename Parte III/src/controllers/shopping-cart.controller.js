import { sql } from '../db.js';

async function getShoppingCart(req, res) {
	const currentUser = req.user;

	try {
		const user = await sql('SELECT * FROM usuarios WHERE id = $1', [currentUser.id]);

		if (!user.length) {
			return res.status(404).json({
				ok: false,
				message: 'Usuario no encontrado.'
			});
		}

		const shoppingCart = await sql('SELECT cart FROM usuarios WHERE id = $1', [currentUser.id]);

		const cart = shoppingCart[0].cart;

		if (!cart.length) {
			return res.status(404).json({
				ok: false,
				message: 'Carrito de compras vacío.'
			});
		}

		const products = await sql('SELECT * FROM productos WHERE id = ANY($1)', [
			cart.map(product => product.product_id)
		]);

		const productsWithQuantity = products.map(product => {
			const cartItem = cart.find(item => parseInt(item.product_id) === parseInt(product.id));

			return {
				...product,
				quantity: cartItem ? cartItem.quantity : 0
			};
		});

		return res.status(200).json({
			ok: true,
			subtotal: productsWithQuantity.reduce(
				(acc, product) => acc + product.price * product.quantity,
				0
			),
			total: productsWithQuantity.reduce(
				(acc, product) => acc + product.price * product.quantity * 1.19,
				0
			),
			totalItems: productsWithQuantity.reduce((acc, product) => acc + product.quantity, 0),
			cart: productsWithQuantity
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

async function addToShoppingCart(req, res) {
	const currentUser = req.user;
	const { productId, quantity } = req.query;

	try {
		if (!productId || !quantity) {
			return res.status(400).json({
				ok: false,
				message: 'Todos los campos son requeridos.'
			});
		}

		const userResponse = await sql('SELECT cart FROM usuarios WHERE id = $1', [currentUser.id]);

		if (!userResponse.length) {
			return res.status(404).json({
				ok: false,
				message: 'Usuario no encontrado.'
			});
		}

		const user = userResponse[0];

		const productResponse = await sql('SELECT * FROM productos WHERE id = $1', [productId]);

		if (!productResponse.length) {
			return res.status(404).json({
				ok: false,
				message: 'Producto no encontrado.'
			});
		}

		let cart = user.cart || [];
		const cartItem = cart.find(item => parseInt(item.product_id) === parseInt(productId));
		const quantityNumber = parseInt(quantity, 10);

		if (cartItem) {
			// Si el producto ya está en el carrito, suma la cantidad
			cartItem.quantity += quantityNumber;
		} else {
			// Si el producto no está en el carrito, agrégalo
			cart.push({ product_id: productId, quantity: quantityNumber });
		}

		// validar si el stock es suficiente
		const product = productResponse[0];

		if (product.stock < quantityNumber) {
			return res.status(400).json({
				ok: false,
				message: 'Stock insuficiente.'
			});
		}

		// Actualizar el carrito en la base de datos
		await sql('UPDATE usuarios SET cart = $1 WHERE id = $2', [
			JSON.stringify(cart),
			currentUser.id
		]);

		return res.status(200).json({
			ok: true,
			message: 'Producto añadido al carrito.'
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

async function removeFromShoppingCart(req, res) {
	const currentUser = req.user;
	const { productId } = req.query;

	try {
		// Obtener el carrito del usuario
		const userResponse = await sql('SELECT cart FROM usuarios WHERE id = $1', [currentUser.id]);

		if (!userResponse.length) {
			return res.status(404).json({
				ok: false,
				message: 'Usuario no encontrado.'
			});
		}

		const user = userResponse[0];
		let cart = user.cart || [];

		// Buscar el índice del producto en el carrito
		const cartItemIndex = cart.findIndex(item => parseInt(item.product_id) === parseInt(productId));

		if (cartItemIndex === -1) {
			return res.status(404).json({
				ok: false,
				message: 'Producto no encontrado en el carrito.'
			});
		}

		let message = 'Producto actualizado en el carrito.';

		// Reducir la cantidad en 1 o eliminar el producto si la cantidad es 1
		if (cart[cartItemIndex].quantity > 1) {
			cart[cartItemIndex].quantity -= 1;
		} else {
			// Eliminar el producto si la cantidad llega a 0
			cart.splice(cartItemIndex, 1);
			message = 'Producto eliminado del carrito porque la cantidad llegó a 0.';

			// Verificar si el carrito está vacío después de eliminar el producto
			if (cart.length === 0) {
				message = 'El carrito está vacío después de eliminar el producto.';
			}
		}

		// Actualizar el carrito en la base de datos
		await sql('UPDATE usuarios SET cart = $1 WHERE id = $2', [
			JSON.stringify(cart),
			currentUser.id
		]);

		return res.status(200).json({
			ok: true,
			message
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

export const shoppingCartController = {
	getShoppingCart,
	addToShoppingCart,
	removeFromShoppingCart
};
