import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sql } from '../db.js';
import { SECRET_KEY } from '../config.js';
import { validarFormatoCorreo } from '../utils.js';

async function login(req, res) {
	try {
		// Autenticar usuario
		const { email, password } = req.body;

		// Validar email y contraseña
		if (!email || !password) {
			return res.status(400).json({
				ok: false,
				message: 'Email y contraseña son requeridos.'
			});
		}

		// Validar formato de email
		if (!validarFormatoCorreo(email)) {
			return res.status(400).json({
				ok: false,
				message: 'El email no tiene un formato válido.'
			});
		}

		// Buscar usuario en la base de datos
		const user = await sql('SELECT * FROM usuarios WHERE email = $1', [email]);

		// Validar si el usuario no existe
		if (!user.length) {
			return res.status(401).json({
				ok: false,
				message: 'Usuario o contraseña incorrectos.'
			});
		}

		const currentUser = user[0];

		// Comparar contraseñas
		const hashedPassword = currentUser.password;
		const validPassword = await bcrypt.compare(password, hashedPassword);

		if (!validPassword) {
			return res.status(401).json({
				ok: false,
				message: 'Usuario o contraseña incorrectos.'
			});
		}

		// Crear payload
		const payload = {
			id: currentUser.id,
			role: currentUser.role
		};

		// Generar token
		const token = jwt.sign(payload, SECRET_KEY);

		// Crear cookie
		res.cookie('token', token, {
			httpOnly: false,
			secure: false,
			sameSite: 'lax'
		});

		// Enviar respuesta al cliente
		return res.status(200).json({
			ok: true,
			message: 'Inicio de sesión exitoso.',
			token,
			location: '/'
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

async function signup(req, res) {
	try {
		// Obtener datos del usuario
		const { name, birth_date, email, password } = req.body;

		// Validar datos
		if (!name || !birth_date || !email || !password) {
			return res.status(400).json({
				ok: false,
				message: 'Todos los campos son requeridos.'
			});
		}

		// Validar formato de email
		if (!validarFormatoCorreo(email)) {
			return res.status(400).json({
				ok: false,
				message: 'El email no tiene un formato válido.'
			});
		}

		// Validar si el email ya está registrado
		const user = await sql('SELECT * FROM usuarios WHERE email = $1', [email]);

		if (user.length) {
			return res.status(400).json({
				ok: false,
				message: 'El usuario ya está registrado.'
			});
		}

		// Encriptar contraseña
		const hashedPassword = await bcrypt.hash(password, 10);

		// Crear usuario
		const newUser = await sql(
			'INSERT INTO usuarios (name, birth_date, email, password) VALUES ($1, $2, $3, $4)',
			[name, birth_date, email, hashedPassword]
		);

		// Crear payload
		const payload = {
			id: newUser.id,
			role: newUser.role
		};

		// Generar token
		const token = jwt.sign(payload, SECRET_KEY);

		// Crear cookie
		res.cookie('token', token, {
			httpOnly: false,
			secure: false,
			sameSite: 'lax'
		});

		// Enviar respuesta al cliente
		return res.status(201).json({
			ok: true,
			message: 'Usuario creado con éxito.',
			token
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

async function logout(req, res) {
	try {
		// Eliminar cookie
		res.clearCookie('token');

		// Enviar respuesta al cliente
		return res.status(200).json({
			ok: true,
			message: 'Cierre de sesión exitoso.',
			location: '/'
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			ok: false,
			message: 'Error en el servidor. Por favor, intenta de nuevo.'
		});
	}
}

export const userController = { login, signup, logout };
