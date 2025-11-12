import { FirebaseError } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  collection,
  getDocs,
} from "firebase/firestore";

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
    // Determine if this is a basic profile (with empty required fields) or a complete profile
    const isBasicProfile =
      !data.documentNumber || !data.birthDate || !data.phone;

    const userData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      isProfileComplete: !isBasicProfile, // Set to false for basic profiles that need completion
    };

    console.log(`Creating user data with isProfileComplete=${!isBasicProfile}`);
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

// Function to get all registered users
export async function getAllUsers(): Promise<Array<UserData & { id: string }>> {
  try {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);

    const users: Array<UserData & { id: string }> = [];

    querySnapshot.forEach((doc) => {
      const userData = doc.data() as UserData;
      users.push({
        ...userData,
        id: doc.id,
      });
    });

    // Sort users by name for easier selection
    return users.sort((a, b) => {
      const nameA = a.fullName || a.email || "";
      const nameB = b.fullName || b.email || "";
      return nameA.localeCompare(nameB);
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

// Interface para datos de usuario desde CSV
export interface CSVUserData {
  documentType: string; // CC, TI, etc.
  documentNumber: string;
  fullName: string;
  email: string;
  code: string;
  program: string;
}

// Función para crear un usuario desde CSV
// NOTA: Esta función autenticará temporalmente como el usuario creado
// y luego cerrará sesión. Si hay un admin autenticado, perderá su sesión.
export async function createUserFromCSV(
  userData: CSVUserData,
  password: string = "123456",
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const auth = getAuth();

    // Crear el usuario en Firebase Auth
    // Esto automáticamente autenticará como el nuevo usuario
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      password,
    );

    const userId = userCredential.user.uid;

    // Crear los datos del usuario en Firestore
    const now = Timestamp.now();
    await setDoc(doc(db, "users", userId), {
      email: userData.email,
      fullName: userData.fullName,
      documentType: userData.documentType,
      documentNumber: userData.documentNumber,
      code: userData.code,
      program: userData.program,
      status: "Estudiante", // Valor por defecto
      birthDate: "",
      phone: "",
      gender: "",
      populationGroups: [],
      socialPrograms: [],
      role: "beneficiario",
      createdAt: now,
      updatedAt: now,
      isProfileComplete: false, // Perfil incompleto porque faltan campos requeridos
    });

    // NO cerrar sesión aquí - se cerrará al final de la importación completa
    // Esto permite crear múltiples usuarios en secuencia

    return { success: true, userId };
  } catch (error: any) {
    console.error("Error creating user from CSV:", error);
    
    // Si el usuario ya existe, retornar error específico
    if (error.code === "auth/email-already-in-use") {
      return {
        success: false,
        error: `El email ${userData.email} ya está registrado`,
      };
    }

    return {
      success: false,
      error: error.message || "Error al crear el usuario",
    };
  }
}
