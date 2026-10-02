import { useEffect, useState } from 'react';
import { crearProgramacion, parsearErrorBackend } from '../../services/clase.service.js';
import { obtenerFechaHoyLocal } from '../../utils/fecha.js';
import { SelectorBusqueda } from '../common/SelectorBusqueda.jsx';

export function ModalProgramarClase({
  abierto,
  alCerrar,
  alGuardar,
  clases = [],
  entrenadores = [],
  rolUsuario = ''
}) {
  const hoy = obtenerFechaHoyLocal();

  const [fkClase, setFkClase] = useState('');
  const [fecha, setFecha] = useState(hoy);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('09:00');
  const [cuposDisponibles, setCuposDisponibles] = useState(15);
  const [fkEntrenador, setFkEntrenador] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (abierto) {
      setFkClase('');
      setFecha(obtenerFechaHoyLocal());
      setHoraInicio('08:00');
      setHoraFin('09:00');
      setCuposDisponibles(15);
      setFkEntrenador('');
      setError('');
    }
  }, [abierto]);

  if (!abierto) return null;

  const claseSeleccionada = clases.find((c) => String(c.id_clase) === String(fkClase));

  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');

    if (!fkClase) {
      setError('Debes seleccionar una clase.');
      return;
    }

    if (!fecha) {
      setError('La fecha es obligatoria.');
      return;
    }

    if (!horaInicio || !horaFin) {
      setError('La hora de inicio y hora de fin son obligatorias.');
      return;
    }

    if (horaFin <= horaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    const cupos = Number(cuposDisponibles);
    if (isNaN(cupos) || cupos <= 0) {
      setError('Los cupos disponibles deben ser un número mayor a 0.');
      return;
    }

    if (claseSeleccionada && cupos > claseSeleccionada.capacidad_maxima) {
      setError(
        `Los cupos no pueden superar la capacidad máxima de la clase (${claseSeleccionada.capacidad_maxima}).`
      );
      return;
    }

    if (rolUsuario === 'Administrador' && !fkEntrenador) {
      setError('Como administrador debes seleccionar un entrenador.');
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        fk_clase: Number(fkClase),
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        cupos_disponibles: cupos
      };

      if (rolUsuario === 'Administrador') {
        payload.fk_entrenador = Number(fkEntrenador);
      }

      await crearProgramacion(payload);
      alGuardar();
      alCerrar();
    } catch (err) {
      setError(parsearErrorBackend(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-150">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-800">Programar Nueva Clase</h2>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Clase a Programar *
            </label>
            <select
              value={fkClase}
              onChange={(e) => {
                const id = e.target.value;
                setFkClase(id);
                const seleccion = clases.find((c) => String(c.id_clase) === String(id));
                if (seleccion) {
                  setCuposDisponibles(seleccion.capacidad_maxima);
                }
              }}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="">-- Selecciona una clase del catálogo --</option>
              {clases.map((c) => (
                <option key={c.id_clase} value={c.id_clase}>
                  {c.nombre_clase} (Capacidad máx: {c.capacidad_maxima})
                </option>
              ))}
            </select>
          </div>

          {rolUsuario === 'Administrador' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Entrenador Responsable *
              </label>
              <SelectorBusqueda
                value={fkEntrenador}
                onChange={setFkEntrenador}
                placeholder="Busca por nombre o correo..."
                opciones={entrenadores.map((e) => ({
                  value: String(e.id_entrenador),
                  label: `${e.nombre} ${e.apellido} (${e.correo})`,
                  textoBusqueda: `${e.nombre} ${e.apellido} ${e.correo || ''}`
                }))}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha de la Clase *
            </label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hora de Inicio *
              </label>
              <input
                type="time"
                required
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hora de Fin *
              </label>
              <input
                type="time"
                required
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cupos Disponibles *
            </label>
            <input
              type="number"
              min={1}
              max={claseSeleccionada ? claseSeleccionada.capacidad_maxima : undefined}
              required
              value={cuposDisponibles}
              onChange={(e) => setCuposDisponibles(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
            {claseSeleccionada && (
              <span className="text-xs text-slate-500">
                Máximo permitido por el catálogo: {claseSeleccionada.capacidad_maxima} cupos.
              </span>
            )}
          </div>

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
              {enviando ? 'Programando...' : 'Programar Clase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
