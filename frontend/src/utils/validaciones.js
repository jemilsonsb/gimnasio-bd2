export const CAMPOS_SOLO_DIGITOS = ['documento_identidad', 'telefono'];

export function validarFormularioUsuario(formulario) {
  const errores = {};

  if (!formulario.nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
  if (!formulario.apellido.trim()) errores.apellido = 'El apellido es obligatorio.';

  const documento = formulario.documento_identidad.trim();
  if (!documento) {
    errores.documento_identidad = 'El documento de identidad es obligatorio.';
  } else if (!/^\d{7,10}$/.test(documento)) {
    errores.documento_identidad = 'El documento debe contener solo números, entre 7 y 10 dígitos.';
  }

  const telefono = formulario.telefono.trim();
  if (telefono && !/^3\d{9}$/.test(telefono)) {
    errores.telefono = 'El teléfono debe tener 10 dígitos y empezar por 3.';
  }

  const correo = formulario.correo.trim();
  if (!correo) {
    errores.correo = 'El correo es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errores.correo = 'El correo no es válido. Usa un formato como nombre@dominio.com.';
  }

  if (!formulario.contrasena) {
    errores.contrasena = 'La contraseña es obligatoria.';
  } else if (formulario.contrasena.length < 6) {
    errores.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
  }

  return errores;
}

export function erroresDesdeRespuesta(error) {
  const detalles = error?.error?.details;
  if (!Array.isArray(detalles)) return {};

  return Object.fromEntries(detalles.map((detalle) => [detalle.field, detalle.message]));
}
