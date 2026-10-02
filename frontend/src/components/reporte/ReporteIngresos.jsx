import { useEffect, useState } from 'react';
import { obtenerReporteIngresos } from '../../services/reporte.service.js';
import { obtenerClientes } from '../../services/cliente.service.js';
import { obtenerPlanes } from '../../services/plan.service.js';
import { TablaReporte } from './TablaReporte.jsx';

const COLUMNAS = [
  { key: 'fecha_pago', header: 'Fecha' },
  { key: 'nombre_cliente', header: 'Cliente' },
  { key: 'correo_cliente', header: 'Correo' },
  { key: 'nombre_plan', header: 'Plan' },
  { key: 'metodo_pago', header: 'Método' },
  { key: 'estado_pago', header: 'Estado' },
  { key: 'monto', header: 'Monto', total: true }
];

export function ReporteIngresos({ modo = 'general' }) {
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    fk_cliente: '',
    fk_plan: '',
    metodo_pago: '',
    estado_pago: ''
  });
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(modo === 'general');
  const [error, setError] = useState('');
  const [buscado, setBuscado] = useState(false);

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
      setError('Selecciona un cliente o un plan para ver el historial.');
      return;
    }

    setError('');
    setCargando(true);
    setBuscado(true);
    try {
      const respuesta = await obtenerReporteIngresos(filtros);
      setResultado(respuesta.data);
    } catch (err) {
      setError(err?.message || 'No se pudo obtener el reporte de ingresos.');
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
          <select name="fk_cliente" value={filtros.fk_cliente} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido}</option>
            ))}
          </select>
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
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Método de pago
          <select name="metodo_pago" value={filtros.metodo_pago} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Estado del pago
          <select name="estado_pago" value={filtros.estado_pago} onChange={manejarCambio} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            <option value="Pagado">Pagado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Rechazado">Rechazado</option>
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
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase text-emerald-700">Total pagado</p>
              <p className="text-2xl font-bold text-emerald-800">${Number(resultado.resumen.total_pagado).toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase text-amber-700">Pendiente</p>
              <p className="text-2xl font-bold text-amber-800">${Number(resultado.resumen.total_pendiente).toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase text-red-700">Rechazado</p>
              <p className="text-2xl font-bold text-red-800">${Number(resultado.resumen.total_rechazado).toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-2 text-sm font-bold text-slate-700">Por método de pago</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                {resultado.resumen.por_metodo_pago.map((fila) => (
                  <li key={fila.metodo_pago} className="flex justify-between">
                    <span>{fila.metodo_pago}</span>
                    <span className="font-semibold">${Number(fila.total).toFixed(2)} ({fila.cantidad})</span>
                  </li>
                ))}
                {resultado.resumen.por_metodo_pago.length === 0 && <li>Sin datos.</li>}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-2 text-sm font-bold text-slate-700">Por plan</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                {resultado.resumen.por_plan.map((fila) => (
                  <li key={fila.id_plan} className="flex justify-between">
                    <span>{fila.nombre_plan}</span>
                    <span className="font-semibold">${Number(fila.total).toFixed(2)} ({fila.cantidad})</span>
                  </li>
                ))}
                {resultado.resumen.por_plan.length === 0 && <li>Sin datos.</li>}
              </ul>
            </div>
          </div>

          <TablaReporte
            columnas={COLUMNAS}
            filas={resultado.detalle}
            nombreArchivo="reporte-ingresos"
            cargando={cargando}
          />
        </>
      )}

      {!resultado && !error && buscado && cargando && (
        <p className="py-8 text-center text-sm text-slate-500">Cargando...</p>
      )}
    </div>
  );
}
