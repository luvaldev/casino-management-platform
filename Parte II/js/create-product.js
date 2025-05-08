document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-product-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newProduct = {
      name: document.getElementById('product-name').value,
      price: document.getElementById('product-price').value,
      stock: document.getElementById('product-stock').value,
      description: document.getElementById('product-description').value,
      image: document.getElementById('product-image').value,
    };

    try {
      const response = await fetch('http://3.218.242.218/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newProduct),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.ok) {
        alert('Producto creado exitosamente');
        window.location.href = 'admin.html';
      } else {
        alert('Error al crear el producto');
      }
    } catch (error) {
      console.error('Error al crear el producto:', error);
      alert('Hubo un error al crear el producto');
    }
  });
});
