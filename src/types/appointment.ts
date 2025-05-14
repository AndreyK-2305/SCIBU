export type AppointmentStatus = "pendiente" | "realizado" | "cancelado";

export interface Appointment {
  id: string;
  date: Date;
  time: string;
  requesterName: string;
  requesterType: string; // Estudiante, Docente, etc.
  serviceType: string;
  specialistId: string;
  specialistName: string;
  status: AppointmentStatus;
  isFirstTime: boolean;
  disability: boolean;
  reason?: string;
  recommendations?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentFormData {
  date: Date;
  time: string;
  requesterName: string;
  requesterType: string;
  serviceType: string;
  specialistId: string;
  specialistName: string;
  status: AppointmentStatus;
  isFirstTime: boolean;
  disability: boolean;
  reason?: string;
  recommendations?: string;
}
