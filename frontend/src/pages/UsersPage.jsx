import { useEffect, useState } from 'react';
import {
  actualizarEstadoUsuario,
  crearUsuario,
  desbloquearUsuario,
  obtenerUsuarios
} from '../services/usuario.service.js';
import { ModalCrearUsuario } from '../components/usuario/ModalCrearUsuario.jsx';
import { ModalConfirmacion } from '../components/membresia/ModalConfirmacion.jsx';

export function UsersPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [usuarioADesbloquear, setUsuarioADesbloquear] = useState(null);
  const [desbloqueando, setDesbloqueando] = useState(false);

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

  useEffect(() => {
    document.title = 'Administración de usuarios';
    cargarUsuarios();
  }, []);

  async function crearNuevoUsuario(datos) {
    await crearUsuario(datos);
    await cargarUsuarios();
  }

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

  async function confirmarDesbloqueo() {
    if (!usuarioADesbloquear) return;

    setDesbloqueando(true);
    try {
      await desbloquearUsuario(usuarioADesbloquear.id_usuario);
      setUsuarios((prev) => prev.map((actual) => (
        actual.id_usuario === usuarioADesbloquear.id_usuario
          ? { ...actual, bloqueado: false }
          : actual
      )));
      setUsuarioADesbloquear(null);
    } catch (respuestaError) {
      setError(respuestaError?.message || 'No se pudo desbloquear el usuario.');
    } finally {
      setDesbloqueando(false);
    }
  }

  return (
    <>
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Administración
            </p>
            <h1 className="text-3xl font-bold text-slate-800">Usuarios</h1>
          </div>
          <button
            type="button"
            onClick={() => setModalCrearAbierto(true)}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition"
          >
            Nuevo usuario
          </button>
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
                <th className="px-4 py-3">Bloqueado</th>
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
                  <td className="px-4 py-3">
                    {usuario.bloqueado ? (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                        Bloqueado
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
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
                      {usuario.bloqueado && (
                        <button
                          type="button"
                          onClick={() => setUsuarioADesbloquear(usuario)}
                          className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                        >
                          Desbloquear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </main>

      <ModalCrearUsuario
        abierto={modalCrearAbierto}
        alCerrar={() => setModalCrearAbierto(false)}
        alGuardar={crearNuevoUsuario}
      />

      <ModalConfirmacion
        abierto={Boolean(usuarioADesbloquear)}
        alCerrar={() => setUsuarioADesbloquear(null)}
        alConfirmar={confirmarDesbloqueo}
        titulo="Desbloquear usuario"
        mensaje={`¿Estás seguro de que deseas desbloquear a "${usuarioADesbloquear?.nombre}"? Podrá volver a iniciar sesión de inmediato.`}
        cargando={desbloqueando}
        textoConfirmar="Sí, desbloquear"
        textoCargando="Desbloqueando..."
      />
    </>
  );
}
