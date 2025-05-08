document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registration-form');

  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const birthDate = document.getElementById('birth_date').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (!name || !birthDate || !email || !password) {
        alert('Por favor, completa todos los campos.');
        return;
      }

      try {
        const response = await fetch('http://3.218.242.218/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            birth_date: birthDate,
            email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Registro exitoso. Ahora puedes iniciar sesión.');
          window.location.href = 'login.html'; 
        } else {
          alert(`Error al registrar el usuario: ${data.message}`);
        }
      } catch (error) {
        console.error('Error en el registro:', error);
        alert(
          'Hubo un error al intentar registrarte. Por favor, intenta nuevamente.',
        );
      }
    });
  }
});
