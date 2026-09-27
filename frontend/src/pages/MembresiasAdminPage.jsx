import { useEffect, useState } from 'react';
import { ModalAsignarMembresia } from '../components/membresia/ModalAsignarMembresia.jsx';
import { ModalConfirmacion } from '../components/membresia/ModalConfirmacion.jsx';
import { ModalPagos } from '../components/pago/ModalPagos.jsx';
import { obtenerClientes } from '../services/cliente.service.js';
import {
  asignarMembresia,
  cancelarMembresia,
  obtenerTodasMembresias
} from '../services/membresia.service.js';
import { obtenerPlanes } from '../services/plan.service.js';

export function MembresiasAdminPage() {
  const [membresias, setMembresias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [membresiaACancelar, setMembresiaACancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [membresiaParaPagos, setMembresiaParaPagos] = useState(null);

  useEffect(() => {
    document.title = 'Control de Membresías | Gimnasio BD2';
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    setError('');
    try {
      const [respMembresias, respClientes, respPlanes] = await Promise.all([
        obtenerTodasMembresias(),
        obtenerClientes(),
        obtenerPlanes(false) // Solo planes activos para asignar
      ]);
      setMembresias(respMembresias.data || []);
      setClientes(respClientes.data || []);
      setPlanes(respPlanes.data || []);
    } catch (err) {
      setError(err?.message || 'Error al cargar la información de membresías.');
    } finally {
      setCargando(false);
    }
  }

  async function handleAsignar(datos) {
    const respuesta = await asignarMembresia(datos);
    await cargarDatos();
    return respuesta;
  }

  async function handleConfirmarCancelar() {
    if (!membresiaACancelar) return;
    setCancelando(true);
    try {
      await cancelarMembresia(membresiaACancelar.id_membresia);
      setMembresiaACancelar(null);
      await cargarDatos();
    } catch (err) {
      setError(err?.message || 'Error al cancelar la membresía.');
    } finally {
      setCancelando(false);
    }
  }

  function renderBadgeVigencia(m) {
    const vigencia = m.vigencia || m.estado_membresia;
    const dias = Number(m.dias_restantes);

    if (vigencia === 'Cancelada') {
      return (
        <span className="inline-block rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
          Cancelada
        </span>
      );
    }

    if (vigencia === 'Pendiente') {
      return (
        <span className="inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
          Pendiente (Inicia {m.fecha_inicio})
        </span>
      );
    }

    if (vigencia === 'Vencida') {
      return (
        <span className="inline-block rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
          Vencida
        </span>
      );
    }

    // Activa
    const proximaAVencer = dias >= 0 && dias <= 7;

    return (
      <div className="flex flex-col gap-1 items-start">
        <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          Activa
        </span>
        {proximaAVencer && (
          <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
            ⚠️ Vence en {dias === 0 ? 'hoy' : `${dias} ${dias === 1 ? 'día' : 'días'}`}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Administración
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Control de Membresías
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Monitorea el estado, vigencias y fechas de vencimiento de los clientes del gimnasio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalAsignarAbierto(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition"
          >
            <span>+</span> Asignar Membresía
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
              Cargando historial de membresías...
            </div>
          ) : membresias.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No hay membresías registradas aún. Asigna la primera usando el botón superior.
            </div>
          ) : (
            <table className="min-w-full border border-slate-200 text-left text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Inicio</th>
                  <th className="px-4 py-3">Vencimiento</th>
                  <th className="px-4 py-3">Pagado</th>
                  <th className="px-4 py-3">Vigencia</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {membresias.map((m) => {
                  const esVencida = m.vigencia === 'Vencida';
                  const proximaAVencer =
                    m.vigencia === 'Activa' && m.dias_restantes >= 0 && m.dias_restantes <= 7;

                  return (
                    <tr
                      key={m.id_membresia}
                      className={`border-t border-slate-200 transition ${
                        esVencida
                          ? 'bg-red-50/50 hover:bg-red-50'
                          : proximaAVencer
                          ? 'bg-amber-50/50 hover:bg-amber-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">
                          {m.nombre_usuario}
                        </div>
                        <div className="text-xs text-slate-500">
                          {m.codigo_miembro ? `Código: ${m.codigo_miembro} • ` : ''}
                          {m.correo_usuario}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{m.nombre_plan}</span>
                        <div className="text-xs text-slate-500">{m.duracion_dias} días</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{m.fecha_inicio}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {m.fecha_vencimiento}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        ${Number(m.precio_pagado).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{renderBadgeVigencia(m)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMembresiaParaPagos(m)}
                            className="rounded bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-200 transition"
                          >
                            Pagos
                          </button>
                          {m.estado_membresia === 'Activa' && (
                            <button
                              type="button"
                              onClick={() => setMembresiaACancelar(m)}
                              className="rounded bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      <ModalAsignarMembresia
        abierto={modalAsignarAbierto}
        alCerrar={() => setModalAsignarAbierto(false)}
        alGuardar={handleAsignar}
        clientes={clientes}
        planes={planes}
      />

      <ModalConfirmacion
        abierto={Boolean(membresiaACancelar)}
        alCerrar={() => setMembresiaACancelar(null)}
        alConfirmar={handleConfirmarCancelar}
        titulo="Cancelar Membresía"
        mensaje={`¿Estás seguro de que deseas cancelar la membresía activa de ${membresiaACancelar?.nombre_usuario} para el plan "${membresiaACancelar?.nombre_plan}"? Esta acción no se puede revertir.`}
        cargando={cancelando}
      />

      <ModalPagos
        abierto={Boolean(membresiaParaPagos)}
        alCerrar={() => setMembresiaParaPagos(null)}
        membresia={membresiaParaPagos}
      />
    </>
  );
}
