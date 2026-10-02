import { useEffect, useState } from 'react';
import { obtenerReporteRutinas } from '../../services/reporte.service.js';
import { obtenerEntrenadores } from '../../services/entrenador.service.js';
import { obtenerClientes } from '../../services/cliente.service.js';
import { TablaReporte } from './TablaReporte.jsx';

const COLUMNAS = [
  { key: 'nombre_rutina', header: 'Rutina' },
  { key: 'objetivo', header: 'Objetivo' },
  { key: 'nombre_cliente', header: 'Cliente' },
  { key: 'nombre_entrenador', header: 'Entrenador' },
  { key: 'fecha_inicio', header: 'Inicio' },
  { key: 'fecha_fin', header: 'Fin' },
  { key: 'estado', header: 'Estado' }
];

export function ReporteRutinas({ modo = 'general' }) {
  const [entrenadores, setEntrenadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtros, setFiltros] = useState({
    fk_entrenador: '',
    fk_cliente: '',
    estado: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(modo === 'general');
  const [error, setError] = useState('');

  useEffect(() => {
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
    if (modo === 'especifico' && !filtros.fk_entrenador && !filtros.fk_cliente) {
      setError('Selecciona un entrenador o un cliente para ver sus rutinas.');
      return;
    }

    setError('');
    setCargando(true);
    try {
      const respuesta = await obtenerReporteRutinas(filtros);
      setResultado(respuesta.data);
    } catch (err) {
      setError(err?.message || 'No se pudo obtener el reporte de rutinas.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          Cliente
          <select name="fk_cliente" value={filtros.fk_cliente} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Estado
          <select name="estado" value={filtros.estado} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            <option value="Activa">Activa</option>
            <option value="Pausada">Pausada</option>
            <option value="Finalizada">Finalizada</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Inicio desde
          <input type="date" name="fecha_inicio" value={filtros.fecha_inicio} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Inicio hasta
          <input type="date" name="fecha_fin" value={filtros.fecha_fin} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
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
          <div className="mb-4 flex flex-wrap gap-3">
            {resultado.resumen.por_estado.map((fila) => (
              <div key={fila.estado} className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{fila.estado}</p>
                <p className="text-2xl font-bold text-slate-800">{fila.cantidad}</p>
              </div>
            ))}
            {resultado.resumen.por_estado.length === 0 && (
              <p className="text-sm text-slate-500">Sin rutinas para los filtros seleccionados.</p>
            )}
          </div>

          <TablaReporte
            columnas={COLUMNAS}
            filas={resultado.detalle}
            nombreArchivo="reporte-rutinas"
            cargando={cargando}
          />
        </>
      )}
    </div>
  );
}
