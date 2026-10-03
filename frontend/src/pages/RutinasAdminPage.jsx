import { useEffect, useState } from 'react';
import { ModalCrearRutina } from '../components/rutina/ModalCrearRutina.jsx';
import { ModalDetallesRutina } from '../components/rutina/ModalDetallesRutina.jsx';
import { ModalFichaTecnica } from '../components/rutina/ModalFichaTecnica.jsx';
import { obtenerClientes } from '../services/cliente.service.js';
import { obtenerEjercicios } from '../services/ejercicio.service.js';
import { obtenerEntrenadores } from '../services/entrenador.service.js';
import { obtenerTodasRutinas } from '../services/rutina.service.js';

export function RutinasAdminPage() {
  const [rutinas, setRutinas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [rutinaParaDetalles, setRutinaParaDetalles] = useState(null);
  const [clienteParaFicha, setClienteParaFicha] = useState(null);

  useEffect(() => {
    document.title = 'Gestión de Rutinas | Gimnasio';
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    setError('');
    try {
      const [respRutinas, respClientes, respEjercicios, respEntrenadores] = await Promise.all([
        obtenerTodasRutinas(),
        obtenerClientes(),
        obtenerEjercicios(),
        obtenerEntrenadores().catch(() => ({ data: [] }))
      ]);

      setRutinas(respRutinas?.data || []);
      setClientes(respClientes?.data || []);
      setEjercicios(respEjercicios?.data || []);
      setEntrenadores(respEntrenadores?.data || []);
    } catch (err) {
      setError(err?.message || 'Error al cargar los datos de rutinas.');
    } finally {
      setCargando(false);
    }
  }

  const rutinasFiltradas = rutinas.filter((r) => {
    const texto = `${r.nombre_rutina} ${r.nombre_cliente} ${r.nombre_entrenador} ${r.codigo_miembro || ''}`.toLowerCase();
    const coincideTexto = texto.includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos' || r.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Gestión de Rutinas
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Diseña programas de entrenamiento, asigna ejercicios por día y controla la ficha técnica de cada cliente.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalCrearAbierto(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 transition"
          >
            <span>➕</span>
            <span>Asignar Rutina</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por cliente, rutina o entrenador..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Estado:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition bg-white"
            >
              <option value="Todos">Todos</option>
              <option value="Activa">Activa</option>
              <option value="Pausada">Pausada</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Tabla de Rutinas */}
        <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">
              Listado de Rutinas Registradas
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {rutinasFiltradas.length} rutina{rutinasFiltradas.length !== 1 ? 's' : ''}
            </span>
          </div>

          {cargando ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Cargando rutinas...
            </div>
          ) : rutinasFiltradas.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No se encontraron rutinas registradas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-200 text-left text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Rutina</th>
                    <th className="px-4 py-3">Entrenador</th>
                    <th className="px-4 py-3">Objetivo</th>
                    <th className="px-4 py-3">Fechas</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rutinasFiltradas.map((r) => (
                    <tr key={r.id_rutina} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{r.nombre_cliente}</p>
                        <p className="text-xs text-slate-500">{r.codigo_miembro || r.correo_cliente}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {r.nombre_rutina}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.nombre_entrenador}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                        {r.objetivo || 'Sin objetivo especificado'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div><span className="text-slate-400">Inicio:</span> {r.fecha_inicio || 'N/A'}</div>
                        {r.fecha_fin && <div><span className="text-slate-400">Fin:</span> {r.fecha_fin}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                            r.estado === 'Activa'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.estado === 'Pausada'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {r.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setRutinaParaDetalles(r)}
                            className="rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-700 border border-sky-200 hover:bg-sky-100 transition"
                          >
                            💪 Ejercicios
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setClienteParaFicha({
                                id_cliente: r.fk_cliente,
                                id_usuario: r.id_usuario_cliente,
                                nombre: r.nombre_cliente,
                                apellido: '',
                                codigo_miembro: r.codigo_miembro
                              });
                            }}
                            className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-700 border border-teal-200 hover:bg-teal-100 transition"
                          >
                            🩺 Ficha
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ModalCrearRutina
        abierto={modalCrearAbierto}
        alCerrar={() => setModalCrearAbierto(false)}
        alGuardar={cargarDatos}
        clientes={clientes}
        entrenadores={entrenadores}
      />

      <ModalDetallesRutina
        abierto={Boolean(rutinaParaDetalles)}
        alCerrar={() => setRutinaParaDetalles(null)}
        rutina={rutinaParaDetalles}
        ejercicios={ejercicios}
      />

      <ModalFichaTecnica
        abierto={Boolean(clienteParaFicha)}
        alCerrar={() => setClienteParaFicha(null)}
        cliente={clienteParaFicha}
      />
    </>
  );
}
