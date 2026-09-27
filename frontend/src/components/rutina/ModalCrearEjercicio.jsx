import { useState } from 'react';
import { crearEjercicio } from '../../services/ejercicio.service.js';

const GRUPOS_MUSCULARES = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Brazos',
  'Hombros',
  'Abdomen',
  'Glúteos',
  'Cardio',
  'Full Body'
];

export function ModalCrearEjercicio({ abierto, alCerrar, alGuardar }) {
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('Pecho');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  if (!abierto) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre del ejercicio es obligatorio.');
      return;
    }

    if (!grupo.trim()) {
      setError('El grupo muscular es obligatorio.');
      return;
    }

    setGuardando(true);
    try {
      await crearEjercicio({
        nombre_ejercicio: nombre.trim(),
        grupo_muscular: grupo.trim(),
        descripcion: descripcion.trim() || null
      });

      setNombre('');
      setGrupo('Pecho');
      setDescripcion('');
      alGuardar();
      alCerrar();
    } catch (err) {
      setError(err?.message || 'Error al registrar el ejercicio.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 text-lg">
              🏋️
            </span>
            <h3 className="font-bold text-slate-800 text-lg">Nuevo Ejercicio</h3>
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
              Nombre del Ejercicio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Press de Banca Plano"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grupo Muscular <span className="text-red-500">*</span>
            </label>
            <select
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition bg-white"
            >
              {GRUPOS_MUSCULARES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción / Instrucciones (Opcional)
            </label>
            <textarea
              rows="3"
              placeholder="Instrucciones posturales, técnica o equipamiento necesario..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
            ></textarea>
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
              className="rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 transition"
            >
              {guardando ? 'Guardando...' : 'Guardar Ejercicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
