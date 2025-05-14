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
  serverTimestamp,
  Timestamp,
  orderBy,
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

// Convert Firestore document to Appointment object
const convertDoc = (doc: any): Appointment => {
  try {
    const data = doc.data();

    if (!data) {
      console.warn("Documento sin datos:", doc.id);
      return {
        id: doc.id,
        date: new Date(),
        time: "",
        requesterName: "",
        requesterType: "",
        serviceType: "",
        specialistId: "",
        specialistName: "",
        status: "pendiente",
        isFirstTime: false,
        disability: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const appointment: Appointment = {
      id: doc.id,
      date:
        data.date instanceof Timestamp
          ? data.date.toDate()
          : new Date(data.date),
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
      createdAt: data.createdAt
        ? data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt)
        : new Date(),
      updatedAt: data.updatedAt
        ? data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : new Date(data.updatedAt)
        : new Date(),
    };

    return appointment;
  } catch (error) {
    console.error("Error al convertir documento de cita:", error);
    // Return a default appointment in case of error
    return {
      id: doc.id || "error-id",
      date: new Date(),
      time: "",
      requesterName: "Error al cargar cita",
      requesterType: "",
      serviceType: "",
      specialistId: "",
      specialistName: "",
      status: "pendiente",
      isFirstTime: false,
      disability: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
};

// Get all appointments
export const getAllAppointments = async (): Promise<Appointment[]> => {
  // In a real app, this would be an API call
  return getAppointmentsFromStorage();
};

// Get appointments by date
export const getAppointmentsByDate = async (
  date: Date,
): Promise<Appointment[]> => {
  const appointments = getAppointmentsFromStorage();
  return appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date);
    return (
      appointmentDate.getDate() === date.getDate() &&
      appointmentDate.getMonth() === date.getMonth() &&
      appointmentDate.getFullYear() === date.getFullYear()
    );
  });
};

// Create new appointment
export const createAppointment = async (
  appointmentData: Omit<
    Appointment,
    "id" | "status" | "createdAt" | "updatedAt"
  >,
): Promise<Appointment> => {
  const appointments = getAppointmentsFromStorage();

  const newAppointment: Appointment = {
    ...appointmentData,
    id: `appointment${Date.now()}`, // Generate a unique ID
    status: "pendiente",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedAppointments = [...appointments, newAppointment];
  saveAppointmentsToStorage(updatedAppointments);

  return newAppointment;
};

// Get appointments for a specific date
export const getAppointmentsBySpecialist = async (
  specialistId: string,
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("specialistId", "==", specialistId),
      orderBy("date", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => convertDoc(doc));
  } catch (error) {
    console.error("Error al obtener citas por especialista:", error);
    throw error;
  }
};

// Get a appointment by ID
export const getAppointmentById = async (
  id: string,
): Promise<Appointment | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertDoc(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener cita:", error);
    throw error;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  id: string,
  status: AppointmentStatus,
  recommendations?: string,
): Promise<Appointment> => {
  const appointments = getAppointmentsFromStorage();
  const appointment = appointments.find((a) => a.id === id);

  if (!appointment) {
    throw new Error(`Appointment with ID ${id} not found`);
  }

  const updatedAppointment: Appointment = {
    ...appointment,
    status,
    recommendations:
      recommendations !== undefined
        ? recommendations
        : appointment.recommendations,
    updatedAt: new Date(),
  };

  updateAppointmentInStorage(updatedAppointment);

  return updatedAppointment;
};

// Update appointment (for rescheduling)
export const updateAppointment = async (
  id: string,
  newDate: Date,
  newTime: string,
): Promise<Appointment> => {
  const appointments = getAppointmentsFromStorage();
  const appointment = appointments.find((a) => a.id === id);

  if (!appointment) {
    throw new Error(`Appointment with ID ${id} not found`);
  }

  const updatedAppointment: Appointment = {
    ...appointment,
    date: newDate,
    time: newTime,
    updatedAt: new Date(),
  };

  updateAppointmentInStorage(updatedAppointment);

  return updatedAppointment;
};

// Delete appointment
export const deleteAppointment = async (id: string): Promise<void> => {
  const appointments = getAppointmentsFromStorage();
  const updatedAppointments = appointments.filter((a) => a.id !== id);
  saveAppointmentsToStorage(updatedAppointments);
};
