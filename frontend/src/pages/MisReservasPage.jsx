import { useEffect, useState } from 'react';
import { ModalConfirmacion } from '../components/membresia/ModalConfirmacion.jsx';
import { cancelarReserva, obtenerMisReservas, parsearErrorBackend } from '../services/clase.service.js';

export function MisReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [reservaACancelar, setReservaACancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    document.title = 'Mis Reservas | Gimnasio';
    cargarReservas();
  }, []);

  async function cargarReservas() {
    setCargando(true);
    setError('');
    try {
      const resp = await obtenerMisReservas();
      setReservas(resp?.data || []);
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
      await cancelarReserva(reservaACancelar.id_reserva);
      setReservaACancelar(null);
      await cargarReservas();
    } catch (err) {
      setError(parsearErrorBackend(err));
    } finally {
      setCancelando(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Encabezado */}
        <div className="border-b border-slate-200 pb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
            Cliente
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Mis Reservas de Clases
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Consulta el historial y estado de tus inscripciones a clases grupales.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Historial de Reservas
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {reservas.length} reserva{reservas.length !== 1 ? 's' : ''}
            </span>
          </div>

          {cargando ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Cargando tus reservas...
            </div>
          ) : reservas.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 py-12">
              <span className="text-4xl">📅</span>
              <p className="mt-2 font-medium text-slate-700">
                Aún no tienes reservas registradas.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Puedes explorar la opción "Reservar Clase" para unirte a una sesión.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-200 text-left text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3">Clase</th>
                    <th className="px-4 py-3">Entrenador</th>
                    <th className="px-4 py-3">Fecha Clase</th>
                    <th className="px-4 py-3">Horario</th>
                    <th className="px-4 py-3">Fecha Reserva</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reservas.map((r) => (
                    <tr key={r.id_reserva} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {r.nombre_clase}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {r.nombre_entrenador} {r.apellido_entrenador}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {r.fecha}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-600">
                        {r.hora_inicio} - {r.hora_fin}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {r.fecha_reserva ? new Date(r.fecha_reserva).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                            r.estado_reserva === 'Confirmada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.estado_reserva === 'Asistio'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {r.estado_reserva}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.estado_reserva === 'Confirmada' && (
                          <button
                            type="button"
                            onClick={() => setReservaACancelar(r)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 border border-red-200 hover:bg-red-100 transition"
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ModalConfirmacion
        abierto={Boolean(reservaACancelar)}
        alCerrar={() => setReservaACancelar(null)}
        alConfirmar={handleConfirmarCancelar}
        titulo="Cancelar Reserva de Clase"
        mensaje={`¿Estás seguro de que deseas cancelar tu reserva para la clase "${reservaACancelar?.nombre_clase}" del ${reservaACancelar?.fecha}? Tu cupo quedará libre para otro cliente.`}
        cargando={cancelando}
      />
    </>
  );
}
