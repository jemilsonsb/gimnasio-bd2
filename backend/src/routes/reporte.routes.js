import { Router } from 'express';
import {
  obtenerReporteClasesController,
  obtenerReporteClientesController,
  obtenerReporteIngresosController,
  obtenerReporteMembresiasController,
  obtenerReporteRutinasController
} from '../controllers/reporte.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/role.middleware.js';

const reporteRoutes = Router();

reporteRoutes.use(autenticarUsuario);

reporteRoutes.get('/ingresos', autorizarRoles('Administrador'), obtenerReporteIngresosController);
reporteRoutes.get('/membresias', autorizarRoles('Administrador'), obtenerReporteMembresiasController);
reporteRoutes.get('/clientes', autorizarRoles('Administrador'), obtenerReporteClientesController);
reporteRoutes.get('/clases', autorizarRoles('Administrador', 'Entrenador'), obtenerReporteClasesController);
reporteRoutes.get('/rutinas', autorizarRoles('Administrador', 'Entrenador'), obtenerReporteRutinasController);

export default reporteRoutes;
