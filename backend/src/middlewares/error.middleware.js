import { errorResponse } from '../utils/api-response.js';

export function errorMiddleware(error, _req, res, _next) {
  console.error(error);
  return errorResponse(res, 500, 'Error interno del servidor', 'INTERNAL_SERVER_ERROR');
}
