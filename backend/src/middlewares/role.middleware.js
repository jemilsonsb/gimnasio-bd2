import { errorResponse } from '../utils/api-response.js';

export function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    const rol = req.usuarioAutenticado?.nombre_rol;

    if (!rol || !rolesPermitidos.includes(rol)) {
      return errorResponse(res, 403, 'No tienes permisos para esta operación', 'FORBIDDEN');
    }

    return next();
  };
}
