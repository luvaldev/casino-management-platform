import jwt from 'jsonwebtoken';
import { SECRET_KEY } from './config.js';

// Middleware para verificar si el usuario ADMIN está autenticado
export function verifyAdminToken(req, res, next) {
	const token = req.cookies.token;

	if (!token) {
		return res.status(403).json({
			ok: false,
			message: 'Se requiere autenticación de administrador.'
		});
	}

	try {
		const decoded = jwt.verify(token, SECRET_KEY);

		if (decoded.role !== 'admin') {
			return res.status(403).json({
				message: 'No tienes permisos para realizar esta acción.'
			});
		}

		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Token invalido.' });
	}
}

// Middleware para verificar si el usuario USER O ADMIN está autenticado
export function verifyUserToken(req, res, next) {
	const token = req.cookies.token;

	if (!token) {
		return res.status(403).json({
			ok: false,
			message: 'Se requiere autenticación.'
		});
	}

	try {
		const decoded = jwt.verify(token, SECRET_KEY);

		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Token invalido.' });
	}
}
