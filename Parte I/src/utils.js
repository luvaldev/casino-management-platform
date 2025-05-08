// Funcion para validar formato de correo
export const validarEmail = email => {
	var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
	if (!regex.test(email)) {
		return false;
	}
	return true;
};

export const formatearMoneda = monto => {
	return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
};
