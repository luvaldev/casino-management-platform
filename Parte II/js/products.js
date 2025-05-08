document.addEventListener('DOMContentLoaded', async () => {
  const productList = document.getElementById('product-list');

  const token = localStorage.getItem('token'); 

  try {

    const response = await fetch('http://3.218.242.218/api/products', {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      alert(`Error al cargar los productos: ${error.message}`);
      return;
    }

    const data = await response.json();

    if (!data.ok || !data.products || data.products.length === 0) {
      alert('No se encontraron productos.');
      return;
    }

    data.products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.classList.add('col', 'mb-4');
      productCard.innerHTML = `
        <div class="card shadow-sm">
          <img src="${product.image}" class="card-img-top" alt="${product.name}">
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.description}</p>
            <p class="card-text">Precio: $${product.price}</p>
            <p class="card-text">Stock: ${product.stock}</p>
            <a href="product?id=${product.id}" class="btn btn-primary">Ver más</a>
            <div class="mt-3">
              <input type="number" id="quantity-${product.id}" class="form-control mb-2" min="1" max="${product.stock}" value="1">
              <button class="btn btn-success" id="add-to-cart-${product.id}">Agregar al carrito</button>
            </div>
          </div>
        </div>
      `;
      productList.appendChild(productCard);

      const addToCartButton = document.getElementById(
        `add-to-cart-${product.id}`,
      );
      addToCartButton.addEventListener('click', async () => {

        try {
          const quantityInput = document.getElementById(`quantity-${product.id}`);
					const quantity = parseInt(quantityInput.value, 10);

					if (isNaN(quantity) || quantity <= 0) {
						alert('Por favor, ingresa una cantidad válida.');
						return;
					}
          
          const addToCartResponse = await fetch(
            `http://3.218.242.218/api/shoppingcart/add/product/${product.id}/quantity/${quantity}`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          const addToCartData = await addToCartResponse.json();

          if (addToCartData.ok) {
            alert('Producto agregado al carrito');
          } else {
            alert(
              addToCartData.message ||
                'Error al agregar el producto al carrito',
            );
          }
        } catch (error) {
          console.error('Error al agregar al carrito:', error);
          alert('Hubo un error al agregar el producto al carrito.');
        }
      });
    });
  } catch (error) {
    alert('Hubo un error al obtener los productos.');
  }
});
