# casino-management-platform
Proyecto de desarrollo web dividido en tres fases, que simula una plataforma de casino con funcionalidades de gestión y control de usuarios. La aplicación se desarrolla progresivamente desde una interfaz estática con Handlebars hasta una solución full-stack con base de datos y API RESTful. El sistema permite el registro de usuarios, gestión de saldo y roles, y un panel administrativo para la administración de productos y visualización de métricas del casino.


### Estructura Parte I
src/
├── sql/
│   └── queries.sql
├── views/
│   ├── layouts/
│   │   ├── main.handlebars
│   │   └── styles.css
│   ├── about.handlebars
│   ├── admin.handlebars
│   ├── cart.handlebars
│   ├── contact.handlebars
│   ├── create.handlebars
│   ├── editProduct.handlebars
│   ├── home.handlebars
│   ├── login.handlebars
│   ├── register.handlebars
│   └── user.handlebars
├── config.js
├── db.js
├── index.js
├── middleware.js
└── utils.js


**Descripción del Proyecto:** Estructura creada en base a la plantilla de Handlebars, con un diseño básico y funcionalidad de registro y login. La aplicación permite a los usuarios registrarse, iniciar sesión y acceder a su perfil. Además, incluye una sección de administración para gestionar productos y visualizar métricas del casino.
**Tecnologías Utilizadas:** Node.js, Express, Handlebars, SQLite3, bcrypt, express-session.

---

### Estructura Parte II
src/
├── js/
│   ├── admin.js
│   ├── cart.js
│   ├── create-product.js
│   ├── edit-product.js
│   ├── login.js
│   ├── navbar.js
|   ├── productid.js
│   ├── products.js
│   ├── profile.js
│   └── register.js
├── admin.html
├── cart.html
├── create-product.html
├── editproduct.html
├── index.html
├── login.html
├── product.html
├── profile.html
└── register.html

**Descripción del Proyecto:** Versión mejorada de la interfaz utilizando HTML y JavaScript puro para una experiencia más dinámica. Esta etapa separa claramente la lógica del cliente en archivos JavaScript modulares, y permite la comunicación con una API backend mediante fetch. Se integran funcionalidades como login, registro, carrito de compras, administración y edición de productos, así como visualización de detalles y perfiles.
**Tecnologías Utilizadas:** HTML5, JavaScript (ES6), Fetch API, CSS3, LocalStorage, diseño modular en el cliente.

---

### Estructura Parte III
src/
├── controllers/
│   ├── admin.Controller.js
│   ├── auth.Controller.js
│   ├── products.controller.js
│   ├── purchase.controller.js
│   ├── shopping-cart.controller.js
│   └── userController.js
├── routes/
│   ├── admin.routes.js
│   ├── auth.routes.js
│   ├── products.routes.js
│   ├── purchase.routes.js
│   ├── shopping-cart.routes.js
│   └── user.routes.js
│
├── config.js
├── db.js
├── index.js
├── middleware.js
└── utils.js
.gitignore
api.yaml
package.json
package-lock.json

**Descripción del Proyecto:** Implementación de una API RESTful completa con Express y SQLite3, que permite la gestión de usuarios, productos y compras. La API incluye autenticación JWT, manejo de roles y permisos, y un sistema de carrito de compras. Se implementa un sistema de administración para gestionar productos y visualizar métricas del casino. La comunicación entre el cliente y el servidor se realiza mediante peticiones HTTP.
**Tecnologías Utilizadas:** Node.js, Express, SQLite3, JWT, bcrypt, cors, dotenv, Swagger para documentación de la API.

---

⭐️ From [@luvaldev](https://github.com/luvaldev)