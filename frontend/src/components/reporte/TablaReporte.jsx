import { useMemo, useState } from 'react';
import { descargarCSV } from '../../utils/csv.js';

export function TablaReporte({ columnas, filas, nombreArchivo, cargando = false }) {
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState({ columna: null, direccion: 'asc' });

  const filasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return filas;
    const texto = busqueda.trim().toLowerCase();
    return filas.filter((fila) =>
      columnas.some((columna) => String(fila[columna.key] ?? '').toLowerCase().includes(texto))
    );
  }, [filas, busqueda, columnas]);

  const filasOrdenadas = useMemo(() => {
    if (!orden.columna) return filasFiltradas;
    const copia = [...filasFiltradas];
    copia.sort((a, b) => {
      const valorA = a[orden.columna];
      const valorB = b[orden.columna];
      if (valorA === valorB) return 0;
      const comparacion = valorA > valorB ? 1 : -1;
      return orden.direccion === 'asc' ? comparacion : -comparacion;
    });
    return copia;
  }, [filasFiltradas, orden]);

  function alternarOrden(columnaKey) {
    setOrden((actual) => {
      if (actual.columna !== columnaKey) return { columna: columnaKey, direccion: 'asc' };
      return { columna: columnaKey, direccion: actual.direccion === 'asc' ? 'desc' : 'asc' };
    });
  }

  const totales = useMemo(() => {
    const resultado = {};
    columnas.forEach((columna) => {
      if (columna.total) {
        resultado[columna.key] = filasOrdenadas.reduce(
          (suma, fila) => suma + (Number(fila[columna.key]) || 0),
          0
        );
      }
    });
    return resultado;
  }, [columnas, filasOrdenadas]);

  const hayTotales = Object.keys(totales).length > 0;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en la tabla..."
          className="w-full max-w-xs rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => descargarCSV(nombreArchivo, columnas, filasOrdenadas)}
            disabled={filasOrdenadas.length === 0}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={filasOrdenadas.length === 0}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Imprimir
          </button>
        </div>
      </div>

      <div className="print-area overflow-x-auto">
        {cargando && <p className="py-8 text-center text-sm text-slate-500">Cargando...</p>}
        {!cargando && filasOrdenadas.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">Sin resultados.</p>
        )}
        {!cargando && filasOrdenadas.length > 0 && (
          <table className="min-w-full border border-slate-200 text-left text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                {columnas.map((columna) => (
                  <th
                    key={columna.key}
                    onClick={() => alternarOrden(columna.key)}
                    className="cursor-pointer select-none px-4 py-3"
                  >
                    {columna.header}
                    {orden.columna === columna.key ? (orden.direccion === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filasOrdenadas.map((fila, indice) => (
                <tr key={indice} className="border-t border-slate-200 hover:bg-slate-50">
                  {columnas.map((columna) => (
                    <td key={columna.key} className="px-4 py-3 text-slate-700">
                      {columna.formato ? columna.formato(fila[columna.key], fila) : String(fila[columna.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {hayTotales && (
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-100 font-semibold text-slate-800">
                  {columnas.map((columna) => (
                    <td key={columna.key} className="px-4 py-3">
                      {columna.total ? totales[columna.key].toFixed(2) : ''}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
}
