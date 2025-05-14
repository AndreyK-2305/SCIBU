import { FirebaseError } from "firebase/app";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface UserData {
  email: string;
  fullName?: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  phone?: string;
  gender?: string;
  // Campos institucionales
  code?: string;
  status?: string;
  program?: string;
  // Campos de caracterización
  populationGroups?: string[];
  socialPrograms?: string[];
  // Rol de usuario
  role?: string;
  // Metadatos
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isProfileComplete: boolean;
}

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    console.log("Fetching user data for:", userId);
    const userDoc = await getDoc(doc(db, "users", userId));
    console.log("User data exists:", userDoc.exists(), "Data:", userDoc.data());
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    if (error instanceof FirebaseError) {
      console.error("Firebase error code:", error.code);
      console.error("Firebase error message:", error.message);
    }
    throw error;
  }
}

// Función para crear datos iniciales en el registro
export async function createInitialUserData(
  userId: string,
  email: string,
): Promise<void> {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No hay usuario autenticado");
    }

    if (currentUser.uid !== userId) {
      throw new Error(
        "El ID de usuario no coincide con el usuario autenticado",
      );
    }

    const now = Timestamp.now();
    await setDoc(doc(db, "users", userId), {
      email,
      fullName: "",
      documentType: "",
      documentNumber: "",
      birthDate: "",
      phone: "",
      gender: "",
      code: "",
      status: "",
      program: "",
      populationGroups: [],
      socialPrograms: [],
      role: "beneficiario", // Rol por defecto
      createdAt: now,
      updatedAt: now,
      isProfileComplete: false,
    });
  } catch (error) {
    console.error("Error creating initial user data:", error);
    if (error instanceof FirebaseError) {
      console.error("Firebase error code:", error.code);
      console.error("Firebase error message:", error.message);
    }
    throw error;
  }
}

// Función para crear/actualizar datos completos del usuario
export async function createUserData(
  userId: string,
  data: Omit<UserData, "createdAt" | "updatedAt" | "isProfileComplete">,
): Promise<void> {
  try {
    const now = Timestamp.now();
    const userData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      isProfileComplete: true,
    };
    await setDoc(doc(db, "users", userId), userData);
  } catch (error) {
    console.error("Error creating user data:", error);
    if (error instanceof FirebaseError) {
      console.error("Firebase error code:", error.code);
      console.error("Firebase error message:", error.message);
    }
    throw error;
  }
}

export async function updateUserData(
  userId: string,
  data: Partial<Omit<UserData, "createdAt" | "updatedAt">>,
): Promise<void> {
  try {
    console.log("Updating user data for:", userId, "with data:", data);
    const now = Timestamp.now();
    const updateData = {
      ...data,
      updatedAt: now,
      isProfileComplete: true,
    };
    await updateDoc(doc(db, "users", userId), updateData);
    console.log("User data updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
    if (error instanceof FirebaseError) {
      console.error("Firebase error code:", error.code);
      console.error("Firebase error message:", error.message);
    }
    throw error;
  }
}

// Función para asignar rol de administrador a un usuario existente
export async function setUserAsAdmin(userId: string): Promise<void> {
  try {
    console.log("Setting user as admin:", userId);
    const now = Timestamp.now();
    await updateDoc(doc(db, "users", userId), {
      role: "admin",
      updatedAt: now,
    });
    console.log("Admin role assigned successfully");
  } catch (error) {
    console.error("Error setting user as admin:", error);
    if (error instanceof FirebaseError) {
      console.error("Firebase error code:", error.code);
      console.error("Firebase error message:", error.message);
    }
    throw error;
  }
}

// Función para verificar si un usuario es administrador
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const userData = await getUserData(userId);
    return userData?.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
