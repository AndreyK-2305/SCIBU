import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { handleFirebaseError } from "@/lib/error";
import {
  createInitialUserData,
  createUserData,
  UserData,
} from "@/services/user";

import useAuth from "./useAuth";

export function useRegister() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const handleSuccessfulRegistration = async () => {
    console.log("Handling successful registration");
    // Mostrar mensaje de éxito
    toast.success("¡Registro Exitoso!", {
      duration: 3000,
      style: { backgroundColor: "#4CAF50", color: "white" },
      description: "Tu cuenta ha sido creada correctamente.",
    });

    // Esperar 1 segundo antes de cerrar sesión y redirigir
    setTimeout(async () => {
      console.log("Signing out and redirecting to login");
      await signOut(auth);
      navigate("/auth/login");
    }, 1000);
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    profileData?: Omit<
      UserData,
      "createdAt" | "updatedAt" | "isProfileComplete"
    >,
  ) => {
    try {
      console.log("Starting email registration for:", email);
      // Crear el usuario
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("User created in Firebase Auth:", userCredential.user.uid);

      // Crear los datos del usuario
      if (profileData) {
        // Si hay datos de perfil, usar createUserData (perfil completo)
        console.log("Creating complete user profile with data:", profileData);
        await createUserData(userCredential.user.uid, {
          ...profileData,
          email: userCredential.user.email || email,
        });
      } else {
        // Si no hay datos de perfil, crear datos iniciales
        console.log("Creating initial user data");
        await createInitialUserData(
          userCredential.user.uid,
          userCredential.user.email || "",
        );
      }
      console.log("User data created in Firestore");

      // Manejar el registro exitoso
      await handleSuccessfulRegistration();
    } catch (error) {
      console.error("Error in registration:", error);
      if (error instanceof FirebaseError) {
        handleFirebaseError(toast.error, error);
      }
      throw error;
    }
  };

  const registerWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      console.log("Starting Google registration");
      // Registrar con Google
      const userCredential = await signInWithPopup(auth, provider);
      console.log("User created in Firebase Auth:", userCredential.user.uid);

      // Obtener información del perfil de Google
      const displayName = userCredential.user.displayName || "";
      const email = userCredential.user.email || "";

      // Crear datos de usuario con la información de Google
      // Estos campos estarán vacíos, lo que marca el perfil como incompleto
      await createUserData(userCredential.user.uid, {
        email,
        fullName: displayName,
        documentType: "",
        documentNumber: "", // Campo requerido vacío = perfil incompleto
        birthDate: "", // Campo requerido vacío = perfil incompleto
        phone: "", // Campo requerido vacío = perfil incompleto
        gender: "",
        code: "",
        status: "",
        program: "",
        populationGroups: [],
        socialPrograms: [],
        role: "beneficiario", // Rol por defecto
      });
      console.log(
        "User data created in Firestore with Google profile info (perfil incompleto)",
      );

      // Manejar el registro exitoso
      await handleSuccessfulRegistration();
    } catch (error) {
      console.error("Error in Google registration:", error);
      if (error instanceof FirebaseError) {
        handleFirebaseError(toast.error, error, [
          "auth/popup-closed-by-user",
          "auth/cancelled-popup-request",
        ]);
      }
      throw error;
    }
  };

  return {
    registerWithEmail,
    registerWithGoogle,
  };
}
