const formateadorCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

function esValorVacio(valor) {
  return valor === null || valor === undefined || valor === '';
}

export function valorNumerico(valor) {
  if (esValorVacio(valor)) return 0;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

export function formatearMoneda(valor) {
  if (esValorVacio(valor)) return '—';
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return '—';
  return formateadorCOP.format(numero);
}
