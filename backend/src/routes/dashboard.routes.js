import { Router } from 'express';
import { obtenerDashboardController } from '../controllers/dashboard.controller.js';
import { autenticarUsuario } from '../middlewares/auth.middleware.js';

const dashboardRoutes = Router();

dashboardRoutes.use(autenticarUsuario);

dashboardRoutes.get('/', obtenerDashboardController);

export default dashboardRoutes;
