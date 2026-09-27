import { useEffect, useState } from 'react';
import { guardarFichaTecnica, obtenerFichaTecnica } from '../../services/ficha_tecnica.service.js';

export function ModalFichaTecnica({ abierto, alCerrar, cliente }) {
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [porcentajeGrasa, setPorcentajeGrasa] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [objetivos, setObjetivos] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [fechaActualizacion, setFechaActualizacion] = useState(null);

  useEffect(() => {
    if (abierto && cliente) {
      cargarFicha();
    }
  }, [abierto, cliente]);

  if (!abierto || !cliente) return null;

  async function cargarFicha() {
    setCargando(true);
    setError('');
    setExito('');
    try {
      const resp = await obtenerFichaTecnica(cliente.id_usuario);
      const f = resp?.data;
      if (f) {
        setPeso(f.peso_kg ? String(f.peso_kg) : '');
        setEstatura(f.estatura ? String(f.estatura) : '');
        setPorcentajeGrasa(f.porcentaje_grasa !== null && f.porcentaje_grasa !== undefined ? String(f.porcentaje_grasa) : '');
        setObservaciones(f.observaciones_medicas || '');
        setObjetivos(f.objetivos || '');
        setFechaActualizacion(f.fecha_actualizacion || null);
      }
    } catch {
      // Si no existe ficha previa, dejamos campos vacíos para crearla
      setPeso('');
      setEstatura('');
      setPorcentajeGrasa('');
      setObservaciones('');
      setObjetivos('');
      setFechaActualizacion(null);
    } finally {
      setCargando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');

    const pesoNum = Number(peso);
    if (isNaN(pesoNum) || pesoNum <= 0) {
      setError('El peso debe ser un número mayor a 0 (ej. 75.5)');
      return;
    }

    const estNum = Number(estatura);
    if (isNaN(estNum) || estNum <= 0) {
      setError('La estatura debe ser un número mayor a 0 (ej. 1.75)');
      return;
    }

    let grasaNum = null;
    if (porcentajeGrasa.trim()) {
      grasaNum = Number(porcentajeGrasa);
      if (isNaN(grasaNum) || grasaNum < 0) {
        setError('El porcentaje de grasa debe ser un número válido.');
        return;
      }
    }

    setGuardando(true);
    try {
      await guardarFichaTecnica({
        fk_cliente: cliente.id_cliente,
        peso_kg: pesoNum,
        estatura: estNum,
        porcentaje_grasa: grasaNum,
        observaciones_medicas: observaciones.trim() || null,
        objetivos: objetivos.trim() || null
      });

      setExito('Ficha técnica guardada exitosamente.');
      await cargarFicha();
    } catch (err) {
      setError(err?.message || 'Error al guardar la ficha técnica.');
    } finally {
      setGuardando(false);
    }
  }

  // Cálculo de IMC en tiempo real
  const pesoNum = Number(peso);
  const estNum = Number(estatura);
  const imc = pesoNum > 0 && estNum > 0 ? (pesoNum / (estNum * estNum)).toFixed(1) : null;

  function clasificacionIMC(valor) {
    if (!valor) return null;
    const n = Number(valor);
    if (n < 18.5) return { texto: 'Bajo peso', color: 'text-amber-600 bg-amber-50' };
    if (n < 25) return { texto: 'Peso saludable', color: 'text-emerald-700 bg-emerald-50' };
    if (n < 30) return { texto: 'Sobrepeso', color: 'text-amber-700 bg-amber-50' };
    return { texto: 'Obesidad', color: 'text-red-700 bg-red-50' };
  }

  const estadoIMC = clasificacionIMC(imc);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 text-lg">
              🩺
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Ficha Técnica del Cliente</h3>
              <p className="text-xs text-slate-500">
                {cliente.nombre} {cliente.apellido} ({cliente.codigo_miembro || `ID: ${cliente.id_cliente}`})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Cargando datos de la ficha técnica...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

            {fechaActualizacion && (
              <p className="text-[11px] text-slate-400">
                Última actualización: {new Date(fechaActualizacion).toLocaleString()}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peso (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  required
                  placeholder="Ej. 75.5"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estatura (m) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="2.5"
                  required
                  placeholder="Ej. 1.75"
                  value={estatura}
                  onChange={(e) => setEstatura(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  % Grasa Corporal
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="70"
                  placeholder="Ej. 18.5"
                  value={porcentajeGrasa}
                  onChange={(e) => setPorcentajeGrasa(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
                />
              </div>
            </div>

            {/* Preview IMC */}
            {imc && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">IMC Estimado:</span>
                  <span className="ml-2 text-base font-bold text-slate-800">{imc}</span>
                </div>
                {estadoIMC && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 ${estadoIMC.color}`}>
                    {estadoIMC.texto}
                  </span>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objetivos Físicos
              </label>
              <textarea
                rows="2"
                placeholder="Ej. Aumento de masa muscular magra, resistencia cardiovascular..."
                value={objetivos}
                onChange={(e) => setObjetivos(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones Médicas / Lesiones
              </label>
              <textarea
                rows="2"
                placeholder="Ej. Lesión en manguito rotador derecho, hipertensión controlada..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={alCerrar}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-500 disabled:opacity-50 transition"
              >
                {guardando ? 'Guardando...' : 'Guardar Ficha Técnica'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
