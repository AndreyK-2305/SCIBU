import {
  sampleAppointments,
  sampleServices,
  sampleSpecialists,
  sampleSchedules,
} from "@/data/sampleData";
import { Appointment } from "@/types/appointment";
import { Schedule } from "@/types/schedule";
import { Service } from "@/types/service";
import { Specialist } from "@/types/specialist";

// Storage keys
const STORAGE_KEYS = {
  APPOINTMENTS: "sisgelab_appointments",
  SERVICES: "sisgelab_services",
  SPECIALISTS: "sisgelab_specialists",
  SCHEDULES: "sisgelab_schedules",
};

// Initialize localStorage with sample data if it's empty
export const initializeLocalStorage = () => {
  // Check if appointments exist in localStorage
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(
      STORAGE_KEYS.APPOINTMENTS,
      JSON.stringify(sampleAppointments),
    );
  }

  // Check if services exist in localStorage
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(sampleServices));
  }

  // Check if specialists exist in localStorage
  if (!localStorage.getItem(STORAGE_KEYS.SPECIALISTS)) {
    localStorage.setItem(
      STORAGE_KEYS.SPECIALISTS,
      JSON.stringify(sampleSpecialists),
    );
  }

  // Check if schedules exist in localStorage
  if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
    localStorage.setItem(
      STORAGE_KEYS.SCHEDULES,
      JSON.stringify(sampleSchedules),
    );
  }
};

// Helper to convert date strings back to Date objects
const parseJSONDates = (data: any): any => {
  const dateProperties = ["date", "createdAt", "updatedAt"];

  if (Array.isArray(data)) {
    return data.map((item) => parseJSONDates(item));
  }

  if (data !== null && typeof data === "object") {
    for (const key in data) {
      if (dateProperties.includes(key) && typeof data[key] === "string") {
        data[key] = new Date(data[key]);
      } else if (typeof data[key] === "object") {
        data[key] = parseJSONDates(data[key]);
      }
    }
  }

  return data;
};

// Appointments
export const getAppointmentsFromStorage = (): Appointment[] => {
  const appointmentsJSON = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  if (!appointmentsJSON) return [];

  try {
    const parsedData = JSON.parse(appointmentsJSON);
    return parseJSONDates(parsedData);
  } catch (error) {
    console.error("Error parsing appointments from localStorage:", error);
    return [];
  }
};

export const saveAppointmentsToStorage = (
  appointments: Appointment[],
): void => {
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
};

export const updateAppointmentInStorage = (
  updatedAppointment: Appointment,
): void => {
  const appointments = getAppointmentsFromStorage();
  const updatedAppointments = appointments.map((appointment) =>
    appointment.id === updatedAppointment.id ? updatedAppointment : appointment,
  );
  saveAppointmentsToStorage(updatedAppointments);
};

// Services
export const getServicesFromStorage = (): Service[] => {
  const servicesJSON = localStorage.getItem(STORAGE_KEYS.SERVICES);
  if (!servicesJSON) return [];

  try {
    const parsedData = JSON.parse(servicesJSON);
    return parseJSONDates(parsedData);
  } catch (error) {
    console.error("Error parsing services from localStorage:", error);
    return [];
  }
};

export const saveServicesToStorage = (services: Service[]): void => {
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
};

// Specialists
export const getSpecialistsFromStorage = (): Specialist[] => {
  const specialistsJSON = localStorage.getItem(STORAGE_KEYS.SPECIALISTS);
  if (!specialistsJSON) return [];

  try {
    const parsedData = JSON.parse(specialistsJSON);
    return parseJSONDates(parsedData);
  } catch (error) {
    console.error("Error parsing specialists from localStorage:", error);
    return [];
  }
};

export const saveSpecialistsToStorage = (specialists: Specialist[]): void => {
  localStorage.setItem(STORAGE_KEYS.SPECIALISTS, JSON.stringify(specialists));
};

// Schedules
export const getSchedulesFromStorage = (): Schedule[] => {
  const schedulesJSON = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
  if (!schedulesJSON) return [];

  try {
    const parsedData = JSON.parse(schedulesJSON);
    return parseJSONDates(parsedData);
  } catch (error) {
    console.error("Error parsing schedules from localStorage:", error);
    return [];
  }
};

export const saveSchedulesToStorage = (schedules: Schedule[]): void => {
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
};
