import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router";

import ProtectedRoute from "@/components/ProtectedRoute";
import useAuth from "@/hooks/useAuth";
import CardLayout from "@/layouts/CardLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import UserDashboardLayout from "@/layouts/UserDashboardLayout";
import { MODE } from "@/lib/config";
import SuperAdminSetup from "@/pages/SuperAdminSetup";
import Action from "@/pages/auth/Action";
import CompleteProfile from "@/pages/auth/CompleteProfile";
import Login from "@/pages/auth/Login";
import PasswordRecovery from "@/pages/auth/PasswordRecovery";
import Register from "@/pages/auth/Register";
import Home from "@/pages/dashboard/Home";
import Citas from "@/pages/dashboard/citas/Citas";
import ConsultarUsuario from "@/pages/dashboard/consultar-usuario/ConsultarUsuario";
import DatosPersonales from "@/pages/dashboard/datos-personales/DatosPersonales";
import Datos from "@/pages/dashboard/datos/Datos";
import Especialistas from "@/pages/dashboard/especialistas/Especialistas";
import Horarios from "@/pages/dashboard/horarios/Horarios";
import Servicios from "@/pages/dashboard/servicios/Servicios";
import Components from "@/pages/dev/Components";
import { getUserData } from "@/services/user";
import { ADMIN_CREDENTIALS } from "@/utils/adminInfo";

// We separate the router content to ensure useAuth and useNavigate work properly
function RouterContent() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      setLoading(true);

      if (user) {
        try {
          const userData = await getUserData(user.uid);
          // Check if user is admin
          setIsAdmin(
            userData?.role === "admin" ||
              user.email === ADMIN_CREDENTIALS.email,
          );
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  // Show loading state while checking admin status
  if (loading && user) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard" />} />

      {/* Admin Dashboard Routes */}
      {isAdmin ? (
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
      ) : (
        // User Dashboard Routes
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <UserDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="datos-personales" element={<DatosPersonales />} />
          <Route path="citas" element={<Citas />} />
          <Route path="consultar-usuario" element={<ConsultarUsuario />} />
        </Route>
      )}

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
  );
}

export default function Router() {
  return (
    <HashRouter>
      <RouterContent />
    </HashRouter>
  );
}
