import { Router } from 'express';
import {
  crearAsistencia,
  obtenerAsistenciasCliente,
  obtenerMisAsistencias
} from '../controllers/asistencia.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';
import { validarCamposRequeridos } from '../middlewares/validation.middleware.js';

const router = Router();

router.use(autenticarUsuario);

// Registrar el ingreso de un cliente (solo Administrador)
router.post(
  '/',
  autorizarRoles('Administrador'),
  validarCamposRequeridos(['fk_cliente']),
  crearAsistencia
);

// Días asistidos del mes e ingresos restantes del cliente autenticado
router.get(
  '/mis-asistencias',
  autorizarRoles('Cliente'),
  obtenerMisAsistencias
);

// Asistencias de un cliente específico (solo Administrador)
router.get(
  '/cliente/:id_cliente',
  autorizarRoles('Administrador'),
  obtenerAsistenciasCliente
);

export default router;
