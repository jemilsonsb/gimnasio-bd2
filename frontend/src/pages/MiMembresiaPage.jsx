import { useEffect, useState } from 'react';
import { obtenerHistorialUsuario } from '../services/membresia.service.js';
import { obtenerPagosPorMembresia } from '../services/pago.service.js';

export function MiMembresiaPage() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [perfilNoEncontrado, setPerfilNoEncontrado] = useState(false);
  const [pagosActivos, setPagosActivos] = useState([]);
  const [cargandoPagos, setCargandoPagos] = useState(false);

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  useEffect(() => {
    document.title = 'Mi Membresía | Gimnasio BD2';

    if (!usuario?.id_usuario) {
      setError('No se pudo identificar tu sesión.');
      setCargando(false);
      return;
    }

    cargarHistorial(usuario.id_usuario);
  }, []);

  async function cargarHistorial(idUsuario) {
    setCargando(true);
    setError('');
    setPerfilNoEncontrado(false);

    try {
      const respuesta = await obtenerHistorialUsuario(idUsuario);
      setDatos(respuesta.data);

      if (respuesta.data?.membresia_activa?.id_membresia) {
        cargarPagosMembresia(respuesta.data.membresia_activa.id_membresia);
      }
    } catch (err) {
      if (err?.error?.code === 'CLIENT_PROFILE_NOT_FOUND') {
        setPerfilNoEncontrado(true);
      } else {
        setError(err?.message || 'No se pudo obtener la información de tu membresía.');
      }
    } finally {
      setCargando(false);
    }
  }

  async function cargarPagosMembresia(idMembresia) {
    setCargandoPagos(true);
    try {
      const respPagos = await obtenerPagosPorMembresia(idMembresia);
      setPagosActivos(respPagos?.data?.pagos || []);
    } catch {
      setPagosActivos([]);
    } finally {
      setCargandoPagos(false);
    }
  }

  const membresiaActiva = datos?.membresia_activa;
  const historial = datos?.historial || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Mi Membresía
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Consulta el estado de tu suscripción actual y tu historial de planes en el gimnasio.
          </p>
        </div>

        {cargando && (
          <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 shadow-md">
            Cargando el estado de tu membresía...
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {perfilNoEncontrado && (
          <div className="rounded-xl bg-amber-50 p-6 border border-amber-200 text-center">
            <span className="text-4xl">⚠️</span>
            <h2 className="mt-3 text-lg font-bold text-amber-900">
              Perfil de cliente no configurado
            </h2>
            <p className="mt-2 text-sm text-amber-800 max-w-md mx-auto">
              Tu cuenta de usuario aún no tiene un perfil de cliente asignado en el sistema.
              Por favor acércate a recepción o contacta al administrador para vincular tu membresía.
            </p>
          </div>
        )}

        {!cargando && !perfilNoEncontrado && !error && (
          <>
            {/* Tarjeta de Membresía Activa */}
            {membresiaActiva ? (
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-6 text-white shadow-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                      Membresía Activa
                    </span>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
                      {membresiaActiva.nombre_plan}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-slate-300">
                      Vigencia
                    </p>
                    <p className="text-xl font-bold text-sky-300">
                      Vence: {membresiaActiva.fecha_vencimiento}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs text-slate-300">Fecha de Inicio</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {membresiaActiva.fecha_inicio}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs text-slate-300">Días Restantes</p>
                    <p className="mt-1 text-lg font-bold text-emerald-400">
                      {membresiaActiva.dias_restantes >= 0
                        ? `${membresiaActiva.dias_restantes} días`
                        : '0 días'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs text-slate-300">Precio Pagado</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      ${Number(membresiaActiva.precio_pagado).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <span className="text-4xl">🎫</span>
                <h3 className="mt-3 text-lg font-bold text-slate-800">
                  No tienes una membresía activa
                </h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                  Actualmente no cuentas con un plan activo. Visita la recepción del gimnasio
                  para adquirir o renovar tu membresía.
                </p>
              </div>
            )}

            {/* Pagos de la Membresía Activa */}
            {membresiaActiva && (
              <div className="rounded-xl bg-white p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">
                    Historial de Pagos de mi Membresía
                  </h3>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    Membresía #{membresiaActiva.id_membresia}
                  </span>
                </div>

                {cargandoPagos ? (
                  <p className="text-sm text-slate-500 py-4 text-center">
                    Cargando pagos...
                  </p>
                ) : pagosActivos.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">
                    No hay registros de pago para tu membresía activa.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-slate-200 text-left text-sm">
                      <thead className="bg-slate-800 text-white">
                        <tr>
                          <th className="px-4 py-3">Fecha de Pago</th>
                          <th className="px-4 py-3">Monto</th>
                          <th className="px-4 py-3">Método de Pago</th>
                          <th className="px-4 py-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagosActivos.map((p) => (
                          <tr
                            key={p.id_pago}
                            className="border-t border-slate-200 hover:bg-slate-50 transition"
                          >
                            <td className="px-4 py-3 text-slate-600">
                              {p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              ${Number(p.monto).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{p.metodo_pago}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  p.estado_pago === 'Pagado'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : p.estado_pago === 'Pendiente'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {p.estado_pago}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Historial de Membresías */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Historial de Membresías
              </h3>

              {historial.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  Aún no tienes registros en tu historial de membresías.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-slate-200 text-left text-sm">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="px-4 py-3">Plan</th>
                        <th className="px-4 py-3">Fecha Inicio</th>
                        <th className="px-4 py-3">Fecha Vencimiento</th>
                        <th className="px-4 py-3">Precio Pagado</th>
                        <th className="px-4 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((m) => (
                        <tr
                          key={m.id_membresia}
                          className="border-t border-slate-200 hover:bg-slate-50 transition"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {m.nombre_plan}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{m.fecha_inicio}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {m.fecha_vencimiento}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            ${Number(m.precio_pagado).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                                m.vigencia === 'Activa'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.vigencia === 'Cancelada'
                                  ? 'bg-slate-200 text-slate-700'
                                  : m.vigencia === 'Pendiente'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {m.vigencia}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
    </div>
  );
}
