import { useEffect, useState } from 'react';
import { crearReserva, obtenerProgramaciones, parsearErrorBackend } from '../services/clase.service.js';

export function ReservarClasePage() {
  const [programaciones, setProgramaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [reservandoId, setReservandoId] = useState(null);

  useEffect(() => {
    document.title = 'Reservar Clase | Gimnasio';
    cargarClasesDisponibles();
  }, []);

  async function cargarClasesDisponibles() {
    setCargando(true);
    setError('');
    try {
      const resp = await obtenerProgramaciones(true);
      setProgramaciones(resp?.data || []);
    } catch (err) {
      setError(parsearErrorBackend(err));
    } finally {
      setCargando(false);
    }
  }

  async function handleReservar(idProgramacion) {
    setReservandoId(idProgramacion);
    setError('');
    setExito('');
    try {
      await crearReserva(idProgramacion);
      setExito('¡Reserva realizada exitosamente! Puedes verificar tus reservas en el menú "Mis Reservas".');
      await cargarClasesDisponibles();
    } catch (err) {
      setError(parsearErrorBackend(err));
    } finally {
      setReservandoId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Encabezado */}
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
          Cliente
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Reservar Clase Grupal
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explora los próximos horarios disponibles de tus clases favoritas y asegura tu cupo.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-500 font-bold">
            ✕
          </button>
        </div>
      )}

      {exito && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 border border-emerald-200 flex items-center justify-between">
          <span>{exito}</span>
          <button type="button" onClick={() => setExito('')} className="text-emerald-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Grid de Clases */}
      {cargando ? (
        <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-500 shadow-sm border border-slate-200">
          Cargando clases disponibles...
        </div>
      ) : programaciones.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-200">
          <span className="text-4xl">🧘</span>
          <h3 className="mt-2 font-bold text-slate-800 text-lg">
            No hay clases programadas por el momento
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Vuelve a consultar más tarde para nuevas sesiones disponibles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programaciones.map((p) => {
            const sinCupos = Number(p.cupos_disponibles) <= 0;
            const estaReservando = reservandoId === p.id_programacion;

            return (
              <div
                key={p.id_programacion}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-slate-800">{p.nombre_clase}</h3>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${
                        sinCupos
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {sinCupos ? 'Agotado' : `${p.cupos_disponibles} cupos`}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                    {p.descripcion || 'Sin descripción detallada.'}
                  </p>

                  <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500">📅 Fecha:</span>
                      <span className="font-bold text-slate-800">{p.fecha}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500">⏰ Horario:</span>
                      <span className="font-mono text-slate-800">
                        {p.hora_inicio} - {p.hora_fin}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500">👨‍🏫 Entrenador:</span>
                      <span className="font-medium text-slate-800">
                        {p.nombre_entrenador} {p.apellido_entrenador}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => handleReservar(p.id_programacion)}
                    disabled={sinCupos || estaReservando}
                    className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-sky-500 transition disabled:opacity-50 disabled:hover:bg-sky-600"
                  >
                    {estaReservando
                      ? 'Reservando...'
                      : sinCupos
                      ? 'Sin cupos disponibles'
                      : 'Reservar Cupo'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
