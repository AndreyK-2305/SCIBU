import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

import useAuth from "@/hooks/useAuth";
import { getUserData } from "@/services/user";

// Configuración temporal para bypass de autenticación (SOLO PARA DESARROLLO)
const BYPASS_AUTH = true; // Cambia a false para requerir autenticación
const MOCK_ADMIN = true; // Simular que el usuario es administrador

interface ProtectedRouteProps {
  children?: ReactNode;
  elemOnDeny?: ReactNode;
  elemOnAllow?: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  elemOnDeny,
  elemOnAllow,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isProfileComplete, setIsProfileComplete] = useState<
    boolean | undefined
  >(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Debug flag para mostrar la redirección que se va a hacer
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    async function checkProfile() {
      if (BYPASS_AUTH) {
        // Modo bypass: permitir acceso sin autenticación
        console.log("MODO BYPASS: Acceso sin autenticación habilitado");
        setIsProfileComplete(true);
        setIsAdmin(MOCK_ADMIN);
        setIsLoading(false);
        return;
      }

      if (user?.uid) {
        try {
          console.log("Checking profile completion for user:", user.uid);
          const userData = await getUserData(user.uid);
          console.log("User data from Firestore:", userData);

          if (userData) {
            // El usuario es administrador si su rol es "admin"
            const adminStatus = userData.role === "admin";
            setIsAdmin(adminStatus);

            // Si es admin, consideramos su perfil completo independientemente del estado real
            setIsProfileComplete(
              adminStatus ? true : userData.isProfileComplete || false,
            );

            console.log(
              `User ${user.uid} is admin: ${adminStatus}, profile complete: ${adminStatus ? true : userData.isProfileComplete || false}`,
            );
          } else {
            console.error("No user data found in Firestore");
            setIsProfileComplete(false);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking profile:", error);
          setIsProfileComplete(false);
          setIsAdmin(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    checkProfile();
  }, [user]);

  // Si estamos en la página de registro o completar perfil, no redirigir
  const isAuthPage = location.pathname.startsWith("/auth/");
  const isCompleteProfilePage = location.pathname === "/auth/complete-profile";
  // Si estamos en la página de admin-setup, permitir acceso
  const isAdminSetupPage = location.pathname === "/admin-setup";

  console.log(
    "Current path:",
    location.pathname,
    "isAuthPage:",
    isAuthPage,
    "isAdminSetupPage:",
    isAdminSetupPage,
  );
  console.log("User state:", {
    uid: user?.uid,
    isLoading,
    isProfileComplete,
    isAdmin,
    bypass: BYPASS_AUTH,
  });

  // Bypass de autenticación para desarrollo
  if (BYPASS_AUTH) {
    console.log("BYPASS: Permitiendo acceso a", location.pathname);
    return children;
  }

  // Permitir siempre acceso a las páginas de auth (excepto complete-profile para admins)
  if (isAuthPage) {
    if (isCompleteProfilePage && isAdmin) {
      console.log(
        "Admin user on complete-profile page, redirecting to dashboard",
      );
      setRedirect("/dashboard");
      return <Navigate to="/dashboard" />;
    }
    return children || elemOnDeny;
  }

  // Permitir siempre acceso a admin-setup
  if (isAdminSetupPage) {
    return children;
  }

  // Si el usuario no está definido o aún estamos cargando, esperar
  if (user === undefined || isLoading) {
    console.log("Waiting for user or profile data...");
    return null;
  }

  // Si no hay usuario, redirigir a login
  if (user === null) {
    console.log("No user found, redirecting to login");
    setRedirect("/auth/login");
    return elemOnDeny || <Navigate to="/auth/login" />;
  }

  // Los usuarios administradores siempre tienen acceso al dashboard
  if (isAdmin === true) {
    console.log("Admin user, bypassing profile completion check");

    // Si se requiere rol de admin y el usuario es admin, mostrar el contenido
    if (requireAdmin) {
      console.log("Admin required and user is admin, showing content");
      return elemOnAllow || children;
    }

    return elemOnAllow || children;
  }

  // Si el perfil no está completo, redirigir a completar perfil
  if (!isProfileComplete) {
    console.log("Profile incomplete, redirecting to complete profile");
    setRedirect("/auth/complete-profile");
    return <Navigate to="/auth/complete-profile" />;
  }

  // Si se requiere rol de admin y el usuario no es admin, redirigir
  if (requireAdmin && !isAdmin) {
    console.log(
      "Admin role required but user is not admin, redirecting to dashboard",
    );
    setRedirect("/dashboard");
    return <Navigate to="/dashboard" />;
  }

  console.log("All checks passed, showing protected content");
  // Si todo está bien, mostrar el contenido
  return elemOnAllow || children;
}
