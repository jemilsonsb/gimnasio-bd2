import { Router } from 'express';
import {
  crearOActualizarFicha,
  obtenerFichaTecnica
} from '../controllers/ficha_tecnica.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';
import { validarCamposRequeridos } from '../middlewares/validation.middleware.js';

const router = Router();

router.get(
  '/:id_usuario',
  autenticarUsuario,
  obtenerFichaTecnica
);

router.post(
  '/',
  autenticarUsuario,
  autorizarRoles('Administrador', 'Entrenador'),
  validarCamposRequeridos(['fk_cliente', 'peso_kg', 'estatura']),
  crearOActualizarFicha
);

export default router;
