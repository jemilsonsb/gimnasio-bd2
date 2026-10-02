import { Link, useLocation, useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const rol = usuario?.nombre_rol;

  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  }

  function esActivo(ruta) {
    return location.pathname === ruta;
  }

  const claseEnlace = (ruta) =>
    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      esActivo(ruta)
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <header className="bg-slate-800 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 font-black text-white shadow">
              G
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              Gimnasio <span className="text-sky-400">BD2</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
            <Link to="/dashboard" className={claseEnlace('/dashboard')}>
              Dashboard
            </Link>

            {(rol === 'Administrador' || rol === 'Entrenador') && (
              <>
                {rol === 'Administrador' && (
                  <>
                    <Link to="/usuarios" className={claseEnlace('/usuarios')}>
                      Usuarios
                    </Link>
                    <Link to="/admin/planes" className={claseEnlace('/admin/planes')}>
                      Planes
                    </Link>
                    <Link to="/admin/membresias" className={claseEnlace('/admin/membresias')}>
                      Membresías
                    </Link>
                  </>
                )}
                <Link to="/admin/ejercicios" className={claseEnlace('/admin/ejercicios')}>
                  Ejercicios
                </Link>
                <Link to="/admin/rutinas" className={claseEnlace('/admin/rutinas')}>
                  Rutinas
                </Link>
                <Link to="/admin/clases" className={claseEnlace('/admin/clases')}>
                  Clases
                </Link>
                <Link to="/admin/reportes" className={claseEnlace('/admin/reportes')}>
                  Reportes
                </Link>
              </>
            )}

            {rol === 'Cliente' && (
              <>
                <Link to="/mi-membresia" className={claseEnlace('/mi-membresia')}>
                  Mi Membresía
                </Link>
                <Link to="/mi-rutina" className={claseEnlace('/mi-rutina')}>
                  Mi Rutina
                </Link>
                <Link to="/mi-ficha-tecnica" className={claseEnlace('/mi-ficha-tecnica')}>
                  Mi Ficha Técnica
                </Link>
                <Link to="/reservar-clase" className={claseEnlace('/reservar-clase')}>
                  Reservar Clase
                </Link>
                <Link to="/mis-reservas" className={claseEnlace('/mis-reservas')}>
                  Mis Reservas
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {usuario && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-white">
                {usuario.nombre} {usuario.apellido}
              </p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  rol === 'Administrador'
                    ? 'bg-purple-100 text-purple-800'
                    : rol === 'Entrenador'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {rol || 'Usuario'}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-md border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-600 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
