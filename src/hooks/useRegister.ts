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
import { createInitialUserData } from "@/services/user";

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

  const registerWithEmail = async (email: string, password: string) => {
    try {
      console.log("Starting email registration for:", email);
      // Crear el usuario
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("User created in Firebase Auth:", userCredential.user.uid);

      // Crear los datos iniciales del usuario
      await createInitialUserData(
        userCredential.user.uid,
        userCredential.user.email || "",
      );
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

      // Crear datos iniciales
      await createInitialUserData(
        userCredential.user.uid,
        userCredential.user.email || "",
      );
      console.log("User data created in Firestore");

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
