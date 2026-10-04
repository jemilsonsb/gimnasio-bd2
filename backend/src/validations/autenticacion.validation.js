const REGLAS = {
  documento: /^\d{7,10}$/,
  telefono: /^3\d{9}$/,
  correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

export function normalizarContacto(body = {}) {
  return {
    documento_identidad: String(body.documento_identidad ?? '').trim(),
    telefono: body.telefono == null ? '' : String(body.telefono).trim(),
    correo: String(body.correo ?? '').trim().toLowerCase()
  };
}

export function validarDatosContacto({ documento_identidad, telefono, correo }) {
  const errores = [];

  if (!REGLAS.documento.test(documento_identidad)) {
    errores.push({
      field: 'documento_identidad',
      message: 'El documento debe contener solo números, entre 7 y 10 dígitos.'
    });
  }

  if (telefono !== '' && !REGLAS.telefono.test(telefono)) {
    errores.push({
      field: 'telefono',
      message: 'El teléfono debe tener 10 dígitos y empezar por 3.'
    });
  }

  if (!REGLAS.correo.test(correo)) {
    errores.push({
      field: 'correo',
      message: 'El correo no es válido. Usa un formato como nombre@dominio.com.'
    });
  }

  return errores;
}
