function formatearFechaLocal(date) {
  const anio = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function obtenerFechaHoyLocal() {
  return formatearFechaLocal(new Date());
}

export { obtenerFechaHoyLocal, formatearFechaLocal };
