import { verificarToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/api-response.js';

export function autenticarUsuario(req, res, next) {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(' ') || [];

  if (scheme !== 'Bearer' || !token) {
    return errorResponse(res, 401, 'Se requiere un token Bearer', 'UNAUTHORIZED');
  }

  try {
    req.usuarioAutenticado = verificarToken(token);
    return next();
  } catch {
    return errorResponse(res, 401, 'El token no es válido o ha expirado', 'INVALID_TOKEN');
  }
}
