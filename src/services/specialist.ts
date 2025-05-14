import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Specialist, SpecialistFormData } from "@/types/specialist";

import { getServiceById, updateService } from "./service";

const COLLECTION_NAME = "specialists";

// Helper function to convert Firestore document to Specialist
const convertSpecialistDoc = (doc: any): Specialist => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    services: data.services || [],
    isActive: data.isActive ?? true,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Get all specialists
export const getAllSpecialists = async (): Promise<Specialist[]> => {
  try {
    const specialistsQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(specialistsQuery);
    const specialists: Specialist[] = [];

    querySnapshot.forEach((doc) => {
      specialists.push(convertSpecialistDoc(doc));
    });

    return specialists;
  } catch (error) {
    console.error("Error getting specialists:", error);
    throw error;
  }
};

// Get specialists by service
export const getSpecialistsByService = async (
  serviceId: string,
): Promise<Specialist[]> => {
  try {
    const specialistsQuery = query(
      collection(db, COLLECTION_NAME),
      where("services", "array-contains", serviceId),
      where("isActive", "==", true),
    );

    const querySnapshot = await getDocs(specialistsQuery);
    const specialists: Specialist[] = [];

    querySnapshot.forEach((doc) => {
      specialists.push(convertSpecialistDoc(doc));
    });

    return specialists;
  } catch (error) {
    console.error("Error getting specialists by service:", error);
    throw error;
  }
};

// Get specialist by ID
export const getSpecialistById = async (
  id: string,
): Promise<Specialist | null> => {
  try {
    const specialistDoc = await getDoc(doc(db, COLLECTION_NAME, id));

    if (specialistDoc.exists()) {
      return convertSpecialistDoc(specialistDoc);
    }

    return null;
  } catch (error) {
    console.error("Error getting specialist:", error);
    throw error;
  }
};

// Create a new specialist
export const createSpecialist = async (
  specialistData: SpecialistFormData,
): Promise<Specialist> => {
  try {
    // Prepare specialist data with timestamps
    const newSpecialistData = {
      ...specialistData,
      isActive: specialistData.isActive ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add the specialist to Firestore
    const docRef = await addDoc(
      collection(db, COLLECTION_NAME),
      newSpecialistData,
    );

    // Create the specialist object to return
    const newSpecialist = {
      ...specialistData,
      id: docRef.id,
      isActive: specialistData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update services to add this specialist to their specialists array
    if (specialistData.services && specialistData.services.length > 0) {
      for (const serviceId of specialistData.services) {
        try {
          const service = await getServiceById(serviceId);
          if (service) {
            const updatedSpecialists = [...service.specialists, docRef.id];
            await updateService(serviceId, { specialists: updatedSpecialists });
          }
        } catch (error) {
          console.error(`Error updating service ${serviceId}:`, error);
        }
      }
    }

    return newSpecialist;
  } catch (error) {
    console.error("Error creating specialist:", error);
    throw error;
  }
};

// Update specialist
export const updateSpecialist = async (
  id: string,
  specialistData: Partial<SpecialistFormData>,
): Promise<void> => {
  try {
    // Get the existing specialist to compare services
    const existingSpecialist = await getSpecialistById(id);

    // Create update data with timestamp
    const updateData: any = {
      ...specialistData,
      updatedAt: Timestamp.now(),
    };

    // Update the specialist in Firebase
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);

    // Update service-specialist relationships if services array has changed
    if (specialistData.services && existingSpecialist) {
      const oldServices = existingSpecialist.services || [];
      const newServices = specialistData.services;

      // Find services that were removed
      const removedServices = oldServices.filter(
        (serviceId) => !newServices.includes(serviceId),
      );

      // Find services that were added
      const addedServices = newServices.filter(
        (serviceId) => !oldServices.includes(serviceId),
      );

      // Update services that were removed - remove this specialist from their specialists list
      for (const serviceId of removedServices) {
        try {
          const service = await getServiceById(serviceId);
          if (service) {
            const updatedSpecialists = service.specialists.filter(
              (specialistId) => specialistId !== id,
            );
            await updateService(serviceId, { specialists: updatedSpecialists });
          }
        } catch (error) {
          console.error(`Error updating removed service ${serviceId}:`, error);
        }
      }

      // Update services that were added - add this specialist to their specialists list
      for (const serviceId of addedServices) {
        try {
          const service = await getServiceById(serviceId);
          if (service) {
            const updatedSpecialists = [...service.specialists, id];
            await updateService(serviceId, { specialists: updatedSpecialists });
          }
        } catch (error) {
          console.error(`Error updating added service ${serviceId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error updating specialist:", error);
    throw error;
  }
};

// Update specialist status (active/inactive)
export const updateSpecialistStatus = async (
  id: string,
  isActive: boolean,
): Promise<void> => {
  try {
    // Get the current specialist
    const specialist = await getSpecialistById(id);

    // Update the specialist status
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      isActive,
      updatedAt: Timestamp.now(),
    });

    // If the specialist is being deactivated and has services
    if (!isActive && specialist && specialist.services.length > 0) {
      // For each service, we should notify that this specialist is no longer active
      // This doesn't remove the association, but could be used to show status in the UI
      for (const serviceId of specialist.services) {
        try {
          const service = await getServiceById(serviceId);
          if (service) {
            console.log(
              `Specialist ${specialist.name} deactivated but still associated with service ${service.title}`,
            );
            // Note: We're not removing the association, just logging for now
          }
        } catch (error) {
          console.error(
            `Error processing service ${serviceId} for deactivated specialist:`,
            error,
          );
        }
      }
    }
  } catch (error) {
    console.error("Error updating specialist status:", error);
    throw error;
  }
};
