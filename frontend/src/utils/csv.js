function escaparCelda(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  if (/[",\n;]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export function descargarCSV(nombreArchivo, columnas, filas) {
  const encabezado = columnas.map((columna) => escaparCelda(columna.header)).join(',');
  const lineas = filas.map((fila) =>
    columnas.map((columna) => escaparCelda(fila[columna.key])).join(',')
  );

  const contenido = ['﻿' + encabezado, ...lineas].join('\r\n');
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo.endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
