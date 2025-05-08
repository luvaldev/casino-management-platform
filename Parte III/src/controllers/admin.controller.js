import { sql } from '../db.js';

async function getTotalEarned(req, res) {
	try {
		// Traer todas las compras
		const salesCount = await sql('SELECT SUM(total_price) AS sales_count FROM compras');
		const totalEarned = salesCount[0].sales_count || 0;

		// Devolver el total de ganancias
		return res.status(200).json({
			ok: true,
			total: Number(totalEarned)
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

async function createProduct(req, res) {
	const { name, stock, price, image, description } = req.body;

	try {
		if (!name) {
			return res.status(400).json({
				ok: false,
				message: 'El nombre del producto es requerido.'
			});
		}

		// Crear el producto
		const createdProduct = await sql(
			'INSERT INTO productos (name, stock, price, image, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
			[name, stock, price, image, description]
		);

		// Devolver el producto creado
		return res.status(201).json({
			ok: true,
			message: 'Producto creado exitosamente',
			product: Number(createdProduct[0].id)
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

async function updateProduct(req, res) {
	const { id } = req.params;
	const { name, stock, price, image, description } = req.body;

	try {
		if (!name) {
			return res.status(400).json({
				ok: false,
				message: 'El nombre del producto es requerido.'
			});
		}

		// Verificar si el producto existe
		const product = await sql('SELECT * FROM productos WHERE id = $1', [id]);

		if (!product.length) {
			return res.status(404).json({
				ok: false,
				message: 'Producto no encontrado.'
			});
		}

		// Actualizar el producto
		const updateProduct = await sql(
			'UPDATE productos SET name = $1, stock = $2, price = $3, image = $4, description = $5 WHERE id = $6 RETURNING *',
			[name, stock, price, image, description, id]
		);

		// Devolver el producto actualizado
		return res.status(200).json({
			ok: true,
			message: 'Producto actualizado exitosamente.',
			product: updateProduct[0]
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

async function deleteProduct(req, res) {
	const { id } = req.params;

	try {
		// Verificar si el producto existe
		const product = await sql('SELECT * FROM productos WHERE id = $1', [id]);

		if (!product.length) {
			return res.status(404).json({
				ok: false,
				message: 'Producto no encontrado.'
			});
		}

		// Eliminar el producto
		await sql('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);

		// Devolver el producto eliminado
		return res.status(200).json({
			ok: true,
			message: 'Producto eliminado exitosamente.'
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

export const adminController = {
	getTotalEarned,
	createProduct,
	updateProduct,
	deleteProduct
};
