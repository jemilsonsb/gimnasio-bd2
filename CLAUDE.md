# Proyecto gimnasio-bd2

Sistema de gestión de gimnasio. Responde siempre en español.

## Stack
- Backend: Node.js + Express, MySQL con mysql2 (pool.execute() y SQL
  crudo). NO usar Sequelize ni ORMs.
- Frontend: React + Vite + Tailwind CSS.
- Pruebas: node --test con supertest (backend/tests/).

## Backend
- Estructura: models/ (SQL), controllers/ (validación y reglas),
  routes/ (middlewares), montaje en src/app.js.
- Middlewares: autenticarUsuario, autorizarRoles, validarCamposRequeridos.
- Respuestas con successResponse / errorResponse (utils/api-response.js).
- Roles: Administrador, Entrenador, Cliente. Cliente y Entrenador son
  extensiones 1 a 1 de usuario: se traduce el id_usuario del token a
  id_cliente / id_entrenador.
- Los archivos de test cierran el pool: after(async () => { await pool.end(); });
- Cambios de base de datos: solo como script en backend/database/migrations/,
  que yo ejecuto a mano en DBeaver. Nunca desde la app.

## Frontend
- Servicios en src/services/, componentes por módulo en src/components/,
  páginas en src/pages/.
- Rutas en src/routes/AppRoutes.jsx con ProtectedRoute
  (rolPermitido o rolesPermitidos).
- Todos los modales de una página van dentro de un único Fragment <>...</>.
- Reutilizar ModalConfirmacion.jsx para confirmaciones.

## Reglas de trabajo
- Cambios mínimos; no tocar módulos ajenos a la tarea.
- Antes de cambios grandes, mostrar el plan y esperar mi aprobación.
- Al terminar: npm test (backend) y npm run build (frontend).