import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  serverTimestamp,
  Timestamp,
  setDoc,
  orderBy,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Service } from "@/types/service";

import { getServicesFromStorage, saveServicesToStorage } from "./localStorage";
import { updateManyRelationships } from "./relationship";
import { getSpecialistById, updateSpecialist } from "./specialist";

const COLLECTION_NAME = "services";

// Convertir un documento Firestore a un objeto Service
const convertDoc = (doc: any): Service => {
  try {
    const data = doc.data();
    console.log("Convirtiendo documento Firestore:", { id: doc.id, data });

    if (!data) {
      console.warn("Documento sin datos:", doc.id);
      return {
        id: doc.id,
        title: "",
        description: "",
        specialists: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const service: Service = {
      id: doc.id,
      title: data.title || "",
      description: data.description || "",
      specialists: Array.isArray(data.specialists) ? data.specialists : [],
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
      createdAt: data.createdAt
        ? data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date()
        : new Date(),
      updatedAt: data.updatedAt
        ? data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : new Date()
        : new Date(),
    };

    return service;
  } catch (error) {
    console.error("Error al convertir documento:", error);
    // Devolver un servicio con valores por defecto en caso de error
    return {
      id: doc.id || "error-id",
      title: "Error al cargar servicio",
      description: "",
      specialists: [],
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
};

// Crear un nuevo servicio
export const createService = async (
  serviceData: Omit<Service, "id" | "createdAt" | "updatedAt">,
): Promise<Service> => {
  try {
    // Add timestamps
    const newServiceData = {
      ...serviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Save the service to Firestore
    const docRef = await addDoc(
      collection(db, COLLECTION_NAME),
      newServiceData,
    );

    // Create the service object to return
    const newService: Service = {
      id: docRef.id,
      ...serviceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update specialists to add this service to their services array
    if (serviceData.specialists && serviceData.specialists.length > 0) {
      for (const specialistId of serviceData.specialists) {
        try {
          const specialist = await getSpecialistById(specialistId);
          if (specialist) {
            const updatedServices = [...specialist.services, docRef.id];
            await updateSpecialist(specialistId, { services: updatedServices });
          }
        } catch (error) {
          console.error(`Error updating specialist ${specialistId}:`, error);
        }
      }
    }

    return newService;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

// Obtener todos los servicios
export const getAllServices = async (): Promise<Service[]> => {
  try {
    const servicesQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(servicesQuery);
    const services: Service[] = [];

    querySnapshot.forEach((doc) => {
      services.push(convertDoc(doc));
    });

    return services;
  } catch (error) {
    console.error("Error getting services:", error);
    // Return empty array if there's an error
    return [];
  }
};

// Obtener un servicio por ID
export const getServiceById = async (id: string): Promise<Service | null> => {
  try {
    const serviceDoc = await getDoc(doc(db, COLLECTION_NAME, id));

    if (serviceDoc.exists()) {
      return convertDoc(serviceDoc);
    }

    return null;
  } catch (error) {
    console.error("Error getting service:", error);
    return null;
  }
};

// Actualizar un servicio existente
export const updateService = async (
  id: string,
  serviceData: Partial<Service>,
): Promise<void> => {
  try {
    // Get the existing service to compare specialists
    const existingService = await getServiceById(id);

    // Create the update data with server timestamp
    const updateData = {
      ...serviceData,
      updatedAt: serverTimestamp(),
    };

    // Update the service in Firestore
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);

    // Handle specialist relationships if specialists array has changed
    if (serviceData.specialists && existingService) {
      const oldSpecialists = existingService.specialists || [];
      const newSpecialists = serviceData.specialists;

      // Use the relationship utility to update many-to-many relationships
      await updateManyRelationships(
        COLLECTION_NAME,
        id,
        "specialists",
        oldSpecialists,
        newSpecialists,
        "specialists",
        "services",
      );
    }
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

// Cambiar el estado activo de un servicio
export const toggleServiceStatus = async (
  id: string,
  isActive: boolean,
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al cambiar estado del servicio:", error);
    throw error;
  }
};

// Eliminar un servicio
export const deleteService = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

// Verificar la conexión a Firestore
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    console.log("Verificando conexión a Firestore...");
    // Intentar obtener la lista de servicios (solo para verificar conexión)
    await getDocs(collection(db, COLLECTION_NAME));
    console.log("Conexión a Firestore exitosa");
    return true;
  } catch (error) {
    console.error("Error de conexión a Firestore:", error);
    return false;
  }
};
