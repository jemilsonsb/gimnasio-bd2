import cors from 'cors';
import express from 'express';
import autenticacionRoutes from './routes/autenticacion.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import planRoutes from './routes/plan.routes.js';
import membresiaRoutes from './routes/membresia.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import pagoRoutes from './routes/pago.routes.js';
import ejercicioRoutes from './routes/ejercicio.routes.js';
import rutinaRoutes from './routes/rutina.routes.js';
import fichaTecnicaRoutes from './routes/ficha_tecnica.routes.js';
import claseRoutes from './routes/clase.routes.js';
import programacionClaseRoutes from './routes/programacion_clase.routes.js';
import reservaClaseRoutes from './routes/reserva_clase.routes.js';
import entrenadorRoutes from './routes/entrenador.routes.js';
import reporteRoutes from './routes/reporte.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import asistenciaRoutes from './routes/asistencia.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { successResponse } from './utils/api-response.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  return successResponse(res, 200, 'API disponible', { status: 'ok' });
});

app.use('/api/autenticacion', autenticacionRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/planes', planRoutes);
app.use('/api/membresias', membresiaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/entrenadores', entrenadorRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/ejercicios', ejercicioRoutes);
app.use('/api/rutinas', rutinaRoutes);
app.use('/api/ficha-tecnica', fichaTecnicaRoutes);
app.use('/api/clases', claseRoutes);
app.use('/api/programaciones', programacionClaseRoutes);
app.use('/api/reservas', reservaClaseRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/asistencias', asistenciaRoutes);

app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    error: { code: 'NOT_FOUND' }
  });
});

app.use(errorMiddleware);