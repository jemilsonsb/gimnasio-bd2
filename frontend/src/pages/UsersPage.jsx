import { useEffect, useState } from 'react';
import {
  actualizarEstadoUsuario,
  obtenerUsuarios
} from '../services/usuario.service.js';

export function UsersPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Administración de usuarios';

    async function cargarUsuarios() {
      try {
        const respuesta = await obtenerUsuarios();
        setUsuarios(respuesta.data);
      } catch (respuestaError) {
        setError(respuestaError?.message || 'No se pudieron cargar los usuarios.');
      } finally {
        setCargando(false);
      }
    }

    cargarUsuarios();
  }, []);

  async function cambiarEstado(usuario) {
    const nuevoEstado = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo';

    try {
      await actualizarEstadoUsuario(usuario.id_usuario, nuevoEstado);
      setUsuarios((prev) => prev.map((actual) => (
        actual.id_usuario === usuario.id_usuario
          ? { ...actual, estado: nuevoEstado }
          : actual
      )));
    } catch (respuestaError) {
      setError(respuestaError?.message || 'No se pudo actualizar el estado.');
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Administración
            </p>
            <h1 className="text-3xl font-bold text-slate-800">Usuarios</h1>
          </div>
        </div>

        <div className="overflow-x-auto">
          {cargando && <p className="mb-4 text-sm text-slate-600">Cargando usuarios...</p>}
          {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
          <table className="min-w-full border border-slate-200 text-left text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id_usuario} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{usuario.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{usuario.correo}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                      {usuario.nombre_rol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        usuario.estado === 'Activo'
                          ? 'rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700'
                          : 'rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700'
                      }
                    >
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => cambiarEstado(usuario)}
                      className={
                        usuario.estado === 'Activo'
                          ? 'rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700'
                          : 'rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700'
                      }
                    >
                      {usuario.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
