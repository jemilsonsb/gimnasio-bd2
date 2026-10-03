import { useEffect, useState } from 'react';
import { obtenerReservasDeProgramacion, parsearErrorBackend } from '../../services/clase.service.js';
import { obtenerFechaHoyLocal } from '../../utils/fecha.js';
import { ModalConfirmacion } from '../membresia/ModalConfirmacion.jsx';

export function ModalVerAsistentes({
  abierto,
  alCerrar,
  programacion,
  rolUsuario,
  alCancelarReserva,
  alMarcarAsistio
}) {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [reservaACancelar, setReservaACancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [marcandoAsistioId, setMarcandoAsistioId] = useState(null);

  useEffect(() => {
    if (abierto && programacion?.id_programacion) {
      cargarAsistentes();
    }
  }, [abierto, programacion]);

  async function cargarAsistentes() {
    setCargando(true);
    setError('');
    try {
      const resp = await obtenerReservasDeProgramacion(programacion.id_programacion);
      setReservas(resp.data?.reservas || []);
    } catch (err) {
      setError(parsearErrorBackend(err));
    } finally {
      setCargando(false);
    }
  }

  async function handleConfirmarCancelar() {
    if (!reservaACancelar) return;
    setCancelando(true);
    try {
      await alCancelarReserva(reservaACancelar.id_reserva);
      setReservaACancelar(null);
      await cargarAsistentes();
    } catch (err) {
      setError(parsearErrorBackend(err));
    } finally {
      setCancelando(false);
    }
  }

  async function handleMarcarAsistio(idReserva) {
    setError('');
    setMarcandoAsistioId(idReserva);
    try {
      await alMarcarAsistio(idReserva);
      await cargarAsistentes();
    } catch (err) {
      setError(parsearErrorBackend(err));
    } finally {
      setMarcandoAsistioId(null);
    }
  }

  if (!abierto || !programacion) return null;

  const hoy = obtenerFechaHoyLocal();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-150">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Lista de Asistentes / Reservas
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clase: <span className="font-semibold text-slate-700">{programacion.nombre_clase}</span> • Fecha: {programacion.fecha} ({programacion.hora_inicio} - {programacion.hora_fin})
              </p>
            </div>
            <button
              type="button"
              onClick={alCerrar}
              className="text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {cargando ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Cargando lista de participantes...
              </div>
            ) : reservas.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No hay clientes inscritos en esta programación.
              </div>
            ) : (
              <table className="min-w-full border border-slate-200 text-left text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-2.5">Cliente</th>
                    <th className="px-4 py-2.5">Código / Correo</th>
                    <th className="px-4 py-2.5">Estado</th>
                    <th className="px-4 py-2.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reservas.map((r) => (
                    <tr key={r.id_reserva} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-2.5 font-semibold text-slate-800">
                        {r.nombre_cliente}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-600">
                        {r.codigo_miembro ? `[${r.codigo_miembro}] ` : ''}{r.correo_cliente}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            r.estado_reserva === 'Confirmada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.estado_reserva === 'Asistio'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {r.estado_reserva}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {r.estado_reserva === 'Confirmada' && r.fecha_clase <= hoy && (
                            <button
                              type="button"
                              onClick={() => handleMarcarAsistio(r.id_reserva)}
                              disabled={marcandoAsistioId === r.id_reserva}
                              className="rounded bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition border border-sky-200 disabled:opacity-50"
                            >
                              {marcandoAsistioId === r.id_reserva ? 'Marcando...' : 'Marcar asistió'}
                            </button>
                          )}
                          {rolUsuario === 'Administrador' && r.estado_reserva === 'Confirmada' && (
                            <button
                              type="button"
                              onClick={() => setReservaACancelar(r)}
                              className="rounded bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition border border-red-200"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={alCerrar}
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <ModalConfirmacion
        abierto={Boolean(reservaACancelar)}
        alCerrar={() => setReservaACancelar(null)}
        alConfirmar={handleConfirmarCancelar}
        titulo="Cancelar Reserva del Cliente"
        mensaje={`¿Estás seguro de que deseas cancelar la reserva de ${reservaACancelar?.nombre_cliente}? Se liberará 1 cupo para la clase.`}
        cargando={cancelando}
      />
    </>
  );
}
