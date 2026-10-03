import { useEffect, useState } from 'react';
import { ModalCrearEjercicio } from '../components/rutina/ModalCrearEjercicio.jsx';
import { obtenerEjercicios } from '../services/ejercicio.service.js';

export function EjerciciosAdminPage() {
  const [ejercicios, setEjercicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('Todos');
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  useEffect(() => {
    document.title = 'Catálogo de Ejercicios | Gimnasio';
    cargarEjercicios();
  }, []);

  async function cargarEjercicios() {
    setCargando(true);
    setError('');
    try {
      const resp = await obtenerEjercicios();
      setEjercicios(resp?.data || []);
    } catch (err) {
      setError(err?.message || 'Error al cargar el catálogo de ejercicios.');
    } finally {
      setCargando(false);
    }
  }

  const gruposDisponibles = ['Todos', ...new Set(ejercicios.map((e) => e.grupo_muscular).filter(Boolean))];

  const ejerciciosFiltrados = ejercicios.filter((e) => {
    const coincideTexto =
      e.nombre_ejercicio.toLowerCase().includes(busqueda.toLowerCase()) ||
      (e.descripcion && e.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideGrupo = filtroGrupo === 'Todos' || e.grupo_muscular === filtroGrupo;
    return coincideTexto && coincideGrupo;
  });

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Catálogo de Ejercicios
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Gestiona el catálogo de ejercicios disponibles para las rutinas de entrenamiento.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalCrearAbierto(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-sky-500 transition"
          >
            <span>➕</span>
            <span>Nuevo Ejercicio</span>
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Grupo Muscular:
            </label>
            <select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition bg-white"
            >
              {gruposDisponibles.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            Cargando ejercicios...
          </div>
        ) : ejerciciosFiltrados.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <span className="text-4xl">🏋️‍♂️</span>
            <h3 className="mt-3 text-lg font-bold text-slate-800">No se encontraron ejercicios</h3>
            <p className="mt-1 text-sm text-slate-500">
              {ejercicios.length === 0
                ? 'El catálogo aún no tiene ejercicios registrados.'
                : 'No hay ejercicios que coincidan con los filtros aplicados.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ejerciciosFiltrados.map((ej) => (
              <div
                key={ej.id_ejercicio}
                className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-800 text-base">
                      {ej.nombre_ejercicio}
                    </h3>
                    <span className="inline-block rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800 whitespace-nowrap">
                      {ej.grupo_muscular}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {ej.descripcion || 'Sin descripción o instrucciones adicionales.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>ID: #{ej.id_ejercicio}</span>
                  <span className="font-medium text-slate-600">Catálogo Gimnasio</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalCrearEjercicio
        abierto={modalCrearAbierto}
        alCerrar={() => setModalCrearAbierto(false)}
        alGuardar={cargarEjercicios}
      />
    </>
  );
}
