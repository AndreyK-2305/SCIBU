import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUserAsAdmin, updateUserData, getUserData } from "@/services/user";
import { ADMIN_CREDENTIALS } from "@/utils/adminInfo";
import { createAdminUser } from "@/utils/createAdmin";

export default function SuperAdminSetup() {
  const [isCreating, setIsCreating] = useState(false);
  const [userId, setUserId] = useState("");
  const [adminCreated, setAdminCreated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const navigate = useNavigate();

  const handleCreateAdmin = async () => {
    try {
      setIsCreating(true);
      await createAdminUser();
      setAdminCreated(true);
    } catch (error) {
      console.error("Error creating admin:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSetUserAsAdmin = async () => {
    if (!userId.trim()) {
      toast.error("Ingresa un ID de usuario válido");
      return;
    }

    try {
      setIsCreating(true);
      await setUserAsAdmin(userId);
      toast.success("¡Usuario promovido a administrador!");
      setUserId("");
    } catch (error) {
      console.error("Error setting user as admin:", error);
      toast.error("Error al asignar rol de administrador");
    } finally {
      setIsCreating(false);
    }
  };

  const handleLoginAsAdmin = async () => {
    try {
      setIsLoggingIn(true);
      const auth = getAuth();
      await signInWithEmailAndPassword(
        auth,
        ADMIN_CREDENTIALS.email,
        ADMIN_CREDENTIALS.password,
      );
      toast.success("Iniciando sesión como administrador");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in as admin:", error);
      toast.error("Error al iniciar sesión como administrador");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFixAdminProfile = async () => {
    try {
      setIsFixing(true);

      // Obtener el UID del administrador
      const auth = getAuth();
      const adminUser = await signInWithEmailAndPassword(
        auth,
        ADMIN_CREDENTIALS.email,
        ADMIN_CREDENTIALS.password,
      );

      const adminUid = adminUser.user.uid;
      console.log("Admin UID:", adminUid);

      // Verificar datos actuales
      const userData = await getUserData(adminUid);
      console.log("Current admin data:", userData);

      // Forzar actualización con perfil completo
      await updateUserData(adminUid, {
        isProfileComplete: true,
        ...(userData?.fullName ? {} : { fullName: "Administrador Sistema" }),
        ...(userData?.documentType ? {} : { documentType: "CC" }),
        ...(userData?.documentNumber ? {} : { documentNumber: "1234567890" }),
        ...(userData?.birthDate ? {} : { birthDate: "1990-01-01" }),
        ...(userData?.phone ? {} : { phone: "3001234567" }),
        ...(userData?.gender ? {} : { gender: "Masculino" }),
        ...(userData?.code ? {} : { code: "ADMIN001" }),
        ...(userData?.status ? {} : { status: "Administrativo" }),
        ...(userData?.program ? {} : { program: "Administración del Sistema" }),
        role: "admin",
      });

      toast.success("Perfil de administrador reparado correctamente");

      // Navegar al dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error fixing admin profile:", error);
      toast.error("Error al reparar el perfil de administrador");
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-2xl font-bold">
        Configuración de Administrador
      </h1>

      <div className="mb-6 border-l-4 border-yellow-400 bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Esta página es solo para configuración inicial y no debería ser
              accesible públicamente en producción.
            </p>
          </div>
        </div>
      </div>

      {adminCreated && (
        <div className="mb-6 border-l-4 border-green-400 bg-green-50 p-4">
          <h2 className="mb-2 text-lg font-semibold text-green-800">
            ¡Administrador creado con éxito!
          </h2>
          <p className="mb-2 text-green-700">
            Use estas credenciales para iniciar sesión:
          </p>
          <div className="mb-4 rounded-md border border-green-200 bg-white p-3">
            <p>
              <strong>Email:</strong> {ADMIN_CREDENTIALS.email}
            </p>
            <p>
              <strong>Contraseña:</strong> {ADMIN_CREDENTIALS.password}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-600">
              Ahora puede ir a la página de{" "}
              <a href="#/auth/login" className="font-medium underline">
                inicio de sesión
              </a>{" "}
              y usar estas credenciales.
            </p>
            <Button
              onClick={handleLoginAsAdmin}
              disabled={isLoggingIn}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoggingIn ? "Iniciando..." : "Iniciar sesión ahora"}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear Administrador Predeterminado</CardTitle>
            <CardDescription>
              Crea una cuenta de administrador con credenciales predefinidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Este proceso creará un administrador con las siguientes
              credenciales:
            </p>
            <div className="mb-4 rounded-md bg-muted p-3">
              <p>
                <strong>Email:</strong> {ADMIN_CREDENTIALS.email}
              </p>
              <p>
                <strong>Contraseña:</strong> {ADMIN_CREDENTIALS.password}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              La cuenta se creará con un perfil completo y permisos de
              administrador.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateAdmin}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? "Creando..." : "Crear Administrador"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promover Usuario a Administrador</CardTitle>
            <CardDescription>
              Convierte un usuario existente en administrador usando su ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-id">ID de Usuario (Firebase UID)</Label>
                <Input
                  id="user-id"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Ej. aBcDeFgHiJkLmNoPqRsT"
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa el UID del usuario que deseas promover a administrador
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSetUserAsAdmin}
              disabled={isCreating || !userId.trim()}
              className="w-full"
            >
              Promover a Administrador
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión como Administrador</CardTitle>
            <CardDescription>
              Inicia sesión directamente con las credenciales de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Si ya has creado la cuenta de administrador, puedes iniciar sesión
              directamente desde aquí.
            </p>
            <div className="mb-4 rounded-md bg-muted p-3">
              <p>
                <strong>Email:</strong> {ADMIN_CREDENTIALS.email}
              </p>
              <p>
                <strong>Contraseña:</strong> {ADMIN_CREDENTIALS.password}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleLoginAsAdmin}
              disabled={isLoggingIn}
              className="w-full"
            >
              {isLoggingIn
                ? "Iniciando sesión..."
                : "Iniciar sesión como Administrador"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reparar Perfil de Administrador</CardTitle>
            <CardDescription>
              Repara el perfil del administrador si está incompleto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Si tienes problemas para iniciar sesión o eres redirigido al
              formulario de completar perfil, usa esta opción para reparar el
              perfil del administrador.
            </p>
            <div className="rounded-md bg-muted p-3">
              <p>Este proceso:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                <li>Inicia sesión como administrador</li>
                <li>Establece isProfileComplete a true</li>
                <li>Completa cualquier campo faltante en el perfil</li>
                <li>Te redirige al dashboard</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleFixAdminProfile}
              disabled={isFixing}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {isFixing ? "Reparando..." : "Reparar Perfil de Administrador"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
