import express from 'express';
import cookieParser from 'cookie-parser';
import { engine } from 'express-handlebars';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sql } from './db.js';
import { authMiddleware } from './middleware.js';
import { PORT, JWT_SECRET } from './config.js';
import { formatearMoneda, validarEmail } from './utils.js';

// Creación de la aplicación
const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware); // Middleware para verificar la autenticación antes de cada petición

// Middleware para renderizar vistas
app.engine(
	'handlebars',
	engine({
		defaultLayout: 'main',
		helpers: {
			// Comparar dos valores en una vista
			eq: (a, b) => a === b,
			// multiplicar dos valores en una vista
			multiply: (a, b) => a * b
		}
	})
);
app.set('view engine', 'handlebars');
app.set('views', 'src/views');

app.set('port', PORT);

// Rutas de la aplicación principal
app.get('/', async (req, res) => {
	try {
		const products = await sql('SELECT * FROM productos');

		const productsWithPrice = products.map(product => ({
			...product,
			priceFormatted: formatearMoneda(product.price)
		}));

		res.render('home', { products: productsWithPrice });
	} catch (error) {
		console.error('Error al cargar la página principal:', error);
		res.status(500).send('Error al cargar la página principal');
	}
});

// Ruta de contacto
app.get('/contact', (req, res) => {
	res.render('contact');
});

// Ruta de carrito
app.get('/cart', async (req, res) => {
	try {
		// Obtener el usuario actual
		const currentUser = req.user;

		if (!currentUser) {
			return res.status(401).redirect('/login');
		}

		// Verificar que el usuario exista en la base de datos
		const result = await sql('SELECT * FROM usuarios WHERE id = $1', [currentUser?.id]);
		if (result.length === 0) {
			return res.status(400).send('Usuario no encontrado');
		}

		const user = result[0];
		const cart = user.cart || [];

		// Obtener los productos del carrito
		const products = await sql('SELECT * FROM productos WHERE id = ANY($1)', [
			cart.map(product => product.product_id)
		]);

		const productsWithQuantity = products.map(product => {
			const cartItem = cart.find(item => parseInt(item.product_id) === parseInt(product.id));

			return {
				...product,
				quantity: cartItem ? cartItem.quantity : 0,
				priceFormatted: formatearMoneda(product.price)
			};
		});

		// Calcular el subtotal
		const subtotal = productsWithQuantity.reduce((acc, product) => {
			return acc + product.price * product.quantity;
		}, 0);

		// Calcular el impuesto (19%)
		const tax = subtotal * 0.19;

		// Calcular el total con impuesto
		const total = subtotal + tax;

		res.render('cart', {
			products: productsWithQuantity,
			productsCount: productsWithQuantity?.length,
			subtotal: formatearMoneda(subtotal),
			tax: formatearMoneda(tax),
			total: formatearMoneda(total)
		});
	} catch (error) {
		if (!res.headersSent) {
			console.error('Error al cargar el carrito:', error);
			res.status(500).send('Error al cargar el carrito');
		}
	}
});

app.post('/add-to-cart', async (req, res) => {
	try {
		// Obtener el usuario actual
		const currentUser = req.user;

		if (!currentUser) {
			return res.status(401).redirect('/login');
		}

		// Verificar que el usuario exista en la base de datos
		const result = await sql('SELECT * FROM usuarios WHERE id = $1', [currentUser?.id]);
		if (result.length === 0) {
			return res.status(400).send('Usuario no encontrado');
		}

		const user = result[0];
		const { product_id, quantity } = req.body;

		// Validar que el id del producto y la cantidad no estén vacíos
		if (!product_id || !quantity) {
			return res.status(400).send('Falta el id del producto o la cantidad');
		}

		const quantityNumber = parseInt(quantity, 10);

		// Obtener el carrito actual del usuario desde la base de datos (usando JSON.parse si está en formato JSON)
		let cart = user.cart || [];

		// Buscar el índice del producto en el carrito
		const productIndex = cart.findIndex(product => product.product_id === product_id);

		// Si el producto ya está en el carrito, suma la cantidad
		if (productIndex !== -1) {
			cart[productIndex].quantity = parseInt(cart[productIndex].quantity, 10) + quantityNumber;
		} else {
			// Si el producto no está en el carrito, agrégalo
			cart.push({ product_id, quantity: quantityNumber });
		}

		// Actualizar el carrito en la base de datos, conviértelo a JSON para almacenarlo correctamente
		await sql('UPDATE usuarios SET cart = $1 WHERE id = $2', [JSON.stringify(cart), user.id]);

		// Redirigir al carrito o enviar una respuesta de éxito
		res.status(200).redirect('/cart');
	} catch (error) {
		console.error('Error al agregar producto al carrito:', error);
		if (!res.headersSent) {
			res.status(500).send('Error al agregar producto al carrito');
		}
	}
});

app.post('/remove-from-cart', async (req, res) => {
	try {
		// Obtener el usuario actual
		const currentUser = req.user;

		// Verificar que el usuario exista en la base de datos
		const result = await sql('SELECT * FROM usuarios WHERE id = $1', [currentUser?.id]);
		if (result.length === 0) {
			return res.status(400).send('Usuario no encontrado');
		}

		const user = result[0];
		const { product_id } = req.body;

		// Validar que el id del producto no esté vacío
		if (!product_id) {
			return res.status(400).send('Falta el id del producto');
		}

		// Obtener el carrito actual del usuario desde la base de datos (usando JSON.parse si está en formato JSON)
		let cart = user.cart || [];

		// Filtrar el carrito para eliminar el producto con el id especificado
		cart = cart.filter(product => product.product_id !== product_id);

		// Actualizar el carrito en la base de datos, conviértelo a JSON para almacenarlo correctamente
		await sql('UPDATE usuarios SET cart = $1 WHERE id = $2', [JSON.stringify(cart), user.id]);

		// Redirigir al carrito o enviar una respuesta de éxito
		res.status(200).redirect('/cart');
	} catch (error) {
		console.error('Error al eliminar producto del carrito:', error);
		if (!res.headersSent) {
			res.status(500).send('Error al eliminar producto del carrito');
		}
	}
});

app.post('/pay', async (req, res) => {
	try {
		// Obtener el usuario actual
		const currentUser = req.user;

		// Verificar que el usuario exista en la base de datos
		const result = await sql('SELECT * FROM usuarios WHERE id = $1', [currentUser?.id]);
		if (result.length === 0) {
			return res.status(400).send('Usuario no encontrado');
		}

		const user = result[0];
		const cart = user.cart || [];

		// Obtener los productos del carrito
		const products = await sql('SELECT * FROM productos WHERE id = ANY($1)', [
			cart.map(product => product.product_id)
		]);

		const productsWithQuantity = products.map(product => {
			const cartItem = cart.find(item => parseInt(item.product_id) === parseInt(product.id));

			return {
				...product,
				quantity: cartItem ? cartItem.quantity : 0,
				priceFormatted: formatearMoneda(product.price)
			};
		});

		// Calcular el subtotal
		const subtotal = productsWithQuantity.reduce((acc, product) => {
			const cartItem = cart.find(item => parseInt(item.product_id) === parseInt(product.id));
			return acc + product.price * cartItem.quantity;
		}, 0);

		// Calcular el impuesto (19%)
		const tax = subtotal * 0.19;

		// Calcular el total con impuesto
		const total = subtotal + tax;

		if (user.money < total) {
			return res.status(400).render('cart', {
				error: 'Fondos insuficientes',
				products: productsWithQuantity,
				productsCount: productsWithQuantity?.length,
				subtotal: formatearMoneda(subtotal),
				tax: formatearMoneda(tax),
				total: formatearMoneda(total)
			});
		}

		// Crear la compra en la base de datos
		await sql('INSERT INTO compras (user_id, total_price) VALUES ($1, $2)', [user.id, total]);

		// Actualizar el carrito del usuario
		await sql('UPDATE usuarios SET cart = $1 WHERE id = $2', [JSON.stringify([]), user.id]);

		// Actualizar el dinero del usuario
		await sql('UPDATE usuarios SET money = $1 WHERE id = $2', [user.money - total, user.id]);

		// Actualizar el stock de los productos
		for (const product of productsWithQuantity) {
			const cartItem = cart.find(item => parseInt(item.product_id) === parseInt(product.id));
			await sql('UPDATE productos SET stock = $1 WHERE id = $2', [
				product.stock - cartItem.quantity,
				product.id
			]);
		}

		res.status(201).redirect('/cart');
	} catch (error) {
		console.error('Error al procesar el checkout:', error);
		if (!res.headersSent) {
			res.status(500).send('Error al procesar el checkout');
		}
	}
});

// Ruta de acerca de
app.get('/about', (req, res) => {
	res.render('about');
});

// Rutas para registro, inicio de sesión y cierre de sesión
app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', async (req, res) => {
	try {
		// Obtener los datos del formulario
		const { name, birth_date, email, password } = req.body;

		// Validar que los datos no estén vacíos
		if (!name || !birth_date || !email || !password) {
			return res.status(400).render('register', { error: 'Faltan datos' });
		}

		// Validar formato del correo
		if (!validarEmail(email)) {
			return res.status(400).render('register', { error: 'Formato de correo invalido' });
		}

		// Validar que el email no exista en la base de datos
		const result = await sql('SELECT * FROM usuarios WHERE email = $1', [email]);
		const userExists = result?.length > 0;

		if (userExists) {
			return res.status(400).render('register', { error: 'El usuario ya existe' });
		}

		// Encriptar la contraseña
		const hashedPassword = await bcrypt.hash(password, 10);

		// Registrar usuario
		await sql('INSERT INTO usuarios (name, birth_date, email, password) VALUES ($1, $2, $3, $4)', [
			name,
			birth_date,
			email,
			hashedPassword
		]);

		res.status(201).redirect('/login');
	} catch (error) {
		// Validar que la respuesta no haya sido enviada
		if (!res.headersSent) {
			res.status(500).render('register', { error: 'Error al registrar usuario' });
		}
	}
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validar que los datos no estén vacíos
		if (!email || !password) {
			return res.status(400).render('login', { error: 'Faltan datos' });
		}

		// Validar que el usuario exista
		const result = await sql('SELECT * FROM usuarios WHERE email = $1', [email]);
		const user = result[0];

		if (!user) {
			return res.status(401).render('login', { error: 'Usuario o contraseña incorrectos' });
		}

		const hashedPassword = user.password;
		const validPassword = await bcrypt.compare(password, hashedPassword);

		if (!validPassword) {
			return res.status(401).render('login', { error: 'Usuario o contraseña incorrectos' });
		}

		// Crear token
		const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
			expiresIn: '7d'
		});

		// Enviar token en una cookie
		res
			.cookie('access', token, {
				httpOnly: true, // No permitir acceso desde el navegador
				secure: false, // Solo permitir en https
				sameSite: 'lax', // Solo permitir en el mismo sitio
				maxAge: 1000 * 60 * 60 * 24 * 7 // 7 días
			})
			.status(200)
			.redirect('/');
	} catch (error) {
		// Validar que la respuesta no haya sido enviada
		if (!res.headersSent) {
			res.status(500).render('login', { error: 'Error al iniciar sesión' });
		}
	}
});

app.get('/logout', (req, res) => {
	res.clearCookie('access').redirect('/');
});

// Ruta para informacion
app.get('/user', (req, res) => {
	res.render('user');
});

// Ruta de admin
app.get('/admin', async (req, res) => {
	try {
		const salesCount = await sql('SELECT SUM(total_price) AS sales_count FROM compras');
		const products = await sql('SELECT * FROM productos');

		res.render('admin', {
			salesCount: formatearMoneda(salesCount[0].sales_count) || 0,
			products
		});
	} catch (error) {
		if (!res.headersSent) {
			res.status(500).send('Error al cargar la página de admin');
		}
	}
});

app.get('/create', (req, res) => {
	res.render('create');
});

app.get('/edit/:id', async (req, res) => {
	try {
		const productId = req.params.id;

		if (isNaN(productId)) {
			return res.status(400).send('ID de producto inválido');
		}

		const result = await sql('SELECT * FROM productos WHERE id = $1', [productId]);

		if (result.length === 0) {
			return res.status(404).send('Producto no encontrado');
		}

		const product = result[0];
		res.render('editProduct', { product });
	} catch (error) {
		console.error('Error al cargar el producto para edición:', error);
		res.status(500).send('Error al cargar el producto para edición');
	}
});

// Iniciar la aplicación
app.listen(PORT, () => {
	console.log(`Aplicación corriendo en http://localhost:${PORT}`);
});