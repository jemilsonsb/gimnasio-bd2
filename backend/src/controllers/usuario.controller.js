import {
	cambiarEstadoUsuario,
	desbloquearUsuario,
	listarUsuarios
} from '../models/usuario.model.js';
import { crearUsuarioConExtension } from '../models/autenticacion.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

export async function obtenerUsuarios(_req, res, next) {
	try {
		const usuarios = await listarUsuarios();
		return successResponse(res, 200, 'Usuarios obtenidos correctamente', usuarios);
	} catch (error) {
		return next(error);
	}
}

export async function crearUsuarioController(req, res, next) {
	try {
		const usuario = await crearUsuarioConExtension({
			nombre: req.body.nombre.trim(),
			apellido: req.body.apellido.trim(),
			documentoIdentidad: req.body.documento_identidad.trim(),
			correo: req.body.correo.trim().toLowerCase(),
			contrasena: req.body.contrasena,
			telefono: req.body.telefono?.trim(),
			nombreRol: req.body.nombre_rol,
			codigoMiembro: req.body.codigo_miembro?.trim()
		});

		return successResponse(res, 201, 'Usuario creado correctamente', usuario);
	} catch (error) {
		if (error.code === 'ER_DUP_ENTRY') {
			return errorResponse(res, 409, 'El documento o correo ya está registrado', 'DUPLICATE_USER');
		}
		if (error.code === 'ROLE_NOT_FOUND') {
			return errorResponse(res, 400, error.message, error.code);
		}
		return next(error);
	}
}

export async function actualizarEstadoUsuario(req, res, next) {
	const estado = req.body?.estado;

	if (!['Activo', 'Inactivo'].includes(estado)) {
		return errorResponse(
			res,
			400,
			"El estado debe ser 'Activo' o 'Inactivo'",
			'VALIDATION_ERROR'
		);
	}

	try {
		const filasActualizadas = await cambiarEstadoUsuario(req.params.id, estado);

		if (filasActualizadas === 0) {
			return errorResponse(res, 404, 'Usuario no encontrado', 'USER_NOT_FOUND');
		}

		return successResponse(res, 200, 'Estado del usuario actualizado correctamente', {
			id_usuario: Number(req.params.id),
			estado
		});
	} catch (error) {
		return next(error);
	}
}

export async function desbloquearUsuarioController(req, res, next) {
	try {
		const filasActualizadas = await desbloquearUsuario(req.params.id);

		if (filasActualizadas === 0) {
			return errorResponse(res, 404, 'Usuario no encontrado', 'USER_NOT_FOUND');
		}

		return successResponse(res, 200, 'Usuario desbloqueado correctamente', {
			id_usuario: Number(req.params.id)
		});
	} catch (error) {
		return next(error);
	}
}
