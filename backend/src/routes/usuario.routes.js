import { Router } from 'express';
import {
	actualizarEstadoUsuario,
	obtenerUsuarios
} from '../controllers/usuario.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';

const usuarioRoutes = Router();

usuarioRoutes.use(autenticarUsuario, autorizarRoles('Administrador'));
usuarioRoutes.get('/', obtenerUsuarios);
usuarioRoutes.patch('/:id/estado', actualizarEstadoUsuario);

export default usuarioRoutes;
