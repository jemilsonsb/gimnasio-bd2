import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

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

  const claseEnlace = (ruta, extra = '') =>
    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${extra} ${
      esActivo(ruta)
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const claseRol =
    rol === 'Administrador'
      ? 'bg-purple-100 text-purple-800'
      : rol === 'Entrenador'
      ? 'bg-sky-100 text-sky-800'
      : 'bg-emerald-100 text-emerald-800';

  const enlaces = [{ ruta: '/dashboard', texto: 'Dashboard' }];

  if (rol === 'Administrador' || rol === 'Entrenador') {
    if (rol === 'Administrador') {
      enlaces.push(
        { ruta: '/usuarios', texto: 'Usuarios' },
        { ruta: '/admin/planes', texto: 'Planes' },
        { ruta: '/admin/membresias', texto: 'Membresías' },
        { ruta: '/admin/asistencias', texto: 'Asistencias' }
      );
    }
    enlaces.push(
      { ruta: '/admin/ejercicios', texto: 'Ejercicios' },
      { ruta: '/admin/rutinas', texto: 'Rutinas' },
      { ruta: '/admin/clases', texto: 'Clases' },
      { ruta: '/admin/reportes', texto: 'Reportes' }
    );
  }

  if (rol === 'Cliente') {
    enlaces.push(
      { ruta: '/mi-membresia', texto: 'Mi Membresía' },
      { ruta: '/mi-rutina', texto: 'Mi Rutina' },
      { ruta: '/mi-ficha-tecnica', texto: 'Mi Ficha Técnica' },
      { ruta: '/reservar-clase', texto: 'Reservar Clase' },
      { ruta: '/mis-reservas', texto: 'Mis Reservas' }
    );
  }

  return (
    <header className="bg-slate-800 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 font-black text-white shadow">
              G
            </span>
            <span className="text-lg font-bold tracking-tight text-white">Gimnasio</span>
          </Link>

          <nav className="hidden flex-wrap items-center gap-1 sm:gap-2 xl:flex">
            {enlaces.map((enlace) => (
              <Link key={enlace.ruta} to={enlace.ruta} className={claseEnlace(enlace.ruta)}>
                {enlace.texto}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 xl:flex">
          {usuario && (
            <div className="text-right">
              <p className="text-sm font-semibold leading-tight text-white">
                {usuario.nombre} {usuario.apellido}
              </p>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${claseRol}`}>
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

        <button
          type="button"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-600 bg-slate-700 text-slate-200 transition hover:bg-slate-600 hover:text-white xl:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
            {menuAbierto ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {menuAbierto && (
        <div id="menu-movil" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-700 xl:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {enlaces.map((enlace) => (
              <Link
                key={enlace.ruta}
                to={enlace.ruta}
                onClick={() => setMenuAbierto(false)}
                className={claseEnlace(enlace.ruta, 'block')}
              >
                {enlace.texto}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 border-t border-slate-700 px-4 py-3">
            {usuario && (
              <div>
                <p className="text-sm font-semibold leading-tight text-white">
                  {usuario.nombre} {usuario.apellido}
                </p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${claseRol}`}>
                  {rol || 'Usuario'}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={cerrarSesion}
              className="rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-600 hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
