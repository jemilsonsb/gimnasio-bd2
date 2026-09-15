import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { UsersPage } from '../pages/UsersPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
      </Routes>
    </BrowserRouter>
  );
}
