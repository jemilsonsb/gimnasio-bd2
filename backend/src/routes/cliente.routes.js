import { Router } from 'express';
import {
  obtenerClientePorId,
  obtenerClientes
} from '../controllers/cliente.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';

const clienteRoutes = Router();

// Exclusivo para administradores
clienteRoutes.use(autenticarUsuario, autorizarRoles('Administrador'));

clienteRoutes.get('/', obtenerClientes);
clienteRoutes.get('/:id', obtenerClientePorId);

export default clienteRoutes;