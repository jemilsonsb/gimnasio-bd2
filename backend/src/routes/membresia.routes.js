import { Router } from 'express';
import {
  cancelarMembresiaController,
  crearMembresia,
  editarMembresiaController,
  obtenerHistorialCliente,
  obtenerHistorialUsuario,
  obtenerTodasMembresias
} from '../controllers/membresia.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';
import { validarCamposRequeridos } from '../middlewares/validation.middleware.js';

const router = Router();

// Asignar membresía a un cliente (solo Administrador)
router.post(
  '/',
  autenticarUsuario,
  autorizarRoles('Administrador'),
  validarCamposRequeridos(['fk_cliente', 'fk_plan']),
  crearMembresia
);

// Listar todas las membresías del gimnasio (solo Administrador)
router.get(
  '/',
  autenticarUsuario,
  autorizarRoles('Administrador'),
  obtenerTodasMembresias
);

// Historial y estado de membresía de un usuario específico
// Traduce id_usuario del token a id_cliente automáticamente.
// (accesible para Administrador o el propio usuario autenticado)
router.get(
  '/usuario/:id_usuario',
  autenticarUsuario,
  obtenerHistorialUsuario
);

// Historial y estado de membresía por ID directo de cliente (solo Administrador)
router.get(
  '/cliente/:id_cliente',
  autenticarUsuario,
  autorizarRoles('Administrador'),
  obtenerHistorialCliente
);

// Cancelar una membresía activa (solo Administrador)
router.patch(
  '/:id/cancelar',
  autenticarUsuario,
  autorizarRoles('Administrador'),
  cancelarMembresiaController
);

// Editar fecha_inicio y/o plan de una membresía (solo Administrador)
router.put(
  '/:id',
  autenticarUsuario,
  autorizarRoles('Administrador'),
  editarMembresiaController
);

export default router;
