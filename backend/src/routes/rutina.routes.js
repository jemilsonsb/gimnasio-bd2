import { Router } from 'express';
import {
  agregarDetalleController,
  crearRutinaController,
  obtenerDetallesController,
  obtenerRutinasPorCliente,
  obtenerTodasRutinas
} from '../controllers/rutina.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';
import { validarCamposRequeridos } from '../middlewares/validation.middleware.js';

const router = Router();

router.get(
  '/',
  autenticarUsuario,
  autorizarRoles('Administrador', 'Entrenador'),
  obtenerTodasRutinas
);

router.get(
  '/cliente/:id_usuario',
  autenticarUsuario,
  obtenerRutinasPorCliente
);

router.post(
  '/',
  autenticarUsuario,
  autorizarRoles('Administrador', 'Entrenador'),
  validarCamposRequeridos(['fk_cliente', 'nombre_rutina']),
  crearRutinaController
);

router.post(
  '/:id/detalles',
  autenticarUsuario,
  autorizarRoles('Administrador', 'Entrenador'),
  validarCamposRequeridos(['fk_ejercicio', 'dia_semana', 'series', 'repeticiones']),
  agregarDetalleController
);

router.get(
  '/:id/detalles',
  autenticarUsuario,
  obtenerDetallesController
);

export default router;
