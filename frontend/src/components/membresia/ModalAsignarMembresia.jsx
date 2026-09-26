import { useEffect, useState } from 'react';

export function ModalAsignarMembresia({ abierto, alCerrar, alGuardar, clientes = [], planes = [] }) {
  const hoy = new Date().toISOString().slice(0, 10);

  const [fkCliente, setFkCliente] = useState('');
  const [fkPlan, setFkPlan] = useState('');
  const [fechaInicio, setFechaInicio] = useState(hoy);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmacionExito, setConfirmacionExito] = useState(null);

  useEffect(() => {
    if (abierto) {
      setFkCliente('');
      setFkPlan('');
      setFechaInicio(new Date().toISOString().slice(0, 10));
      setError('');
      setConfirmacionExito(null);
    }
  }, [abierto]);

  if (!abierto) return null;

  const planSeleccionado = planes.find((p) => String(p.id_plan) === String(fkPlan));

  function calcularVencimientoEstimado() {
    if (!fechaInicio || !planSeleccionado?.duracion_dias) return null;
    const fecha = new Date(`${fechaInicio}T00:00:00`);
    fecha.setDate(fecha.getDate() + Number(planSeleccionado.duracion_dias));
    return fecha.toISOString().slice(0, 10);
  }

  const vencimientoEstimado = calcularVencimientoEstimado();

  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');

    if (!fkCliente) {
      setError('Debes seleccionar un cliente.');
      return;
    }

    if (!fkPlan) {
      setError('Debes seleccionar un plan.');
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await alGuardar({
        fk_cliente: Number(fkCliente),
        fk_plan: Number(fkPlan),
        fecha_inicio: fechaInicio || undefined
      });

      setConfirmacionExito(respuesta?.data || { fecha_vencimiento: vencimientoEstimado });
    } catch (err) {
      setError(err?.message || 'Error al asignar la membresía.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-150">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-800">Asignar Membresía</h2>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {confirmacionExito ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-center">
              <span className="text-3xl">🎉</span>
              <h3 className="mt-2 text-lg font-bold text-emerald-800">
                ¡Membresía asignada con éxito!
              </h3>
              <p className="mt-1 text-sm text-emerald-700">
                Cliente:{' '}
                <span className="font-semibold">{confirmacionExito.nombre_usuario}</span>
              </p>
              <p className="text-sm text-emerald-700">
                Plan:{' '}
                <span className="font-semibold">{confirmacionExito.nombre_plan}</span>
              </p>
              <div className="mt-3 inline-block rounded-md bg-white px-3 py-1.5 shadow-sm text-sm font-semibold text-emerald-900 border border-emerald-100">
                Vence el: {confirmacionExito.fecha_vencimiento}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={alCerrar}
                className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                Cerrar y actualizar lista
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={manejarEnvio} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cliente *
              </label>
              <select
                value={fkCliente}
                onChange={(e) => setFkCliente(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="">-- Selecciona un cliente --</option>
                {clientes
                  .filter((c) => c.estado === 'Activo')
                  .map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre} {c.apellido} ({c.codigo_miembro || 'S/C'}) - {c.correo}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Plan a Asignar *
              </label>
              <select
                value={fkPlan}
                onChange={(e) => setFkPlan(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="">-- Selecciona un plan activo --</option>
                {planes
                  .filter((p) => p.activo)
                  .map((p) => (
                    <option key={p.id_plan} value={p.id_plan}>
                      {p.nombre_plan} (${p.precio} / {p.duracion_dias} días)
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
              <span className="text-xs text-slate-500">
                Por defecto se toma la fecha actual.
              </span>
            </div>

            {planSeleccionado && (
              <div className="rounded-lg bg-sky-50 p-4 border border-sky-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  Resumen de la Asignación
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Duración:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {planSeleccionado.duracion_dias} días
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Precio a pagar:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      ${planSeleccionado.precio}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-sky-200">
                    <span className="text-slate-500">Fecha de vencimiento calculada:</span>{' '}
                    <span className="font-bold text-sky-700">
                      {vencimientoEstimado || '—'}
                    </span>
                  </div>
                </div>
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
                {enviando ? 'Asignando...' : 'Asignar Membresía'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
