document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://3.218.242.218/api/profile', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (data.ok) {
      const profile = data.profile;

      document.getElementById('profile-name').textContent = profile.name;
      document.getElementById('profile-email').textContent = profile.email;
      document.getElementById('profile-birth_date').textContent = profile.birth_date;
      document.getElementById('profile-money').textContent = profile.money;
      document.getElementById('profile-role').textContent = profile.role;
      if (profile.cart && profile.cart.length > 0) {
        const cartList = document.getElementById('profile-cart');
        profile.cart.forEach(item => {
          const cartItemElement = document.createElement('div');
          cartItemElement.classList.add('cart-item');
          cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-quantity">Cantidad: ${item.quantity}</span>
            <span class="cart-item-price">Precio: $${item.price}</span>
          `;
          cartList.appendChild(cartItemElement);
        });
      } else {
        document.getElementById('profile-cart').textContent =
          'Tu carrito está vacío.';
      }
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    alert('Error al cargar el perfil. Por favor, intenta nuevamente.');
  }
});
