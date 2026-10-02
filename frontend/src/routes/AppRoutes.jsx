import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import { AsistenciasAdminPage } from '../pages/AsistenciasAdminPage.jsx';
import { ClasesAdminPage } from '../pages/ClasesAdminPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { EjerciciosAdminPage } from '../pages/EjerciciosAdminPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { MembresiasAdminPage } from '../pages/MembresiasAdminPage.jsx';
import { MiFichaTecnicaPage } from '../pages/MiFichaTecnicaPage.jsx';
import { MiMembresiaPage } from '../pages/MiMembresiaPage.jsx';
import { MiRutinaPage } from '../pages/MiRutinaPage.jsx';
import { MisReservasPage } from '../pages/MisReservasPage.jsx';
import { PlanesAdminPage } from '../pages/PlanesAdminPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { ReportesPage } from '../pages/ReportesPage.jsx';
import { ReservarClasePage } from '../pages/ReservarClasePage.jsx';
import { RutinasAdminPage } from '../pages/RutinasAdminPage.jsx';
import { UsersPage } from '../pages/UsersPage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { AppLayout } from '../components/layout/AppLayout.jsx';

const LayoutWithNavbar = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        <Route element={<LayoutWithNavbar />}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute rolPermitido="Administrador">
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/planes"
            element={
              <ProtectedRoute rolPermitido="Administrador">
                <PlanesAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/membresias"
            element={
              <ProtectedRoute rolPermitido="Administrador">
                <MembresiasAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/asistencias"
            element={
              <ProtectedRoute rolPermitido="Administrador">
                <AsistenciasAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ejercicios"
            element={
              <ProtectedRoute rolesPermitidos={['Administrador', 'Entrenador']}>
                <EjerciciosAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rutinas"
            element={
              <ProtectedRoute rolesPermitidos={['Administrador', 'Entrenador']}>
                <RutinasAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clases"
            element={
              <ProtectedRoute rolesPermitidos={['Administrador', 'Entrenador']}>
                <ClasesAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reportes"
            element={
              <ProtectedRoute rolesPermitidos={['Administrador', 'Entrenador']}>
                <ReportesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mi-membresia"
            element={
              <ProtectedRoute rolPermitido="Cliente">
                <MiMembresiaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mi-rutina"
            element={
              <ProtectedRoute rolPermitido="Cliente">
                <MiRutinaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mi-ficha-tecnica"
            element={
              <ProtectedRoute rolPermitido="Cliente">
                <MiFichaTecnicaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservar-clase"
            element={
              <ProtectedRoute rolPermitido="Cliente">
                <ReservarClasePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-reservas"
            element={
              <ProtectedRoute rolPermitido="Cliente">
                <MisReservasPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}