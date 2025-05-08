import { sql } from '../db.js';

async function createPurchase(req, res) {
	const currentUser = req.user;

	try {
		const userResponse = await sql('SELECT * FROM usuarios WHERE id = $1', [currentUser.id]);

		if (!userResponse.length) {
			return res.status(404).json({
				ok: false,
				message: 'Usuario no encontrado.'
			});
		}

		const user = userResponse[0];
		const cart = user.cart;

		if (!cart.length) {
			return res.status(404).json({
				ok: false,
				message: 'Carrito de compras vacío.'
			});
		}

		// Obtener los productos del carrito
		const products = await sql('SELECT * FROM productos WHERE id = ANY($1)', [
			cart.map(product => product.product_id)
		]);

		// Combinar productos con las cantidades del carrito
		const productsWithQuantity = products.map(product => {
			const cartItem = cart.find(item => parseInt(item.product_id) === parseInt(product.id));
			return {
				...product,
				quantity: cartItem ? cartItem.quantity : 0
			};
		});

		// Verificar el stock y calcular el subtotal
		let subtotal = 0;
		for (const product of productsWithQuantity) {
			if (product.stock < product.quantity) {
				return res.status(400).json({
					ok: false,
					message: `Stock insuficiente para el producto ${product.name}.`
				});
			}
			subtotal += product.price * product.quantity;
		}

		// Calcular el impuesto (19%) y el total
		const tax = subtotal * 0.19;
		const total = subtotal + tax;

		// Verificar si el usuario tiene suficientes fondos
		if (user.money < total) {
			return res.status(400).json({
				ok: false,
				message: 'Fondos insuficientes.'
			});
		}

		// Actualizar el stock de los productos en la base de datos
		for (const product of productsWithQuantity) {
			await sql('UPDATE productos SET stock = stock - $1 WHERE id = $2', [
				product.quantity,
				product.id
			]);
		}

		// Crear la compra en la base de datos
		await sql('INSERT INTO compras (user_id, total_price) VALUES ($1, $2)', [user.id, total]);

		// Vaciar el carrito del usuario
		await sql('UPDATE usuarios SET cart = $1, money = $2 WHERE id = $3', [
			JSON.stringify([]),
			user.money - total,
			user.id
		]);

		return res.status(201).json({
			ok: true,
			message: 'Compra realizada con éxito.'
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

export const purchaseController = {
	createPurchase
};
