import { sql } from '../db.js';

async function getProducts(req, res) {
	try {
		// Obtener productos
		const products = await sql('SELECT * FROM productos');

		// Enviar productos al cliente
		return res.status(200).json({
			ok: true,
			products
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

async function getProduct(req, res) {
	try {
		const { id } = req.params;

		const product = await sql('SELECT * FROM productos WHERE id = $1', [id]);

		if (!product.length) {
			return res.status(404).json({
				ok: false,
				message: 'Producto no encontrado.'
			});
		}

		return res.status(200).json({
			ok: true,
			product: product[0]
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

export const productsController = {
	getProducts,
	getProduct
};
