import { useEffect, useState } from 'react';
import { obtenerReporteClases } from '../../services/reporte.service.js';
import { obtenerClases } from '../../services/clase.service.js';
import { obtenerEntrenadores } from '../../services/entrenador.service.js';
import { obtenerClientes } from '../../services/cliente.service.js';
import { TablaReporte } from './TablaReporte.jsx';

const COLUMNAS_OCUPACION = [
  { key: 'fecha', header: 'Fecha' },
  { key: 'hora_inicio', header: 'Hora inicio' },
  { key: 'hora_fin', header: 'Hora fin' },
  { key: 'nombre_clase', header: 'Clase' },
  { key: 'capacidad_maxima', header: 'Capacidad', total: true },
  { key: 'cupos_usados', header: 'Cupos usados', total: true },
  { key: 'cupos_disponibles', header: 'Cupos disponibles', total: true }
];

const COLUMNAS_RESERVAS = [
  { key: 'fecha_clase', header: 'Fecha clase' },
  { key: 'nombre_clase', header: 'Clase' },
  { key: 'nombre_cliente', header: 'Cliente' },
  { key: 'correo_cliente', header: 'Correo' },
  { key: 'estado_reserva', header: 'Estado reserva' },
  { key: 'fecha_reserva', header: 'Fecha de reserva' }
];

export function ReporteClases({ modo = 'general' }) {
  const [clases, setClases] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    fk_clase: '',
    fk_entrenador: '',
    fk_programacion: '',
    fk_cliente: ''
  });
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(modo === 'general');
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerClases().then((respuesta) => setClases(respuesta.data)).catch(() => {});
    obtenerEntrenadores().then((respuesta) => setEntrenadores(respuesta.data)).catch(() => {});
    obtenerClientes(true).then((respuesta) => setClientes(respuesta.data)).catch(() => {});
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
    if (modo === 'especifico' && !filtros.fk_cliente && !filtros.fk_programacion) {
      setError('Selecciona un cliente (reservas) o una programación (asistentes) para continuar.');
      return;
    }

    setError('');
    setCargando(true);
    try {
      const respuesta = await obtenerReporteClases(filtros);
      setResultado(respuesta.data);
    } catch (err) {
      setError(err?.message || 'No se pudo obtener el reporte de clases.');
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
          Clase
          <select name="fk_clase" value={filtros.fk_clase} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todas</option>
            {clases.map((c) => (
              <option key={c.id_clase} value={c.id_clase}>{c.nombre_clase}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Entrenador
          <select name="fk_entrenador" value={filtros.fk_entrenador} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            {entrenadores.map((e) => (
              <option key={e.id_entrenador} value={e.id_entrenador}>{e.nombre} {e.apellido}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Cliente (reservas)
          <select name="fk_cliente" value={filtros.fk_cliente} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          ID de programación (asistentes)
          <input
            type="number"
            name="fk_programacion"
            value={filtros.fk_programacion}
            onChange={manejarCambio}
            min="1"
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
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
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {resultado.resumen.reservas_por_estado.map((fila) => (
              <div key={fila.estado_reserva} className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{fila.estado_reserva}</p>
                <p className="text-2xl font-bold text-slate-800">{fila.cantidad}</p>
              </div>
            ))}
            {resultado.resumen.reservas_por_estado.length === 0 && (
              <p className="text-sm text-slate-500">Sin reservas en el rango seleccionado.</p>
            )}
          </div>

          <h3 className="mb-2 text-sm font-bold text-slate-700">Ocupación por clase</h3>
          <div className="mb-6">
            <TablaReporte
              columnas={COLUMNAS_OCUPACION}
              filas={resultado.resumen.ocupacion}
              nombreArchivo="reporte-ocupacion-clases"
              cargando={cargando}
            />
          </div>

          <h3 className="mb-2 text-sm font-bold text-slate-700">Reservas</h3>
          <TablaReporte
            columnas={COLUMNAS_RESERVAS}
            filas={resultado.detalle}
            nombreArchivo="reporte-reservas-clases"
            cargando={cargando}
          />
        </>
      )}
    </div>
  );
}
