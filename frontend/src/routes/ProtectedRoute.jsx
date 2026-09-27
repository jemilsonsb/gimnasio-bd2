import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, rolPermitido, rolesPermitidos }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  if (rolPermitido && usuario?.nombre_rol !== rolPermitido) {
    return <Navigate to="/dashboard" replace />;
  }

  if (rolesPermitidos && Array.isArray(rolesPermitidos) && !rolesPermitidos.includes(usuario?.nombre_rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}