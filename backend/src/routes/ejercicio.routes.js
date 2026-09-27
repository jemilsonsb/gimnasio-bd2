import { Router } from 'express';
import {
  crearEjercicioController,
  obtenerEjercicios
} from '../controllers/ejercicio.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';
import { validarCamposRequeridos } from '../middlewares/validation.middleware.js';

const router = Router();

router.get('/', autenticarUsuario, obtenerEjercicios);

router.post(
  '/',
  autenticarUsuario,
  autorizarRoles('Administrador', 'Entrenador'),
  validarCamposRequeridos(['nombre_ejercicio', 'grupo_muscular']),
  crearEjercicioController
);

export default router;
