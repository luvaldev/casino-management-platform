document.addEventListener('DOMContentLoaded', async () => {
  const navItems = document.getElementById('nav-items');

  async function getUserProfile() {
    try {
      const response = await fetch('http://3.218.242.218/api/profile', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        return data.profile; 
      }
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
    }
    return null;
  }

  const userProfile = await getUserProfile();

  if (userProfile) {
    let navContent = `
      <li class="nav-item">
        <span class="nav-link">Wallet: $${userProfile.money}</span>
      </li>
      <li class="nav-item">
        <button id="logout-btn" class="btn btn-link nav-link">Cerrar Sesión</button>
      </li>
      <li class="nav-item">
	<a class="nav-link" href="/profile">$${userProfile.name}</a>
      </li>
    `;

    if (userProfile.role === 'admin') {
      navContent += `
        <li class="nav-item">
          <a class="nav-link" href="admin.html">AdminZone</a>
        </li>
      `;
    }

    navItems.innerHTML = navContent;

    document.addEventListener('click', async (event) => {
      if (event.target.id === 'logout-btn') {
        try {
          const response = await fetch('http://3.218.242.218/api/logout', {
            method: 'GET',
            credentials: 'include',
          });
          if (response.ok) {
            window.location.href = 'index.html';
          }
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        }
      }
    });
  } else {
    navItems.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="login.html">Iniciar Sesión</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="register.html">Registro</a>
      </li>
    `;
  }
});
