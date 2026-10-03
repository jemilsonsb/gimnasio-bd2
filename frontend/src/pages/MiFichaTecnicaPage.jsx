import { useEffect, useState } from 'react';
import { obtenerFichaTecnica } from '../services/ficha_tecnica.service.js';

export function MiFichaTecnicaPage() {
  const [ficha, setFicha] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [sinFicha, setSinFicha] = useState(false);

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  useEffect(() => {
    document.title = 'Mi Ficha Técnica | Gimnasio';

    if (!usuario?.id_usuario) {
      setError('No se pudo identificar tu sesión.');
      setCargando(false);
      return;
    }

    cargarFicha(usuario.id_usuario);
  }, []);

  async function cargarFicha(idUsuario) {
    setCargando(true);
    setError('');
    setSinFicha(false);

    try {
      const resp = await obtenerFichaTecnica(idUsuario);
      setFicha(resp?.data || null);
    } catch (err) {
      if (err?.error?.code === 'FICHA_NOT_FOUND' || err?.error?.code === 'CLIENT_PROFILE_NOT_FOUND') {
        setSinFicha(true);
      } else {
        setError(err?.message || 'Error al cargar tu ficha técnica.');
      }
    } finally {
      setCargando(false);
    }
  }

  // Cálculos de IMC
  const pesoNum = Number(ficha?.peso_kg);
  const estNum = Number(ficha?.estatura);
  const imc = pesoNum > 0 && estNum > 0 ? (pesoNum / (estNum * estNum)).toFixed(1) : null;

  function clasificacionIMC(valor) {
    if (!valor) return null;
    const n = Number(valor);
    if (n < 18.5) return { texto: 'Bajo peso', color: 'text-amber-700 bg-amber-100 border-amber-200' };
    if (n < 25) return { texto: 'Peso saludable', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' };
    if (n < 30) return { texto: 'Sobrepeso', color: 'text-amber-700 bg-amber-100 border-amber-200' };
    return { texto: 'Obesidad', color: 'text-red-700 bg-red-100 border-red-200' };
  }

  const estadoIMC = clasificacionIMC(imc);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Mi Ficha Técnica
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Registro de tus medidas corporales, objetivos deportivos y recomendaciones médicas.
        </p>
      </div>

      {cargando && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-md">
          Cargando tu ficha técnica...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {sinFicha && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <span className="text-4xl">📋</span>
          <h3 className="mt-3 text-lg font-bold text-slate-800">
            Aún no tienes una ficha técnica registrada
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Acércate con tu entrenador personal para realizar tu valoración antropométrica inicial (peso, estatura, % grasa y objetivos).
          </p>
        </div>
      )}

      {!cargando && !sinFicha && !error && ficha && (
        <>
          {/* Tarjeta Resumen Principal */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 text-white shadow-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 text-2xl border border-teal-500/30">
                  🩺
                </span>
                <div>
                  <span className="text-xs uppercase font-bold text-teal-300 tracking-wider">
                    Valoración Antropométrica
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black">
                    {ficha.nombre_cliente}
                  </h2>
                </div>
              </div>
              {ficha.fecha_actualizacion && (
                <div className="text-right">
                  <p className="text-xs text-slate-400">Última actualización</p>
                  <p className="text-xs font-semibold text-teal-300">
                    {new Date(ficha.fecha_actualizacion).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Grid de métricas */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-white/5 p-4 backdrop-blur border border-white/5 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Peso
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {ficha.peso_kg} <span className="text-xs font-normal text-slate-300">kg</span>
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-4 backdrop-blur border border-white/5 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Estatura
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {ficha.estatura} <span className="text-xs font-normal text-slate-300">m</span>
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-4 backdrop-blur border border-white/5 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  IMC
                </p>
                <p className="mt-1 text-2xl font-black text-teal-300">
                  {imc || '-'}
                </p>
                {estadoIMC && (
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${estadoIMC.color}`}>
                    {estadoIMC.texto}
                  </span>
                )}
              </div>

              <div className="rounded-xl bg-white/5 p-4 backdrop-blur border border-white/5 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  % Grasa
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {ficha.porcentaje_grasa !== null && ficha.porcentaje_grasa !== undefined
                    ? `${ficha.porcentaje_grasa}%`
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Secciones de Información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Objetivos */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 text-sm">
                  🎯
                </span>
                <h3 className="text-base font-bold text-slate-800">
                  Objetivos Físicos y Metas
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {ficha.objetivos || 'No se han registrado objetivos específicos aún.'}
              </p>
            </div>

            {/* Observaciones Médicas */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 text-sm">
                  ⚠️
                </span>
                <h3 className="text-base font-bold text-slate-800">
                  Observaciones Médicas y Lesiones
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {ficha.observaciones_medicas || 'Sin restricciones médicas ni lesiones registradas.'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
