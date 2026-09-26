import { useEffect, useState } from 'react';
import { ModalPlan } from '../components/membresia/ModalPlan.jsx';
import {
  actualizarPlan,
  crearPlan,
  obtenerPlanes
} from '../services/plan.service.js';

export function PlanesAdminPage() {
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [planAEditar, setPlanAEditar] = useState(null);

  useEffect(() => {
    document.title = 'Gestión de Planes | Gimnasio BD2';
    cargarPlanes();
  }, []);

  async function cargarPlanes() {
    setCargando(true);
    setError('');
    try {
      const respuesta = await obtenerPlanes(true); // Obtener todos (activos e inactivos)
      setPlanes(respuesta.data || []);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los planes.');
    } finally {
      setCargando(false);
    }
  }

  function abrirNuevoPlan() {
    setPlanAEditar(null);
    setModalAbierto(true);
  }

  function abrirEditarPlan(plan) {
    setPlanAEditar(plan);
    setModalAbierto(true);
  }

  async function guardarPlan(datos) {
    if (planAEditar) {
      await actualizarPlan(planAEditar.id_plan, datos);
    } else {
      await crearPlan(datos);
    }
    await cargarPlanes();
  }

  async function cambiarEstadoActivo(plan) {
    const nuevoEstado = !plan.activo;
    try {
      await actualizarPlan(plan.id_plan, { activo: nuevoEstado });
      setPlanes((prev) =>
        prev.map((p) => (p.id_plan === plan.id_plan ? { ...p, activo: nuevoEstado } : p))
      );
    } catch (err) {
      setError(err?.message || 'Error al cambiar el estado del plan.');
    }
  }

  return (
    <>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Administración
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Planes y Tarifas
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Crea, edita o activa/desactiva los planes de membresía disponibles en el gimnasio.
            </p>
          </div>
          <button
            type="button"
            onClick={abrirNuevoPlan}
            className="flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition"
          >
            <span>+</span> Nuevo Plan
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          {cargando ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Cargando catálogo de planes...
            </div>
          ) : planes.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No hay planes registrados aún. Crea el primero haciendo clic en "Nuevo Plan".
            </div>
          ) : (
            <table className="min-w-full border border-slate-200 text-left text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Duración</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planes.map((plan) => (
                  <tr
                    key={plan.id_plan}
                    className="border-t border-slate-200 hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {plan.nombre_plan}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                      {plan.descripcion || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {plan.duracion_dias} días
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      ${Number(plan.precio).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          plan.activo
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {plan.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEditarPlan(plan)}
                          className="rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => cambiarEstadoActivo(plan)}
                          className={`rounded px-3 py-1.5 text-xs font-semibold text-white transition ${
                            plan.activo
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          {plan.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      <ModalPlan
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alGuardar={guardarPlan}
        plan={planAEditar}
      />
    </>
  );
}
