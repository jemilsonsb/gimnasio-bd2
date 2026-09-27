import { useEffect, useState } from 'react';
import { agregarDetalleRutina, obtenerDetallesRutina } from '../../services/rutina.service.js';

const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

export function ModalDetallesRutina({ abierto, alCerrar, rutina, ejercicios = [] }) {
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Formulario nuevo detalle
  const [fkEjercicio, setFkEjercicio] = useState('');
  const [diaSemana, setDiaSemana] = useState('Lunes');
  const [series, setSeries] = useState('4');
  const [repeticiones, setRepeticiones] = useState('12');
  const [descansoSegundos, setDescansoSegundos] = useState('60');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (abierto && rutina?.id_rutina) {
      cargarDetalles();
      setFkEjercicio(ejercicios[0]?.id_ejercicio ? String(ejercicios[0].id_ejercicio) : '');
      setDiaSemana('Lunes');
      setSeries('4');
      setRepeticiones('12');
      setDescansoSegundos('60');
      setError('');
      setExito('');
    }
  }, [abierto, rutina, ejercicios]);

  if (!abierto || !rutina) return null;

  async function cargarDetalles() {
    setCargando(true);
    setError('');
    try {
      const resp = await obtenerDetallesRutina(rutina.id_rutina);
      setDetalles(resp?.data?.detalles || []);
    } catch (err) {
      setError(err?.message || 'Error al cargar los ejercicios de la rutina.');
    } finally {
      setCargando(false);
    }
  }

  async function handleAgregarEjercicio(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (!fkEjercicio) {
      setError('Debes seleccionar un ejercicio del catálogo.');
      return;
    }

    const seriesNum = Number(series);
    if (isNaN(seriesNum) || seriesNum <= 0) {
      setError('Las series deben ser un número mayor a 0.');
      return;
    }

    const repNum = Number(repeticiones);
    if (isNaN(repNum) || repNum <= 0) {
      setError('Las repeticiones deben ser un número mayor a 0.');
      return;
    }

    setGuardando(true);
    try {
      await agregarDetalleRutina(rutina.id_rutina, {
        fk_ejercicio: Number(fkEjercicio),
        dia_semana: diaSemana,
        series: seriesNum,
        repeticiones: repNum,
        descanso_segundos: descansoSegundos ? Number(descansoSegundos) : null
      });

      setExito('Ejercicio agregado a la rutina correctamente.');
      await cargarDetalles();
    } catch (err) {
      setError(err?.message || 'Error al agregar ejercicio a la rutina.');
    } finally {
      setGuardando(false);
    }
  }

  // Agrupar detalles por día de la semana
  const detallesPorDia = DIAS_SEMANA.reduce((acc, dia) => {
    acc[dia] = detalles.filter((d) => d.dia_semana === dia);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700 text-sm">
                💪
              </span>
              <h3 className="font-bold text-slate-800 text-lg">
                Ejercicios de la Rutina: <span className="text-sky-700">{rutina.nombre_rutina}</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cliente: <span className="font-semibold text-slate-700">{rutina.nombre_cliente}</span> • Entrenador: <span className="font-semibold text-slate-700">{rutina.nombre_entrenador}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {exito && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
              {exito}
            </div>
          )}

          {/* Formulario para agregar ejercicio */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <span>➕</span> Agregar Ejercicio a la Rutina
            </h4>
            <form onSubmit={handleAgregarEjercicio} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ejercicio <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={fkEjercicio}
                  onChange={(e) => setFkEjercicio(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition bg-white"
                >
                  <option value="">-- Seleccionar ejercicio --</option>
                  {ejercicios.map((ej) => (
                    <option key={ej.id_ejercicio} value={ej.id_ejercicio}>
                      {ej.nombre_ejercicio} ({ej.grupo_muscular})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Día <span className="text-red-500">*</span>
                </label>
                <select
                  value={diaSemana}
                  onChange={(e) => setDiaSemana(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition bg-white"
                >
                  {DIAS_SEMANA.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Series <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reps <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={repeticiones}
                  onChange={(e) => setRepeticiones(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descanso (s)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Segundos"
                  value={descansoSegundos}
                  onChange={(e) => setDescansoSegundos(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
                />
              </div>

              <div className="sm:col-span-12 flex justify-end mt-1">
                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 transition"
                >
                  {guardando ? 'Agregando...' : '+ Agregar a la Rutina'}
                </button>
              </div>
            </form>
          </div>

          {/* Lista de ejercicios organizados por día */}
          {cargando ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Cargando ejercicios asignados...
            </div>
          ) : detalles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <span className="text-3xl">📝</span>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Esta rutina aún no tiene ejercicios asignados
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Utiliza el formulario superior para agregar ejercicios a los días de entrenamiento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {DIAS_SEMANA.map((dia) => {
                const ejerciciosDia = detallesPorDia[dia] || [];
                if (ejerciciosDia.length === 0) return null;

                return (
                  <div key={dia} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-white">
                      <span className="font-bold text-xs uppercase tracking-wider">{dia}</span>
                      <span className="text-[11px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300 font-medium">
                        {ejerciciosDia.length} ejercicio{ejerciciosDia.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2 font-semibold">Ejercicio</th>
                            <th className="px-4 py-2 font-semibold">Grupo Muscular</th>
                            <th className="px-4 py-2 font-semibold">Series</th>
                            <th className="px-4 py-2 font-semibold">Repeticiones</th>
                            <th className="px-4 py-2 font-semibold">Descanso</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ejerciciosDia.map((d) => (
                            <tr key={d.id_detalle} className="hover:bg-slate-50/80 transition">
                              <td className="px-4 py-2.5 font-medium text-slate-800">
                                {d.nombre_ejercicio}
                                {d.descripcion_ejercicio && (
                                  <span className="block text-[11px] text-slate-400 font-normal">
                                    {d.descripcion_ejercicio}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-slate-600">
                                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                  {d.grupo_muscular}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-slate-800">{d.series}</td>
                              <td className="px-4 py-2.5 font-semibold text-slate-800">{d.repeticiones}</td>
                              <td className="px-4 py-2.5 text-slate-600">
                                {d.descanso_segundos ? `${d.descanso_segundos}s` : 'Sin descanso'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={alCerrar}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
