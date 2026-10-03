import { useEffect, useState } from 'react';
import { obtenerPagosPorMembresia, registrarPago } from '../../services/pago.service.js';
import { formatearMoneda } from '../../utils/moneda.js';

export function ModalPagos({ abierto, alCerrar, membresia }) {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Formulario nuevo pago
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [estadoPago, setEstadoPago] = useState('Pagado');
  const [guardando, setGuardando] = useState(false);

  // Rol del usuario autenticado
  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const esAdmin = usuario?.nombre_rol === 'Administrador';

  useEffect(() => {
    if (abierto && membresia?.id_membresia) {
      cargarHistorial();
      setMonto(membresia.precio_pagado ? String(membresia.precio_pagado) : '');
      setMetodoPago('Efectivo');
      setEstadoPago('Pagado');
      setError('');
      setExito('');
    }
  }, [abierto, membresia]);

  if (!abierto || !membresia) return null;

  async function cargarHistorial() {
    setCargando(true);
    setError('');
    try {
      const resp = await obtenerPagosPorMembresia(membresia.id_membresia);
      setPagos(resp?.data?.pagos || []);
    } catch (err) {
      setError(err?.message || 'Error al obtener los pagos de esta membresía.');
    } finally {
      setCargando(false);
    }
  }

  async function manejarRegistroPago(e) {
    e.preventDefault();
    setError('');
    setExito('');

    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser un número válido mayor a 0.');
      return;
    }

    setGuardando(true);
    try {
      await registrarPago({
        fk_membresia: membresia.id_membresia,
        monto: montoNum,
        metodo_pago: metodoPago,
        estado_pago: estadoPago
      });

      setExito('¡Pago registrado correctamente!');
      setMonto('');
      await cargarHistorial();
    } catch (err) {
      setError(err?.message || 'Error al registrar el pago.');
    } finally {
      setGuardando(false);
    }
  }

  function renderBadgeEstado(estado) {
    if (estado === 'Pagado') {
      return (
        <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
          Pagado
        </span>
      );
    }
    if (estado === 'Pendiente') {
      return (
        <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          Pendiente
        </span>
      );
    }
    return (
      <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
        Rechazado
      </span>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Historial de Pagos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Membresía #{membresia.id_membresia} • {membresia.nombre_usuario || 'Cliente'} ({membresia.nombre_plan})
            </p>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Mensajes de Alerta */}
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}
        {exito && (
          <div className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
            {exito}
          </div>
        )}

        {/* Formulario solo para Administrador */}
        {esAdmin && (
          <form
            onSubmit={manejarRegistroPago}
            className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200/80"
          >
            <h3 className="text-sm font-bold text-slate-800 mb-3">
              Registrar Nuevo Pago
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Monto (COP) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Estado *
                </label>
                <select
                  value={estadoPago}
                  onChange={(e) => setEstadoPago(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                >
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 transition"
              >
                {guardando ? 'Registrando...' : '+ Registrar Pago'}
              </button>
            </div>
          </form>
        )}

        {/* Tabla de Pagos Registrados */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-800 mb-3">
            Pagos de esta membresía
          </h3>

          {cargando ? (
            <div className="py-6 text-center text-sm text-slate-500">
              Cargando pagos...
            </div>
          ) : pagos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-500">
              No hay pagos registrados para esta membresía.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Monto</th>
                    <th className="px-3 py-2">Método</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pagos.map((pago) => (
                    <tr key={pago.id_pago} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-slate-500">
                        #{pago.id_pago}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-800">
                        {formatearMoneda(pago.monto)}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {pago.metodo_pago}
                      </td>
                      <td className="px-3 py-2">
                        {renderBadgeEstado(pago.estado_pago)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={alCerrar}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
