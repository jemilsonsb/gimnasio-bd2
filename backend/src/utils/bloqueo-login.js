export const MAX_INTENTOS_FALLIDOS = 5;
export const MINUTOS_BLOQUEO = 15;

export function estaBloqueado(bloqueadoHasta, ahora) {
  return bloqueadoHasta != null && new Date(bloqueadoHasta) > new Date(ahora);
}

export function minutosRestantes(bloqueadoHasta, ahora) {
  const diferenciaMs = new Date(bloqueadoHasta) - new Date(ahora);
  return Math.max(1, Math.ceil(diferenciaMs / 60000));
}

// Mirror de la decisión que ejecuta el UPDATE atómico en autenticacion.model.js
// (registrarIntentoFallido). Se mantiene aparte para poder probarla sin tocar la BD;
// si se cambia el umbral o los minutos de bloqueo, hay que actualizar también esa consulta.
export function calcularIntentoFallido({ intentosFallidos, bloqueadoHasta, ahora }) {
  const bloqueoExpirado = bloqueadoHasta != null && new Date(bloqueadoHasta) <= new Date(ahora);
  const intentosBase = bloqueoExpirado ? 0 : intentosFallidos;
  const nuevosIntentos = intentosBase + 1;
  const bloqueado = nuevosIntentos >= MAX_INTENTOS_FALLIDOS;

  return {
    intentosFallidos: nuevosIntentos,
    bloqueadoHasta: bloqueado ? new Date(new Date(ahora).getTime() + MINUTOS_BLOQUEO * 60000) : null
  };
}
