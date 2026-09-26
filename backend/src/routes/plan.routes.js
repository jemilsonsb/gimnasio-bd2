import { Router } from 'express';
import {
  crearNuevoPlan,
  modificarPlan,
  obtenerPlanPorId,
  obtenerPlanes
} from '../controllers/plan.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';
import { validarCamposRequeridos } from '../middlewares/validation.middleware.js';

const router = Router();

// Consultar catálogo de planes (público o para usuarios autenticados)
router.get('/', obtenerPlanes);
router.get('/:id', obtenerPlanPorId);

// Creación y edición de planes (exclusivo para Administradores)
router.post(
  '/',
  autenticarUsuario,
  autorizarRoles('Administrador'),
  validarCamposRequeridos(['nombre_plan', 'duracion_dias', 'precio']),
  crearNuevoPlan
);

router.put(
  '/:id',
  autenticarUsuario,
  autorizarRoles('Administrador'),
  modificarPlan
);

export default router;
