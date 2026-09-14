import { Router } from 'express';
import {
  iniciarSesion,
  obtenerSesion,
  registrar
} from '../controllers/autenticacion.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';
import { validarCamposRequeridos } from '../middlewares/validation.middleware.js';

const router = Router();

router.post(
  '/registro',
  validarCamposRequeridos(['nombre', 'apellido', 'documento_identidad', 'correo', 'contrasena']),
  registrar
);

router.post(
  '/login',
  validarCamposRequeridos(['correo', 'contrasena']),
  iniciarSesion
);

router.get('/sesion', autenticarUsuario, obtenerSesion);

router.get('/sesion/cliente', autenticarUsuario, autorizarRoles('Cliente'), obtenerSesion);

export default router;
