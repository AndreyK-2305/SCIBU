import { HashRouter, Routes, Route, Navigate } from "react-router";

import ProtectedRoute from "@/components/ProtectedRoute";
import CardLayout from "@/layouts/CardLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import { MODE } from "@/lib/config";
import SuperAdminSetup from "@/pages/SuperAdminSetup";
import Action from "@/pages/auth/Action";
import CompleteProfile from "@/pages/auth/CompleteProfile";
import Login from "@/pages/auth/Login";
import PasswordRecovery from "@/pages/auth/PasswordRecovery";
import Register from "@/pages/auth/Register";
import Home from "@/pages/dashboard/Home";
import Citas from "@/pages/dashboard/citas/Citas";
import DatosPersonales from "@/pages/dashboard/datos-personales/DatosPersonales";
import Datos from "@/pages/dashboard/datos/Datos";
import Especialistas from "@/pages/dashboard/especialistas/Especialistas";
import Horarios from "@/pages/dashboard/horarios/Horarios";
import Servicios from "@/pages/dashboard/servicios/Servicios";
import Components from "@/pages/dev/Components";

export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route index element={<Navigate to="/dashboard" />} />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="datos-personales" element={<DatosPersonales />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="especialistas" element={<Especialistas />} />
          <Route path="horarios" element={<Horarios />} />
          <Route path="citas" element={<Citas />} />
          <Route path="datos" element={<Datos />} />
        </Route>

        <Route
          path="auth"
          element={
            <ProtectedRoute
              elemOnDeny={<CardLayout />}
              elemOnAllow={<Navigate to="/dashboard" />}
            />
          }
        >
          <Route index element={<Navigate to="login" />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="password-recovery" element={<PasswordRecovery />} />
          <Route path="action" element={<Action />} />
          <Route path="complete-profile" element={<CompleteProfile />} />
        </Route>

        {/* Ruta oculta para configuración de administrador - acceso público para setup inicial */}
        <Route path="admin-setup" element={<SuperAdminSetup />} />

        {MODE === "development" && (
          <Route path="dev/components" element={<Components />} />
        )}
      </Routes>
    </HashRouter>
  );
}
