import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, rolPermitido }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (rolPermitido) {
    const usuarioGuardado = localStorage.getItem('usuario');
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    if (usuario?.nombre_rol !== rolPermitido) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}