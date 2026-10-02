import { useEffect, useState } from 'react';
import { obtenerReporteClientes } from '../../services/reporte.service.js';
import { TablaReporte } from './TablaReporte.jsx';

const COLUMNAS = [
  { key: 'nombre_cliente', header: 'Nombre' },
  { key: 'correo', header: 'Correo' },
  { key: 'telefono', header: 'Teléfono' },
  { key: 'codigo_miembro', header: 'Código de miembro' },
  { key: 'fecha_registro', header: 'Fecha de registro' },
  { key: 'estado', header: 'Estado' }
];

export function ReporteClientes() {
  const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '', estado: '' });
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function manejarCambio(e) {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  }

  async function buscar() {
    setError('');
    setCargando(true);
    try {
      const respuesta = await obtenerReporteClientes(filtros);
      setResultado(respuesta.data);
    } catch (err) {
      setError(err?.message || 'No se pudo obtener el reporte de clientes.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Registrados desde
          <input type="date" name="fecha_inicio" value={filtros.fecha_inicio} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Registrados hasta
          <input type="date" name="fecha_fin" value={filtros.fecha_fin} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Estado
          <select name="estado" value={filtros.estado} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </label>
        <div className="flex items-end">
          <button type="button" onClick={buscar} className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
            Buscar
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

      {resultado && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase text-emerald-700">Clientes activos</p>
              <p className="text-2xl font-bold text-emerald-800">{resultado.resumen.total_activos}</p>
            </div>
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs font-semibold uppercase text-sky-700">Nuevos en el período</p>
              <p className="text-2xl font-bold text-sky-800">{resultado.resumen.nuevos_periodo}</p>
            </div>
          </div>

          <TablaReporte
            columnas={COLUMNAS}
            filas={resultado.detalle}
            nombreArchivo="reporte-clientes"
            cargando={cargando}
          />
        </>
      )}
    </div>
  );
}
