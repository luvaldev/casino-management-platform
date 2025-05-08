document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id'); 

  if (!productId) {
     alert('Producto no especificado.');
     return;
   }

  try {
    const response = await fetch(
      `http://3.218.242.218/api/products/${productId}`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new Error('No se pudo obtener el producto.');
    }

    const data = await response.json();

    if (data.ok) {
      document.getElementById('product-name').textContent = data.product.name;
      document.getElementById('product-image').src = data.product.image;
      document.getElementById('product-price').textContent = data.product.price;
      document.getElementById('product-stock').textContent = data.product.stock;
      document.getElementById('product-description').textContent =
        data.product.description;
    } else {
      alert(data.message || 'No se encontró el producto.');
    }
  } catch (error) {
    console.error('Error al cargar el producto:', error);
    alert('Hubo un error al cargar el producto. Inténtalo más tarde.');
  }
});
