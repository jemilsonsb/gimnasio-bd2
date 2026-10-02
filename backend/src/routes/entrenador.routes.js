import { Router } from 'express';
import { obtenerEntrenadores } from '../controllers/entrenador.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';

const entrenadorRoutes = Router();

entrenadorRoutes.use(autenticarUsuario, autorizarRoles('Administrador', 'Entrenador'));

entrenadorRoutes.get('/', obtenerEntrenadores);

export default entrenadorRoutes;
