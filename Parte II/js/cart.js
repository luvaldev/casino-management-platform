document.addEventListener('DOMContentLoaded', async () => {
  const cartList = document.getElementById('cart-list');
  const token = localStorage.getItem('token');

  const response = await fetch('http://3.218.242.218/api/shoppingcart', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();

  if (data.ok) {
    const cart = data.cart;
    if (cart && cart.length > 0) {
      cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="cart-item-image" style="width: 100px; height: auto;">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-quantity">Cantidad: ${item.quantity}</span>
          <span class="cart-item-price">Precio: $${item.price}</span>
          <button class="btn btn-danger btn-sm remove-item-btn" data-id="${item.product_id}">Eliminar</button>
        `;
        cartList.appendChild(cartItemElement);
      });

      document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
          const productId = event.target.getAttribute('data-id');
          try {
            const deleteResponse = await fetch(`http://3.218.242.218/api/shoppingcart/remove/product/${productId}`, {
              method: 'DELETE',
              credentials: 'include',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const deleteData = await deleteResponse.json();
            if (deleteData.ok) {
              alert(deleteData.message);
              event.target.closest('.cart-item').remove();
              if (!cartList.querySelector('.cart-item')) {
                cartList.textContent = 'Tu carrito está vacío.';
              }
            } else {
              alert(deleteData.message || 'Error al eliminar el producto del carrito.');
            }
          } catch (error) {
            console.error('Error al eliminar el producto del carrito:', error);
            alert('Error al eliminar el producto del carrito. Por favor, intenta nuevamente.');
          }
        });
      });
    } else {
      cartList.textContent = 'Tu carrito está vacío.';
    }
  } else {
    alert(data.message);
  }

  const buyButton = document.getElementById('buy-button');
  buyButton.addEventListener('click', async () => {
    try {
      const purchaseResponse = await fetch('http://3.218.242.218/api/purchase', {
        method: 'POST',
        credentials: 'include',
      });
      const purchaseData = await purchaseResponse.json();
      if (purchaseData.ok) {
        alert('Compra realizada con éxito');
        window.location.href = 'profile.html';
      } else {
        alert(purchaseData.message);
      }
    } catch (error) {
      console.error('Error al comprar productos:', error);
      alert('Error al comprar productos. Por favor, intenta nuevamente.');
    }
  });
});
