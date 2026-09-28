import { Router } from 'express';
import { crearClaseController, obtenerClasesController } from '../controllers/clase.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';
import { validarCamposRequeridos } from '../middlewares/validation.middleware.js';

const router = Router();

router.get('/', autenticarUsuario, obtenerClasesController);

router.post(
  '/',
  autenticarUsuario,
  autorizarRoles('Administrador', 'Entrenador'),
  validarCamposRequeridos(['nombre_clase', 'capacidad_maxima']),
  crearClaseController
);

export default router;
