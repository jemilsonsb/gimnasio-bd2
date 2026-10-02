import { useEffect, useState } from 'react';

export function ModalPlan({ abierto, alCerrar, alGuardar, plan = null }) {
  const [formulario, setFormulario] = useState({
    nombre_plan: '',
    descripcion: '',
    duracion_dias: 30,
    precio: 0,
    ingresos_incluidos: '',
    activo: true
  });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormulario({
        nombre_plan: plan.nombre_plan || '',
        descripcion: plan.descripcion || '',
        duracion_dias: plan.duracion_dias || 30,
        precio: plan.precio || 0,
        ingresos_incluidos: plan.ingresos_incluidos ?? '',
        activo: Boolean(plan.activo)
      });
    } else {
      setFormulario({
        nombre_plan: '',
        descripcion: '',
        duracion_dias: 30,
        precio: 0,
        ingresos_incluidos: '',
        activo: true
      });
    }
    setError('');
  }, [plan, abierto]);

  if (!abierto) return null;

  function manejarCambio(e) {
    const { name, value, type, checked } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');

    const dias = Number(formulario.duracion_dias);
    const precio = Number(formulario.precio);
    const ingresosTexto = String(formulario.ingresos_incluidos).trim();
    const ingresosIncluidos = ingresosTexto === '' ? null : Number(ingresosTexto);

    if (!formulario.nombre_plan.trim()) {
      setError('El nombre del plan es obligatorio.');
      return;
    }

    if (isNaN(dias) || dias <= 0) {
      setError('La duración debe ser un número entero mayor a 0 días.');
      return;
    }

    if (isNaN(precio) || precio < 0) {
      setError('El precio debe ser un número mayor o igual a 0.');
      return;
    }

    if (ingresosIncluidos !== null && (isNaN(ingresosIncluidos) || ingresosIncluidos <= 0)) {
      setError('Los ingresos incluidos deben ser un número entero mayor a 0, o vacío para ilimitado.');
      return;
    }

    setEnviando(true);
    try {
      await alGuardar({
        nombre_plan: formulario.nombre_plan.trim(),
        descripcion: formulario.descripcion.trim() || null,
        duracion_dias: dias,
        precio: precio,
        ingresos_incluidos: ingresosIncluidos,
        activo: formulario.activo
      });
      alCerrar();
    } catch (err) {
      if (err?.error?.code === 'DUPLICATE_PLAN') {
        setError('Ya existe un plan registrado con ese nombre.');
      } else {
        setError(err?.message || 'Error al guardar el plan.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-150">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-800">
            {plan ? 'Editar Plan' : 'Nuevo Plan'}
          </h2>
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

        <form onSubmit={manejarEnvio} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre del Plan *
            </label>
            <input
              type="text"
              name="nombre_plan"
              value={formulario.nombre_plan}
              onChange={manejarCambio}
              required
              placeholder="Ej: Mensual Básico, Anual VIP"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              rows={3}
              placeholder="Beneficios y detalles incluidos..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Duración (en días) *
              </label>
              <input
                type="number"
                name="duracion_dias"
                min="1"
                step="1"
                value={formulario.duracion_dias}
                onChange={manejarCambio}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Precio ($) *
              </label>
              <input
                type="number"
                name="precio"
                min="0"
                step="0.01"
                value={formulario.precio}
                onChange={manejarCambio}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ingresos incluidos (vacío = ilimitado)
            </label>
            <input
              type="number"
              name="ingresos_incluidos"
              min="1"
              step="1"
              value={formulario.ingresos_incluidos}
              onChange={manejarCambio}
              placeholder="Ej: 10 (tiquetera de 10 ingresos)"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          {plan && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formulario.activo}
                onChange={manejarCambio}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="activo" className="text-sm font-medium text-slate-700">
                Plan Activo (disponible para nuevas asignaciones)
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={alCerrar}
              disabled={enviando}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition disabled:opacity-50"
            >
              {enviando ? 'Guardando...' : plan ? 'Actualizar Plan' : 'Crear Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
