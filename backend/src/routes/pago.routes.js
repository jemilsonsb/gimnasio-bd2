import { Router } from 'express';
import {
  crearPago,
  obtenerPagosPorMembresia,
  obtenerTodosLosPagos
} from '../controllers/pago.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';
import { validarCamposRequeridos } from '../middlewares/validation.middleware.js';

const router = Router();

// Registrar un pago (solo Administrador)
router.post(
  '/',
  autenticarUsuario,
  autorizarRoles('Administrador'),
  validarCamposRequeridos(['fk_membresia', 'monto', 'metodo_pago']),
  crearPago
);

// Listar todos los pagos enriquecidos (solo Administrador)
router.get(
  '/',
  autenticarUsuario,
  autorizarRoles('Administrador'),
  obtenerTodosLosPagos
);

// Historial de pagos de una membresía específica (Administrador o el Cliente dueño)
router.get(
  '/membresia/:id_membresia',
  autenticarUsuario,
  obtenerPagosPorMembresia
);

export default router;
