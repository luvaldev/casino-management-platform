import { sql } from '../db.js';

async function getProfile(req, res) {
	const currentUser = req.user;

	try {
		// Consultar usuario y excluir la contraseña en la misma consulta
		const userResponse = await sql(
			'SELECT id, name, birth_date, email, money, created_at, role, cart FROM usuarios WHERE id = $1',
			[currentUser.id]
		);

		if (!userResponse.length) {
			return res.status(404).json({
				ok: false,
				message: 'Usuario no encontrado.'
			});
		}

		const profile = userResponse[0];
		const cart = profile.cart;

		// Obtener productos en el carrito y su información
		const products = await sql('SELECT * FROM productos WHERE id = ANY($1)', [
			cart.map(product => product.product_id)
		]);

		// Combinar productos con sus cantidades del carrito
		const productsWithQuantity = products.map(product => {
			const cartItem = cart.find(item => parseInt(item.product_id) === parseInt(product.id));
			return {
				...product,
				quantity: cartItem ? cartItem.quantity : 0
			};
		});

		profile.cart = productsWithQuantity;

		return res.status(200).json({
			ok: true,
			profile
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

export const userController = {
	getProfile
};
