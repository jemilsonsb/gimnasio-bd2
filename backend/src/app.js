import cors from 'cors';
import express from 'express';
import autenticacionRoutes from './routes/autenticacion.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
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

app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    error: { code: 'NOT_FOUND' }
  });
});

app.use(errorMiddleware);
