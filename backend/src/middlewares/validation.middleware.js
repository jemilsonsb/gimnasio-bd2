import { errorResponse } from '../utils/api-response.js';

export function validarCamposRequeridos(campos) {
  return (req, res, next) => {
    const faltantes = campos.filter((campo) => {
      const valor = req.body?.[campo];
      return valor === undefined || valor === null || String(valor).trim() === '';
    });

    if (faltantes.length > 0) {
      return errorResponse(res, 400, 'Faltan campos obligatorios', 'VALIDATION_ERROR',
        faltantes.map((campo) => ({ field: campo, message: 'El campo es obligatorio' })));
    }

    return next();
  };
}
