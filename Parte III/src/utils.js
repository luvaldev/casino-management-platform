// Funcion para validar formato de correo
export const validarFormatoCorreo = email => {
	var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
	if (!regex.test(email)) {
		return false;
	}
	return true;
};
