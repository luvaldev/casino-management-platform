CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    money INTEGER DEFAULT 100000 CHECK (money >= 0), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    cart JSON DEFAULT '[]' 
);

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    stock INTEGER DEFAULT 10 CHECK (stock >= 0),
    price INTEGER CHECK (price >= 0),
    image TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compras (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES usuarios(id),
    total_price INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO productos (name, stock, price, image, description) VALUES
('Dados', 10, 9000, 'https://i.postimg.cc/ydRZDM23/dados.jpg', 'Dados de 6 caras'),
('Cartas', 10, 10000, 'https://i.postimg.cc/T3kmFqr1/cartas.jpg', 'Cartas de póker'),
('Tablero', 10, 20000, 'https://i.postimg.cc/nhL94j6J/tablero.jpg', 'Tablero de ajedrez'),
('Fichas de Póker', 15, 25000, 'https://i.postimg.cc/s2vSrQcc/fichas-poker.jpg', 'Set de fichas de póker de alta calidad'),
('Figura de Colección', 20, 5000, 'https://i.postimg.cc/43qcNf2T/Figura-Coleccion.jpg', 'Figura coleccionable de edición limitada'),
('Puzzle 1000 Piezas', 8, 12000, 'https://i.postimg.cc/k56VZrJY/puzzle-piezas.jpg', 'Puzzle de 1000 piezas de paisajes naturales'),
('Mini Cofre', 15, 13000, 'https://i.postimg.cc/59wzbMwZ/Mini-cofre.jpg', 'Pequeño cofre para almacenar piezas o monedas de juegos'),
('Juego de Dardos', 7, 18000, 'https://i.postimg.cc/xTnzdF5q/juego-dardos.jpg', 'Set de dardos con tablero magnético'),
('Jenga', 12, 15000, 'https://i.postimg.cc/SR7YrWSy/jenga.jpg', 'Juego de bloques de madera Jenga'),
('Dominó', 9, 8000, 'https://i.postimg.cc/3NHDmLHS/domino.jpg', 'Set de dominó de 28 piezas'),
('Ruleta de Casino', 3, 50000, 'https://i.postimg.cc/kgh6fMmt/ruleta.jpg', 'Ruleta de casino profesional'),
('Juego de Bingo', 10, 11000, 'https://i.postimg.cc/CL7fnHr7/juego-bingo.jpg', 'Set de Bingo con 75 bolas y cartones');

INSERT INTO usuarios (name, birth_date, email, password, role) VALUES
('Admin', '1990-01-01', 'admin@gmail.com', '$2b$10$CdWwnTDp2g29Td8WV.XaDeYsgOOIzwcqqksuG1Fi87HwPyLHhBcSa', 'admin'), -- password: admin
('luis', '1990-01-01', 'luis@gmail.com', '$2b$10$M2oPprC4sThfTtqNnYUnb./frj.htg8BFaJa0b48oXCeegL.jfs7m', 'user'); -- password: user

