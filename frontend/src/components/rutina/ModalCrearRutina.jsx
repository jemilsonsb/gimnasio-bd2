import { useEffect, useState } from 'react';
import { crearRutina } from '../../services/rutina.service.js';

export function ModalCrearRutina({ abierto, alCerrar, alGuardar, clientes = [], entrenadores = [] }) {
  const [fkCliente, setFkCliente] = useState('');
  const [fkEntrenador, setFkEntrenador] = useState('');
  const [nombreRutina, setNombreRutina] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState('');
  const [estado, setEstado] = useState('Activa');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const esAdmin = usuario?.nombre_rol === 'Administrador';

  useEffect(() => {
    if (abierto) {
      setFkCliente(clientes[0]?.id_cliente ? String(clientes[0].id_cliente) : '');
      setFkEntrenador(entrenadores[0]?.id_entrenador ? String(entrenadores[0].id_entrenador) : '');
      setNombreRutina('');
      setObjetivo('');
      setFechaInicio(new Date().toISOString().split('T')[0]);
      setFechaFin('');
      setEstado('Activa');
      setError('');
    }
  }, [abierto, clientes, entrenadores]);

  if (!abierto) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!fkCliente) {
      setError('Debes seleccionar un cliente.');
      return;
    }

    if (!nombreRutina.trim()) {
      setError('El nombre de la rutina es obligatorio.');
      return;
    }

    if (esAdmin && !fkEntrenador) {
      setError('Debes seleccionar un entrenador responsable.');
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        fk_cliente: Number(fkCliente),
        nombre_rutina: nombreRutina.trim(),
        objetivo: objetivo.trim() || null,
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
        estado
      };

      if (esAdmin) {
        payload.fk_entrenador = Number(fkEntrenador);
      }

      await crearRutina(payload);
      alGuardar();
      alCerrar();
    } catch (err) {
      setError(err?.message || 'Error al registrar la rutina.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-lg">
              📋
            </span>
            <h3 className="font-bold text-slate-800 text-lg">Crear Nueva Rutina</h3>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={fkCliente}
              onChange={(e) => setFkCliente(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition bg-white"
            >
              <option value="">-- Seleccionar cliente --</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre} {c.apellido} ({c.codigo_miembro || `ID: ${c.id_cliente}`})
                </option>
              ))}
            </select>
          </div>

          {esAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Entrenador Asignado <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={fkEntrenador}
                onChange={(e) => setFkEntrenador(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition bg-white"
              >
                <option value="">-- Seleccionar entrenador --</option>
                {entrenadores.map((e) => (
                  <option key={e.id_entrenador} value={e.id_entrenador}>
                    {e.nombre} {e.apellido}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de la Rutina <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Hipertrofia Tren Superior / Fuerza"
              value={nombreRutina}
              onChange={(e) => setNombreRutina(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Objetivo Principal (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Ganancia muscular, Acondicionamiento, Pérdida de grasa..."
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Fin (Opcional)
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estado Inicial
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition bg-white"
            >
              <option value="Activa">Activa</option>
              <option value="Pausada">Pausada</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={alCerrar}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition"
            >
              {guardando ? 'Guardando...' : 'Crear Rutina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
