import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";

import { createUserData, setUserAsAdmin } from "@/services/user";

import { ADMIN_CREDENTIALS } from "./adminInfo";

// Extraer credenciales admin
const { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } = ADMIN_CREDENTIALS;

/**
 * Crea una cuenta de administrador o actualiza una existente
 * Este script debe ejecutarse manualmente desde el código
 * para crear/configurar una cuenta de administrador
 */
export async function createAdminUser(): Promise<void> {
  try {
    const auth = getAuth();

    try {
      // Intentar crear el usuario administrador
      console.log("Creating admin user account...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        ADMIN_EMAIL,
        ADMIN_PASSWORD,
      );

      const userId = userCredential.user.uid;

      // Crear datos del administrador - directamente con perfil completo
      console.log("Creating admin profile data...");
      await createUserData(userId, {
        email: ADMIN_EMAIL,
        fullName: "Administrador Sistema",
        documentType: "CC",
        documentNumber: "1234567890",
        birthDate: "1990-01-01",
        phone: "3001234567",
        gender: "Masculino",
        code: "ADMIN001",
        status: "Administrativo",
        program: "Administración del Sistema",
        populationGroups: [],
        socialPrograms: [],
        role: "admin",
      });

      // Asignar rol de administrador (por si acaso)
      console.log("Setting admin privileges...");
      await setUserAsAdmin(userId);

      toast.success("Cuenta de administrador creada exitosamente", {
        description: `Email: ${ADMIN_EMAIL}, Password: ${ADMIN_PASSWORD}`,
      });
    } catch (error: any) {
      // Si el error es porque el usuario ya existe, intentamos iniciar sesión
      if (error.code === "auth/email-already-in-use") {
        console.log("Admin user already exists, updating privileges...");
        toast.warning("El usuario administrador ya existe", {
          description: `Las credenciales son: Email: ${ADMIN_EMAIL}, Password: ${ADMIN_PASSWORD}`,
        });
      } else {
        console.error("Error creating admin user:", error);
        toast.error("Error al crear cuenta de administrador");
        throw error;
      }
    } finally {
      // Cerrar sesión para no interferir con la sesión actual del usuario
      await signOut(auth);
    }
  } catch (error) {
    console.error("Error in admin account setup:", error);
    toast.error("Error configurando cuenta de administrador");
  }
}
