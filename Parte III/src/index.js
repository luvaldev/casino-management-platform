import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';

import { PORT } from './config.js';
import authRouter from './routes/auth.route.js';
import productsRouter from './routes/products.route.js';
import adminRouter from './routes/admin.route.js';
import shoppingCartRouter from './routes/shopping-cart.route.js';
import purchaseRouter from './routes/purchase.route.js';
import userRouter from './routes/user.route.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes

// -- Swagger
const swaggerDocs = YAML.load('./api.yaml');
app.use('/api/collabor-doc', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// -- Auth
app.use('/api', authRouter);

// -- Products
app.use('/api', productsRouter);

// -- Admin
app.use('/api', adminRouter);

// -- Shopping cart
app.use('/api', shoppingCartRouter);

// -- Purchase
app.use('/api', purchaseRouter);

// -- User
app.use('/api', userRouter);

// Server
app.listen(PORT, () => console.log('Servidor corriendo en ' + PORT));
