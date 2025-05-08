document.addEventListener('DOMContentLoaded', async () => {
  const productId = new URLSearchParams(window.location.search).get('id');
  const form = document.getElementById('edit-product-form');

  if (!productId) {
    alert('No se encontró el producto');
    window.location.href = 'admin.html';
    return;
  }

  try {
    const response = await fetch(`http://3.218.242.218/api/products/${productId}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (data.ok) {
      const product = data.product;
      document.getElementById('product-name').value = product.name;
      document.getElementById('product-price').value = product.price;
      document.getElementById('product-stock').value = product.stock;
      document.getElementById('product-id').value = product.id;
    } else {
      alert('Producto no encontrado');
      window.location.href = 'admin.html';
    }
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    alert('Error al cargar los datos del producto');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const updatedProduct = {
      name: document.getElementById('product-name').value,
      price: document.getElementById('product-price').value,
      stock: document.getElementById('product-stock').value,
    };

    try {
      const response = await fetch(`http://3.218.242.218/api/admin/products/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedProduct),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.ok) {
        alert('Producto actualizado exitosamente');
        window.location.href = 'admin.html';
      } else {
        alert('Error al actualizar el producto');
      }
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      alert('Hubo un error al guardar los cambios');
    }
  });
});
