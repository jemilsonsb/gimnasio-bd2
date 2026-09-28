import { Router } from 'express';
import {
  cancelarReservaController,
  crearReservaController,
  obtenerMisReservasController
} from '../controllers/reserva_clase.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';
import { validarCamposRequeridos } from '../middlewares/validation.middleware.js';

const router = Router();

router.post(
  '/',
  autenticarUsuario,
  autorizarRoles('Cliente'),
  validarCamposRequeridos(['fk_programacion']),
  crearReservaController
);

router.get(
  '/mis-reservas',
  autenticarUsuario,
  autorizarRoles('Cliente'),
  obtenerMisReservasController
);

router.patch(
  '/:id/cancelar',
  autenticarUsuario,
  autorizarRoles('Cliente', 'Administrador'),
  cancelarReservaController
);

export default router;
