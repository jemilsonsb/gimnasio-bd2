import { Router } from 'express';
import {
  obtenerClientePorId,
  obtenerClientes
} from '../controllers/cliente.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';

const clienteRoutes = Router();

clienteRoutes.use(autenticarUsuario);

clienteRoutes.get('/', autorizarRoles('Administrador', 'Entrenador'), obtenerClientes);
clienteRoutes.get('/:id', autorizarRoles('Administrador', 'Entrenador'), obtenerClientePorId);

export default clienteRoutes;