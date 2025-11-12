import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import {
  Appointment,
  AppointmentFormData,
  AppointmentStatus,
} from "@/types/appointment";

import {
  getAppointmentsFromStorage,
  saveAppointmentsToStorage,
  updateAppointmentInStorage,
} from "./localStorage";
import {
  sendAppointmentCreatedNotification,
  sendAppointmentUpdatedNotification,
  sendAppointmentDeletedNotification,
} from "./notifications";

const COLLECTION_NAME = "appointments";

// Helper function to convert Firestore document to Appointment
const convertAppointmentDoc = (doc: any): Appointment => {
  const data = doc.data();
  return {
    id: doc.id,
    date: data.date?.toDate() || new Date(),
    time: data.time || "",
    requesterName: data.requesterName || "",
    requesterType: data.requesterType || "",
    serviceType: data.serviceType || "",
    specialistId: data.specialistId || "",
    specialistName: data.specialistName || "",
    status: data.status || "pendiente",
    isFirstTime: data.isFirstTime || false,
    disability: data.disability || false,
    reason: data.reason || "",
    recommendations: data.recommendations || "",
    userId: data.userId || "",
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Check and update expired appointments
// A cita is expired if it's been more than 1 day since the appointment date
// and the status is still "pendiente"
export const checkAndUpdateExpiredAppointments = async (): Promise<void> => {
  try {
    const now = new Date();
    // Normalize to start of day for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get all pending appointments
    const pendingQuery = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "pendiente"),
    );

    const querySnapshot = await getDocs(pendingQuery);
    const expiredAppointments: string[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const appointmentDate = data.date?.toDate() || new Date();
      
      // Normalize appointment date to start of day
      const appointmentDateNormalized = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate(),
      );

      // Calculate the day after the appointment date
      const dayAfterAppointment = new Date(appointmentDateNormalized);
      dayAfterAppointment.setDate(dayAfterAppointment.getDate() + 1);

      // If today is after the day after the appointment, it's expired
      if (today > dayAfterAppointment) {
        expiredAppointments.push(doc.id);
      }
    });

    // Update all expired appointments to "vencido"
    if (expiredAppointments.length > 0) {
      const updatePromises = expiredAppointments.map((appointmentId) =>
        updateDoc(doc(db, COLLECTION_NAME, appointmentId), {
          status: "vencido",
          updatedAt: Timestamp.now(),
        }),
      );

      await Promise.all(updatePromises);
      console.log(
        `Updated ${expiredAppointments.length} expired appointment(s)`,
      );
    }
  } catch (error) {
    console.error("Error checking expired appointments:", error);
    // Don't throw error, just log it so it doesn't break the main flow
  }
};

// Get all appointments
export const getAllAppointments = async (): Promise<Appointment[]> => {
  try {
    // Check and update expired appointments before fetching
    await checkAndUpdateExpiredAppointments();

    const appointmentsQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy("date", "desc"),
    );

    const querySnapshot = await getDocs(appointmentsQuery);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      appointments.push(convertAppointmentDoc(doc));
    });

    return appointments;
  } catch (error) {
    console.error("Error getting appointments:", error);
    throw error;
  }
};

// Get appointments by user ID
export const getAppointmentsByUserId = async (
  userId: string,
): Promise<Appointment[]> => {
  try {
    // Check and update expired appointments before fetching
    await checkAndUpdateExpiredAppointments();

    const appointmentsQuery = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("date", "desc"),
    );

    const querySnapshot = await getDocs(appointmentsQuery);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      appointments.push(convertAppointmentDoc(doc));
    });

    return appointments;
  } catch (error) {
    console.error("Error getting user appointments:", error);
    throw error;
  }
};

// Get appointments by specialist ID
export const getAppointmentsBySpecialistId = async (
  specialistId: string,
): Promise<Appointment[]> => {
  try {
    const appointmentsQuery = query(
      collection(db, COLLECTION_NAME),
      where("specialistId", "==", specialistId),
      orderBy("date", "desc"),
    );

    const querySnapshot = await getDocs(appointmentsQuery);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      appointments.push(convertAppointmentDoc(doc));
    });

    return appointments;
  } catch (error) {
    console.error("Error getting specialist appointments:", error);
    throw error;
  }
};

// Get appointments by date range
export const getAppointmentsByDateRange = async (
  startDate: Date,
  endDate: Date,
): Promise<Appointment[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const appointmentsQuery = query(
      collection(db, COLLECTION_NAME),
      where("date", ">=", startTimestamp),
      where("date", "<=", endTimestamp),
      orderBy("date", "asc"),
    );

    const querySnapshot = await getDocs(appointmentsQuery);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      appointments.push(convertAppointmentDoc(doc));
    });

    return appointments;
  } catch (error) {
    console.error("Error getting appointments by date range:", error);
    throw error;
  }
};

// Get filtered appointments (with multiple conditions)
export const getFilteredAppointments = async (filters: {
  userId?: string;
  specialistId?: string;
  serviceType?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}): Promise<Appointment[]> => {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters.userId) {
      constraints.push(where("userId", "==", filters.userId));
    }

    if (filters.specialistId) {
      constraints.push(where("specialistId", "==", filters.specialistId));
    }

    if (filters.serviceType) {
      constraints.push(where("serviceType", "==", filters.serviceType));
    }

    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }

    if (filters.startDate) {
      constraints.push(
        where("date", ">=", Timestamp.fromDate(filters.startDate)),
      );
    }

    if (filters.endDate) {
      constraints.push(
        where("date", "<=", Timestamp.fromDate(filters.endDate)),
      );
    }

    // Add default ordering by date
    constraints.push(orderBy("date", "desc"));

    const appointmentsQuery = query(
      collection(db, COLLECTION_NAME),
      ...constraints,
    );
    const querySnapshot = await getDocs(appointmentsQuery);

    const appointments: Appointment[] = [];
    querySnapshot.forEach((doc) => {
      appointments.push(convertAppointmentDoc(doc));
    });

    return appointments;
  } catch (error) {
    console.error("Error getting filtered appointments:", error);
    throw error;
  }
};

// Get appointment by ID
export const getAppointmentById = async (
  id: string,
): Promise<Appointment | null> => {
  try {
    const appointmentDoc = await getDoc(doc(db, COLLECTION_NAME, id));

    if (appointmentDoc.exists()) {
      return convertAppointmentDoc(appointmentDoc);
    }

    return null;
  } catch (error) {
    console.error("Error getting appointment:", error);
    throw error;
  }
};

// Update appointment
export const updateAppointment = async (
  id: string,
  appointmentData: Partial<Omit<Appointment, "id" | "createdAt" | "updatedAt">>,
): Promise<void> => {
  try {
    // Obtener la cita actual antes de actualizarla para la notificación
    const currentAppointment = await getAppointmentById(id);

    const updateData: any = {
      ...appointmentData,
      updatedAt: Timestamp.now(),
    };

    // Convert Date objects to Firestore Timestamps
    if (appointmentData.date) {
      updateData.date = Timestamp.fromDate(appointmentData.date);
    }

    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);

    // Enviar notificación de actualización
    if (currentAppointment) {
      const updatedAppointment: Appointment = {
        ...currentAppointment,
        ...appointmentData,
        date: appointmentData.date || currentAppointment.date,
        time: appointmentData.time || currentAppointment.time,
        updatedAt: new Date(),
      };

      await sendAppointmentUpdatedNotification(updatedAppointment, {
        date: appointmentData.date,
        time: appointmentData.time,
      });
    }
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  id: string,
  status: AppointmentStatus,
  recommendations?: string,
): Promise<void> => {
  try {
    // Obtener la cita actual antes de actualizarla para la notificación
    const currentAppointment = await getAppointmentById(id);

    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (recommendations) {
      updateData.recommendations = recommendations;
    }

    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);

    // Enviar notificación de actualización
    if (currentAppointment) {
      const updatedAppointment: Appointment = {
        ...currentAppointment,
        status,
        recommendations: recommendations || currentAppointment.recommendations,
        updatedAt: new Date(),
      };

      await sendAppointmentUpdatedNotification(updatedAppointment, {
        status,
      });
    }
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};

// Delete appointment
export const deleteAppointment = async (id: string): Promise<void> => {
  try {
    // Obtener la cita antes de eliminarla para enviar la notificación
    const appointment = await getAppointmentById(id);

    await deleteDoc(doc(db, COLLECTION_NAME, id));

    // Enviar notificación de eliminación
    if (appointment) {
      await sendAppointmentDeletedNotification(appointment);
    }
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
};

// Create a new appointment
export const createAppointment = async (
  appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">,
): Promise<Appointment> => {
  try {
    const appointmentData = {
      ...appointment,
      date: Timestamp.fromDate(appointment.date),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTION_NAME),
      appointmentData,
    );

    const newAppointment: Appointment = {
      ...appointment,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Enviar notificación de creación
    await sendAppointmentCreatedNotification(newAppointment);

    return newAppointment;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};
