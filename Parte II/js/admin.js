document.addEventListener('DOMContentLoaded', async () => {
  const navItems = document.getElementById('nav-items');
  const totalEarnedElement = document.getElementById('total-earned');
  const productsTable = document.getElementById('products-table');

  async function getAdminData() {
    try {
      const totalEarnedResponse = await fetch('http://3.218.242.218/api/admin/totalEarned', {
        method: 'GET',
        credentials: 'include',
      });
      const totalEarnedData = await totalEarnedResponse.json();
      if (totalEarnedData.ok) {
        totalEarnedElement.textContent = totalEarnedData.total;
      } else {
        console.error('Error al obtener el total de ganancias');
      }

      const productsResponse = await fetch('http://3.218.242.218/api/products', {
        method: 'GET',
        credentials: 'include',
      });
      const productsData = await productsResponse.json();
      if (productsData.ok) {
        productsData.products.forEach(product => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.price}</td>
            <td>${product.stock}</td>
            <td>
              <a href="editproduct?id=${product.id}" class="btn btn-warning btn-sm">Editar</a>
              <button class="btn btn-danger btn-sm" data-id="${product.id}">Borrar</button>
            </td>
          `;
          productsTable.appendChild(row);
        });
      } else {
        console.error('Error al obtener los productos');
      }
    } catch (error) {
      console.error('Error al obtener los datos del administrador:', error);
    }
  }

  productsTable.addEventListener('click', async (event) => {
    if (event.target.classList.contains('btn-danger')) {
      const productId = event.target.getAttribute('data-id');
      const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este producto?');
      if (confirmDelete) {
        try {
          const deleteResponse = await fetch(`http://3.218.242.218/api/admin/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          const deleteData = await deleteResponse.json();
          if (deleteData.ok) {
            alert('Producto eliminado con éxito');
            event.target.closest('tr').remove();
          } else {
            alert('Error al eliminar el producto');
          }
        } catch (error) {
          console.error('Error al eliminar el producto:', error);
          alert('Hubo un error al eliminar el producto');
        }
      }
    }
  });


  getAdminData();
});
