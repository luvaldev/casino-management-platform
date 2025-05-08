import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';
import { sql } from './db.js';
import { formatearMoneda } from './utils.js';

export const authMiddleware = async (req, res, next) => {
	const token = req.cookies.access;
	if (token) {
		try {
			const user = jwt.verify(token, JWT_SECRET);

			if (user) {
				const response = await sql('SELECT * FROM usuarios WHERE id = $1', [user.id]);
				const { password, ...userWithoutPassword } = response[0];

				const formattedMoney = formatearMoneda(userWithoutPassword.money);

				const userWithMoney = { ...userWithoutPassword, formattedMoney: formattedMoney };

				res.locals.user = userWithMoney;
				req.user = user;
			}
		} catch (error) {
			console.error('Error al verificar el token:', error);
		}
	}
	next();
};
