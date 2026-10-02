import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerDashboard } from '../services/dashboard.service.js';

const ACCESOS_RAPIDOS = {
  Administrador: [
    { to: '/usuarios', etiqueta: 'Usuarios', icono: '👥' },
    { to: '/admin/planes', etiqueta: 'Planes', icono: '📋' },
    { to: '/admin/membresias', etiqueta: 'Membresías', icono: '🎫' },
    { to: '/admin/clases', etiqueta: 'Clases', icono: '🏋️' },
    { to: '/admin/reportes', etiqueta: 'Reportes', icono: '📊' }
  ],
  Entrenador: [
    { to: '/admin/clases', etiqueta: 'Clases', icono: '🏋️' },
    { to: '/admin/rutinas', etiqueta: 'Rutinas', icono: '📝' },
    { to: '/admin/ejercicios', etiqueta: 'Ejercicios', icono: '💪' },
    { to: '/admin/reportes', etiqueta: 'Reportes', icono: '📊' }
  ],
  Cliente: [
    { to: '/mi-membresia', etiqueta: 'Mi Membresía', icono: '🎫' },
    { to: '/mi-rutina', etiqueta: 'Mi Rutina', icono: '📝' },
    { to: '/reservar-clase', etiqueta: 'Reservar Clase', icono: '📅' },
    { to: '/mis-reservas', etiqueta: 'Mis Reservas', icono: '✅' },
    { to: '/mi-ficha-tecnica', etiqueta: 'Mi Ficha Técnica', icono: '📈' }
  ]
};

function TarjetaNumero({ etiqueta, valor, acento = 'text-slate-800' }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md">
      <p className="text-sm text-slate-500">{etiqueta}</p>
      <p className={`mt-1 text-3xl font-bold ${acento}`}>{valor}</p>
    </div>
  );
}

function formatearFechaHora(fecha, horaInicio, horaFin) {
  const fechaTexto = fecha ? new Date(`${fecha}T00:00:00`).toLocaleDateString() : 'N/A';
  if (!horaInicio) return fechaTexto;
  return `${fechaTexto} · ${horaInicio.slice(0, 5)}${horaFin ? ` - ${horaFin.slice(0, 5)}` : ''}`;
}

function SeccionAdministrador({ datos }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaNumero etiqueta="Clientes activos" valor={datos.clientes_activos} />
        <TarjetaNumero etiqueta="Membresías activas" valor={datos.membresias_activas} />
        <TarjetaNumero
          etiqueta="Ingresos del mes"
          valor={`$${Number(datos.ingresos_mes).toFixed(2)}`}
          acento="text-emerald-600"
        />
        <TarjetaNumero
          etiqueta="Clases programadas hoy"
          valor={datos.clases_programadas_hoy.length}
          acento="text-sky-600"
        />
      </div>

      {datos.membresias_por_vencer.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <span className="font-semibold">
            {datos.membresias_por_vencer.length} membresía(s) vencen en los próximos 7 días.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TablaCompacta
          titulo="Membresías por vencer (7 días)"
          columnas={['Cliente', 'Plan', 'Vence']}
          filas={datos.membresias_por_vencer.map((m) => [
            m.nombre_cliente,
            m.nombre_plan,
            m.fecha_vencimiento
          ])}
          vacio="No hay membresías por vencer en los próximos 7 días."
        />
        <TablaCompacta
          titulo="Últimos 5 pagos"
          columnas={['Cliente', 'Monto', 'Estado']}
          filas={datos.ultimos_pagos.map((p) => [
            p.nombre_cliente,
            `$${Number(p.monto).toFixed(2)}`,
            p.estado_pago
          ])}
          vacio="Aún no hay pagos registrados."
        />
        <TablaCompacta
          titulo="Clases de hoy"
          columnas={['Clase', 'Horario', 'Cupos usados']}
          filas={datos.clases_programadas_hoy.map((c) => [
            c.nombre_clase,
            formatearFechaHora(c.fecha, c.hora_inicio, c.hora_fin),
            `${c.cupos_usados}/${c.capacidad_maxima}`
          ])}
          vacio="No hay clases programadas para hoy."
        />
        <TablaCompacta
          titulo="Próximas clases con cupo"
          columnas={['Clase', 'Horario', 'Cupos disponibles']}
          filas={datos.proximas_clases.map((c) => [
            c.nombre_clase,
            formatearFechaHora(c.fecha, c.hora_inicio, c.hora_fin),
            c.cupos_disponibles
          ])}
          vacio="No hay próximas clases con cupos disponibles."
        />
      </div>
    </>
  );
}

function SeccionEntrenador({ datos }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TarjetaNumero
          etiqueta="Clases próximos 7 días"
          valor={datos.clases_proximos_7_dias.length}
          acento="text-sky-600"
        />
        <TarjetaNumero etiqueta="Rutinas activas" valor={datos.rutinas_activas} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TablaCompacta
          titulo="Mis clases (próximos 7 días)"
          columnas={['Clase', 'Horario', 'Inscritos']}
          filas={datos.clases_proximos_7_dias.map((c) => [
            c.nombre_clase,
            formatearFechaHora(c.fecha, c.hora_inicio, c.hora_fin),
            `${c.cupos_usados}/${c.capacidad_maxima}`
          ])}
          vacio="No tienes clases programadas en los próximos 7 días."
        />
        <TablaCompacta
          titulo="Mis rutinas recientes"
          columnas={['Cliente', 'Rutina', 'Estado']}
          filas={datos.rutinas_recientes.map((r) => [r.nombre_cliente, r.nombre_rutina, r.estado])}
          vacio="Aún no has asignado rutinas."
        />
      </div>
    </>
  );
}

function SeccionCliente({ datos }) {
  const membresia = datos.membresia_vigente;
  const proximaReserva = datos.proxima_reserva;
  const rutina = datos.rutina_activa;
  const diasRestantes = membresia?.dias_restantes;
  const proximaAVencer = membresia && diasRestantes !== null && diasRestantes <= 7 && diasRestantes >= 0;

  return (
    <>
      {proximaAVencer && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <span className="font-semibold">
            Tu membresía vence en {diasRestantes} día(s) ({membresia.fecha_vencimiento}).
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-md">
          <h3 className="text-sm font-semibold text-slate-500">Mi Membresía</h3>
          {membresia ? (
            <div className="mt-2">
              <p className="text-xl font-bold text-slate-800">{membresia.nombre_plan}</p>
              <p className="mt-1 text-sm text-slate-600">Vence: {membresia.fecha_vencimiento}</p>
              <p className="text-sm text-slate-600">
                {diasRestantes >= 0 ? `${diasRestantes} días restantes` : 'Vencida'}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No tienes una membresía activa.</p>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-md">
          <h3 className="text-sm font-semibold text-slate-500">Próxima Clase Reservada</h3>
          {proximaReserva ? (
            <div className="mt-2">
              <p className="text-xl font-bold text-slate-800">{proximaReserva.nombre_clase}</p>
              <p className="mt-1 text-sm text-slate-600">
                {formatearFechaHora(proximaReserva.fecha_clase, proximaReserva.hora_inicio, proximaReserva.hora_fin)}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No tienes reservas confirmadas próximas.</p>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-md">
          <h3 className="text-sm font-semibold text-slate-500">Mi Rutina Activa</h3>
          {rutina ? (
            <div className="mt-2">
              <p className="text-xl font-bold text-slate-800">{rutina.nombre_rutina}</p>
              <p className="mt-1 text-sm text-slate-600">{rutina.objetivo || 'Sin objetivo definido'}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No tienes una rutina activa.</p>
          )}
        </div>
      </div>
    </>
  );
}

function TablaCompacta({ titulo, columnas, filas, vacio }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{titulo}</h3>
      {filas.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">{vacio}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-slate-200 text-left text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                {columnas.map((columna) => (
                  <th key={columna} className="px-3 py-2">
                    {columna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, indice) => (
                <tr key={indice} className="border-t border-slate-200 hover:bg-slate-50">
                  {fila.map((celda, i) => (
                    <td key={i} className="px-3 py-2 text-slate-600">
                      {celda}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [perfilNoEncontrado, setPerfilNoEncontrado] = useState(false);

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  useEffect(() => {
    document.title = 'Panel Principal | Gimnasio BD2';
    cargarDashboard();
  }, []);

  async function cargarDashboard() {
    setCargando(true);
    setError('');
    setPerfilNoEncontrado(false);

    try {
      const respuesta = await obtenerDashboard();
      setDatos(respuesta.data);
    } catch (err) {
      if (err?.error?.code === 'CLIENT_PROFILE_NOT_FOUND' || err?.error?.code === 'ENTRENADOR_PROFILE_NOT_FOUND') {
        setPerfilNoEncontrado(true);
      } else {
        setError(err?.message || 'No se pudo obtener la información del panel.');
      }
    } finally {
      setCargando(false);
    }
  }

  const accesos = ACCESOS_RAPIDOS[usuario?.nombre_rol] || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
          Hola, {usuario?.nombre || 'bienvenido'} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-600">Panel principal del gimnasio.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {accesos.map((acceso) => (
          <Link
            key={acceso.to}
            to={acceso.to}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-5 text-center shadow-md transition hover:bg-slate-50"
          >
            <span className="text-3xl">{acceso.icono}</span>
            <span className="text-sm font-semibold text-slate-700">{acceso.etiqueta}</span>
          </Link>
        ))}
      </div>

      {cargando && (
        <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 shadow-md">
          Cargando información del panel...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {perfilNoEncontrado && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <span className="text-4xl">⚠️</span>
          <h2 className="mt-3 text-lg font-bold text-amber-900">Perfil no configurado</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-amber-800">
            Tu cuenta de usuario aún no tiene un perfil asignado en el sistema. Por favor contacta al
            administrador.
          </p>
        </div>
      )}

      {!cargando && !error && !perfilNoEncontrado && datos && (
        <>
          {datos.rol === 'Administrador' && <SeccionAdministrador datos={datos} />}
          {datos.rol === 'Entrenador' && <SeccionEntrenador datos={datos} />}
          {datos.rol === 'Cliente' && <SeccionCliente datos={datos} />}
        </>
      )}
    </div>
  );
}
