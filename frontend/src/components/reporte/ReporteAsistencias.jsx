import { useEffect, useState } from 'react';
import { obtenerReporteAsistencias } from '../../services/reporte.service.js';
import { obtenerClientes } from '../../services/cliente.service.js';
import { obtenerPlanes } from '../../services/plan.service.js';
import { TablaReporte } from './TablaReporte.jsx';
import { SelectorBusqueda } from '../common/SelectorBusqueda.jsx';

const COLUMNAS = [
  { key: 'fecha', header: 'Fecha' },
  { key: 'fecha_hora', header: 'Hora' },
  { key: 'nombre_cliente', header: 'Cliente' },
  { key: 'correo_cliente', header: 'Correo' },
  { key: 'nombre_plan', header: 'Plan' }
];

export function ReporteAsistencias({ modo = 'general' }) {
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    fk_cliente: '',
    fk_plan: ''
  });
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(modo === 'general');
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerClientes(true).then((respuesta) => setClientes(respuesta.data)).catch(() => {});
    obtenerPlanes(true).then((respuesta) => setPlanes(respuesta.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (modo === 'general') {
      buscar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  function manejarCambio(e) {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  }

  async function buscar() {
    if (modo === 'especifico' && !filtros.fk_cliente && !filtros.fk_plan) {
      setError('Selecciona un cliente o un plan para ver las asistencias.');
      return;
    }

    setError('');
    setCargando(true);
    try {
      const respuesta = await obtenerReporteAsistencias(filtros);
      setResultado(respuesta.data);
    } catch (err) {
      setError(err?.message || 'No se pudo obtener el reporte de asistencias.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Desde
          <input type="date" name="fecha_inicio" value={filtros.fecha_inicio} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Hasta
          <input type="date" name="fecha_fin" value={filtros.fecha_fin} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Cliente
          <SelectorBusqueda
            value={filtros.fk_cliente}
            onChange={(valor) => manejarCambio({ target: { name: 'fk_cliente', value: valor } })}
            placeholder="Todos"
            opciones={clientes.map((c) => ({
              value: String(c.id_cliente),
              label: `${c.nombre} ${c.apellido}`,
              textoBusqueda: `${c.nombre} ${c.apellido} ${c.codigo_miembro || ''} ${c.correo || ''}`
            }))}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Plan
          <select name="fk_plan" value={filtros.fk_plan} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            {planes.map((p) => (
              <option key={p.id_plan} value={p.id_plan}>{p.nombre_plan}</option>
            ))}
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
              <p className="text-xs font-semibold uppercase text-emerald-700">Total de ingresos</p>
              <p className="text-2xl font-bold text-emerald-800">{resultado.resumen.total_ingresos}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-100 p-4">
              <p className="text-xs font-semibold uppercase text-slate-600">Por plan</p>
              <ul className="text-sm text-slate-700">
                {resultado.resumen.por_plan.map((p) => (
                  <li key={p.id_plan}>{p.nombre_plan}: {p.cantidad}</li>
                ))}
              </ul>
            </div>
          </div>

          <TablaReporte
            columnas={COLUMNAS}
            filas={resultado.detalle}
            nombreArchivo="reporte-asistencias"
            cargando={cargando}
          />
        </>
      )}
    </div>
  );
}
