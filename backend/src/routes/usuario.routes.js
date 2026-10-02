import { Router } from 'express';
import {
	actualizarEstadoUsuario,
	crearUsuarioController,
	obtenerUsuarios
} from '../controllers/usuario.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';
import { validarCamposRequeridos } from '../middlewares/validation.middleware.js';

const usuarioRoutes = Router();

usuarioRoutes.use(autenticarUsuario, autorizarRoles('Administrador'));
usuarioRoutes.get('/', obtenerUsuarios);
usuarioRoutes.post(
	'/',
	validarCamposRequeridos(['nombre', 'apellido', 'documento_identidad', 'correo', 'contrasena', 'nombre_rol']),
	crearUsuarioController
);
usuarioRoutes.patch('/:id/estado', actualizarEstadoUsuario);

export default usuarioRoutes;
