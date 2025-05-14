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
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Get all appointments
export const getAllAppointments = async (): Promise<Appointment[]> => {
  try {
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
    const updateData: any = {
      ...appointmentData,
      updatedAt: Timestamp.now(),
    };

    // Convert Date objects to Firestore Timestamps
    if (appointmentData.date) {
      updateData.date = Timestamp.fromDate(appointmentData.date);
    }

    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
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
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (recommendations) {
      updateData.recommendations = recommendations;
    }

    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};

// Delete appointment
export const deleteAppointment = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
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

    return {
      ...appointment,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};
