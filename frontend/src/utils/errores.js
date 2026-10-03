export function mensajeDeError(error, mensajePorDefecto) {
  if (error instanceof TypeError) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }

  if (error instanceof SyntaxError) {
    return 'El servidor respondió de forma inesperada. Inténtalo más tarde.';
  }

  return error?.message || mensajePorDefecto;
}
