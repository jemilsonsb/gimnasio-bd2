import { useEffect, useState } from 'react';

const usuariosMock = [
  {
    id_usuario: 1,
    nombre: 'Ana García',
    correo: 'ana@correo.com',
    nombre_rol: 'Administrador',
    estado: 'Activo'
  },
  {
    id_usuario: 2,
    nombre: 'Luis Pérez',
    correo: 'luis@correo.com',
    nombre_rol: 'Entrenador',
    estado: 'Activo'
  },
  {
    id_usuario: 3,
    nombre: 'María López',
    correo: 'maria@correo.com',
    nombre_rol: 'Cliente',
    estado: 'Inactivo'
  }
];

export function UsersPage() {
  const [usuarios, setUsuarios] = useState(usuariosMock);

  useEffect(() => {
    document.title = 'Administración de usuarios';
  }, []);

  const cambiarEstado = (idUsuario) => {
    setUsuarios((prev) =>
      prev.map((usuario) => {
        if (usuario.id_usuario !== idUsuario) return usuario;

        const nuevoEstado = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo';
        return { ...usuario, estado: nuevoEstado };
      })
    );
  };

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
                      onClick={() => cambiarEstado(usuario.id_usuario)}
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
