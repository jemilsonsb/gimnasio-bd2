import { useEffect, useState } from 'react';
import { obtenerDetallesRutina, obtenerRutinasPorCliente } from '../services/rutina.service.js';

const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

export function MiRutinaPage() {
  const [rutinas, setRutinas] = useState([]);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [error, setError] = useState('');
  const [perfilNoEncontrado, setPerfilNoEncontrado] = useState(false);

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  useEffect(() => {
    document.title = 'Mi Rutina | Gimnasio';

    if (!usuario?.id_usuario) {
      setError('No se pudo identificar tu sesión.');
      setCargando(false);
      return;
    }

    cargarRutinas(usuario.id_usuario);
  }, []);

  async function cargarRutinas(idUsuario) {
    setCargando(true);
    setError('');
    setPerfilNoEncontrado(false);

    try {
      const resp = await obtenerRutinasPorCliente(idUsuario);
      const listaRutinas = resp?.data?.rutinas || [];
      setRutinas(listaRutinas);

      if (listaRutinas.length > 0) {
        // Seleccionar por defecto la primera rutina Activa o la primera disponible
        const activa = listaRutinas.find((r) => r.estado === 'Activa') || listaRutinas[0];
        setRutinaSeleccionada(activa);
        cargarDetallesRutina(activa.id_rutina);
      }
    } catch (err) {
      if (err?.error?.code === 'CLIENT_PROFILE_NOT_FOUND') {
        setPerfilNoEncontrado(true);
      } else {
        setError(err?.message || 'Error al cargar tus rutinas.');
      }
    } finally {
      setCargando(false);
    }
  }

  async function cargarDetallesRutina(idRutina) {
    setCargandoDetalles(true);
    try {
      const resp = await obtenerDetallesRutina(idRutina);
      setDetalles(resp?.data?.detalles || []);
    } catch {
      setDetalles([]);
    } finally {
      setCargandoDetalles(false);
    }
  }

  function handleSeleccionarRutina(rutina) {
    setRutinaSeleccionada(rutina);
    cargarDetallesRutina(rutina.id_rutina);
  }

  // Agrupar ejercicios por día de la semana
  const ejerciciosPorDia = DIAS_SEMANA.reduce((acc, dia) => {
    acc[dia] = detalles.filter((d) => d.dia_semana === dia);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Mi Plan de Entrenamiento
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Consulta tu rutina personalizada diseñada por tu entrenador asignado.
        </p>
      </div>

      {cargando && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-md">
          Cargando tu plan de entrenamiento...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {perfilNoEncontrado && (
        <div className="rounded-2xl bg-amber-50 p-8 border border-amber-200 text-center shadow-sm">
          <span className="text-4xl">⚠️</span>
          <h2 className="mt-3 text-lg font-bold text-amber-900">
            Perfil de cliente no configurado
          </h2>
          <p className="mt-2 text-sm text-amber-800 max-w-md mx-auto">
            Tu cuenta aún no tiene un perfil de cliente vinculado. Acércate a recepción para configurar tu ficha y rutinas.
          </p>
        </div>
      )}

      {!cargando && !perfilNoEncontrado && !error && (
        <>
          {rutinas.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <span className="text-4xl">🏋️‍♂️</span>
              <h3 className="mt-3 text-lg font-bold text-slate-800">
                Aún no tienes rutinas asignadas
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                Tu entrenador personal aún no te ha asignado una rutina. Comunícate con tu entrenador en tu próxima visita.
              </p>
            </div>
          ) : (
            <>
              {/* Tarjeta de Rutina Destacada */}
              {rutinaSeleccionada && (
                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-xl">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            rutinaSeleccionada.estado === 'Activa'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          }`}
                        >
                          Rutina {rutinaSeleccionada.estado}
                        </span>
                      </div>
                      <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
                        {rutinaSeleccionada.nombre_rutina}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Entrenador Asignado
                      </p>
                      <p className="text-base font-bold text-emerald-300">
                        {rutinaSeleccionada.nombre_entrenador}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/5 p-3.5 backdrop-blur">
                      <p className="text-xs text-slate-400">Objetivo</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {rutinaSeleccionada.objetivo || 'Acondicionamiento general'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3.5 backdrop-blur">
                      <p className="text-xs text-slate-400">Fecha de Inicio</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {rutinaSeleccionada.fecha_inicio || 'En curso'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3.5 backdrop-blur">
                      <p className="text-xs text-slate-400">Total de Ejercicios</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-400">
                        {detalles.length} ejercicio{detalles.length !== 1 ? 's' : ''} asignado{detalles.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Selector de rutinas si tiene más de una */}
                  {rutinas.length > 1 && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
                      <span className="text-xs text-slate-400 whitespace-nowrap">Otras rutinas:</span>
                      {rutinas.map((r) => (
                        <button
                          key={r.id_rutina}
                          type="button"
                          onClick={() => handleSeleccionarRutina(r)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                            r.id_rutina === rutinaSeleccionada.id_rutina
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                        >
                          {r.nombre_rutina} ({r.estado})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Detalle semanal de ejercicios */}
              <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Cronograma Semanal de Ejercicios
                    </h3>
                    <p className="text-xs text-slate-500">
                      Sigue la estructura de series, repeticiones y descansos recomendada.
                    </p>
                  </div>
                </div>

                {cargandoDetalles ? (
                  <p className="text-sm text-slate-500 py-8 text-center">
                    Cargando cronograma de ejercicios...
                  </p>
                ) : detalles.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center">
                    Esta rutina no tiene ejercicios asignados aún.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {DIAS_SEMANA.map((dia) => {
                      const ejerciciosDia = ejerciciosPorDia[dia] || [];
                      if (ejerciciosDia.length === 0) return null;

                      return (
                        <div
                          key={dia}
                          className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                        >
                          <div className="bg-slate-800 px-5 py-2.5 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm uppercase tracking-wider">
                                {dia}
                              </span>
                            </div>
                            <span className="text-xs bg-slate-700 px-2.5 py-0.5 rounded-full text-slate-200 font-semibold">
                              {ejerciciosDia.length} ejercicio{ejerciciosDia.length > 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100 bg-white">
                            {ejerciciosDia.map((ej, index) => (
                              <div
                                key={ej.id_detalle}
                                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50 transition"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                                    {index + 1}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-slate-800 text-sm">
                                        {ej.nombre_ejercicio}
                                      </h4>
                                      <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 border border-sky-200">
                                        {ej.grupo_muscular}
                                      </span>
                                    </div>
                                    {ej.descripcion_ejercicio && (
                                      <p className="text-xs text-slate-500 mt-1">
                                        {ej.descripcion_ejercicio}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 sm:gap-6 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                                  <div className="text-center">
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                                      Series
                                    </span>
                                    <span className="text-sm font-black text-slate-800">
                                      {ej.series}
                                    </span>
                                  </div>
                                  <div className="text-center">
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                                      Reps
                                    </span>
                                    <span className="text-sm font-black text-slate-800">
                                      {ej.repeticiones}
                                    </span>
                                  </div>
                                  <div className="text-center">
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                                      Descanso
                                    </span>
                                    <span className="text-sm font-semibold text-emerald-700">
                                      {ej.descanso_segundos ? `${ej.descanso_segundos}s` : '-'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
