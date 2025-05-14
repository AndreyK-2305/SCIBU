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
  const services = getServicesFromStorage();

  const newService: Service = {
    ...serviceData,
    id: `service${services.length + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedServices = [...services, newService];
  saveServicesToStorage(updatedServices);

  return newService;
};

// Obtener todos los servicios
export const getAllServices = async (): Promise<Service[]> => {
  return getServicesFromStorage();
};

// Obtener un servicio por ID
export const getServiceById = async (id: string): Promise<Service | null> => {
  const services = getServicesFromStorage();
  const service = services.find((s) => s.id === id);
  return service || null;
};

// Actualizar un servicio existente
export const updateService = async (
  id: string,
  serviceData: Partial<Omit<Service, "id" | "createdAt" | "updatedAt">>,
): Promise<Service> => {
  const services = getServicesFromStorage();
  const serviceIndex = services.findIndex((s) => s.id === id);

  if (serviceIndex === -1) {
    throw new Error(`Service with ID ${id} not found`);
  }

  const updatedService: Service = {
    ...services[serviceIndex],
    ...serviceData,
    updatedAt: new Date(),
  };

  services[serviceIndex] = updatedService;
  saveServicesToStorage(services);

  return updatedService;
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
  const services = getServicesFromStorage();
  const updatedServices = services.filter((s) => s.id !== id);
  saveServicesToStorage(updatedServices);
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
