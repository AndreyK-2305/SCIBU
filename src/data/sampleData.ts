import { Appointment } from "@/types/appointment";
import { Schedule } from "@/types/schedule";
import { Service } from "@/types/service";
import { Specialist } from "@/types/specialist";

// Sample Services
export const sampleServices: Service[] = [
  {
    id: "service1",
    title: "Consulta Odontológica",
    description: "Atención dental general, diagnóstico y tratamiento básico.",
    isActive: true,
    specialists: ["specialist1", "specialist3"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "service2",
    title: "Asesoría Psicológica",
    description:
      "Sesiones de orientación y apoyo psicológico para estudiantes y personal.",
    isActive: true,
    specialists: ["specialist2"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "service3",
    title: "Asesoría Psicosocial",
    description:
      "Apoyo integral para situaciones que afectan el bienestar social y emocional.",
    isActive: true,
    specialists: ["specialist2"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "service4",
    title: "Asesoría Espiritual",
    description:
      "Orientación y acompañamiento espiritual para toda la comunidad universitaria.",
    isActive: true,
    specialists: ["specialist4"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
];

// Sample Specialists
export const sampleSpecialists: Specialist[] = [
  {
    id: "specialist1",
    name: "Pérez",
    email: "drperez@ufps.edu.co",
    phone: "3012345678",
    services: ["Consulta Odontológica"],
    isActive: true,
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2023-01-10"),
  },
  {
    id: "specialist2",
    name: "Rodríguez",
    email: "drodriguez@ufps.edu.co",
    phone: "3023456789",
    services: ["Asesoría Psicológica", "Asesoría Psicosocial"],
    isActive: true,
    createdAt: new Date("2023-01-12"),
    updatedAt: new Date("2023-01-12"),
  },
  {
    id: "specialist3",
    name: "González",
    email: "dgonzalez@ufps.edu.co",
    phone: "3034567890",
    services: ["Consulta Odontológica"],
    isActive: true,
    createdAt: new Date("2023-02-05"),
    updatedAt: new Date("2023-02-05"),
  },
  {
    id: "specialist4",
    name: "Martínez",
    email: "dmartinez@ufps.edu.co",
    phone: "3045678901",
    services: ["Asesoría Espiritual"],
    isActive: true,
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-10"),
  },
];

// Get current date for schedules
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const nextWeekPlusOne = new Date(today);
nextWeekPlusOne.setDate(nextWeek.getDate() + 1);
const nextWeekPlusTwo = new Date(today);
nextWeekPlusTwo.setDate(nextWeek.getDate() + 2);

// Sample Schedules
export const sampleSchedules: Schedule[] = [
  // Original schedules
  {
    id: "schedule1",
    specialistId: "specialist1",
    specialistName: "Pérez",
    date: new Date("2023-03-25"),
    startTime: "08:00",
    endTime: "12:00",
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2023-03-01"),
  },
  {
    id: "schedule2",
    specialistId: "specialist1",
    specialistName: "Pérez",
    date: new Date("2023-03-26"),
    startTime: "14:00",
    endTime: "18:00",
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2023-03-01"),
  },
  {
    id: "schedule3",
    specialistId: "specialist2",
    specialistName: "Rodríguez",
    date: new Date("2023-03-25"),
    startTime: "09:00",
    endTime: "15:00",
    createdAt: new Date("2023-03-02"),
    updatedAt: new Date("2023-03-02"),
  },
  {
    id: "schedule4",
    specialistId: "specialist3",
    specialistName: "González",
    date: new Date("2023-03-27"),
    startTime: "08:00",
    endTime: "13:00",
    createdAt: new Date("2023-03-02"),
    updatedAt: new Date("2023-03-02"),
  },

  // New schedules for current/upcoming dates
  // Dr. Pérez (specialist1) schedules - Current week
  {
    id: "schedule5",
    specialistId: "specialist1",
    specialistName: "Pérez",
    date: today,
    startTime: "08:00",
    endTime: "12:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "schedule6",
    specialistId: "specialist1",
    specialistName: "Pérez",
    date: tomorrow,
    startTime: "14:00",
    endTime: "18:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "schedule7",
    specialistId: "specialist1",
    specialistName: "Pérez",
    date: dayAfterTomorrow,
    startTime: "09:00",
    endTime: "15:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Dr. Rodríguez (specialist2) schedules - Current week
  {
    id: "schedule8",
    specialistId: "specialist2",
    specialistName: "Rodríguez",
    date: today,
    startTime: "10:00",
    endTime: "17:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "schedule9",
    specialistId: "specialist2",
    specialistName: "Rodríguez",
    date: tomorrow,
    startTime: "09:00",
    endTime: "13:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Dr. González (specialist3) schedules - Current week
  {
    id: "schedule10",
    specialistId: "specialist3",
    specialistName: "González",
    date: tomorrow,
    startTime: "08:00",
    endTime: "12:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "schedule11",
    specialistId: "specialist3",
    specialistName: "González",
    date: dayAfterTomorrow,
    startTime: "14:00",
    endTime: "18:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Dr. Martínez (specialist4) schedules - Current week
  {
    id: "schedule12",
    specialistId: "specialist4",
    specialistName: "Martínez",
    date: today,
    startTime: "13:00",
    endTime: "17:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "schedule13",
    specialistId: "specialist4",
    specialistName: "Martínez",
    date: dayAfterTomorrow,
    startTime: "10:00",
    endTime: "16:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Next week schedules
  {
    id: "schedule14",
    specialistId: "specialist1",
    specialistName: "Pérez",
    date: nextWeek,
    startTime: "08:00",
    endTime: "12:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "schedule15",
    specialistId: "specialist2",
    specialistName: "Rodríguez",
    date: nextWeek,
    startTime: "13:00",
    endTime: "17:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "schedule16",
    specialistId: "specialist3",
    specialistName: "González",
    date: nextWeekPlusOne,
    startTime: "09:00",
    endTime: "15:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "schedule17",
    specialistId: "specialist4",
    specialistName: "Martínez",
    date: nextWeekPlusTwo,
    startTime: "10:00",
    endTime: "16:00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample Appointments
export const sampleAppointments: Appointment[] = [
  // Original appointments
  {
    id: "appointment1",
    date: new Date("2023-03-20"),
    time: "10:00 a.m.",
    requesterName: "Pepito Pérez",
    requesterType: "Estudiante",
    serviceType: "Consulta Odontológica",
    specialistId: "specialist1",
    specialistName: "Pérez",
    status: "pendiente",
    isFirstTime: false,
    disability: false,
    createdAt: new Date("2023-03-15"),
    updatedAt: new Date("2023-03-15"),
  },
  {
    id: "appointment2",
    date: new Date("2023-03-20"),
    time: "9:00 a.m.",
    requesterName: "Ana Gómez",
    requesterType: "Estudiante",
    serviceType: "Asesoría Psicológica",
    specialistId: "specialist2",
    specialistName: "Rodríguez",
    status: "pendiente",
    isFirstTime: true,
    disability: false,
    reason: "Ansiedad por exámenes finales",
    createdAt: new Date("2023-03-14"),
    updatedAt: new Date("2023-03-14"),
  },
  {
    id: "appointment3",
    date: new Date("2023-03-20"),
    time: "8:00 a.m.",
    requesterName: "Carlos Jiménez",
    requesterType: "Docente",
    serviceType: "Consulta Odontológica",
    specialistId: "specialist3",
    specialistName: "González",
    status: "realizado",
    isFirstTime: false,
    disability: false,
    reason: "Dolor en muela",
    recommendations:
      "Se recomienda continuar con higiene dental adecuada y revisión en 6 meses",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-20"),
  },
  {
    id: "appointment4",
    date: new Date("2023-03-21"),
    time: "11:00 a.m.",
    requesterName: "Laura Torres",
    requesterType: "Estudiante",
    serviceType: "Asesoría Espiritual",
    specialistId: "specialist4",
    specialistName: "Martínez",
    status: "pendiente",
    isFirstTime: true,
    disability: false,
    reason: "Orientación personal",
    createdAt: new Date("2023-03-16"),
    updatedAt: new Date("2023-03-16"),
  },

  // Current day appointments
  {
    id: "appointment5",
    date: today,
    time: "09:00 a.m.",
    requesterName: "Juan Velásquez",
    requesterType: "Estudiante",
    serviceType: "Consulta Odontológica",
    specialistId: "specialist1",
    specialistName: "Pérez",
    status: "pendiente",
    isFirstTime: true,
    disability: false,
    reason: "Chequeo semestral",
    createdAt: new Date(today.getTime() - 86400000 * 3), // 3 days ago
    updatedAt: new Date(today.getTime() - 86400000 * 3),
  },
  {
    id: "appointment6",
    date: today,
    time: "11:30 a.m.",
    requesterName: "María Castellanos",
    requesterType: "Administrativo",
    serviceType: "Consulta Odontológica",
    specialistId: "specialist1",
    specialistName: "Pérez",
    status: "pendiente",
    isFirstTime: false,
    disability: false,
    reason: "Seguimiento tratamiento conducto",
    createdAt: new Date(today.getTime() - 86400000 * 2), // 2 days ago
    updatedAt: new Date(today.getTime() - 86400000 * 2),
  },
  {
    id: "appointment7",
    date: today,
    time: "14:30 p.m.",
    requesterName: "Felipe Rojas",
    requesterType: "Estudiante",
    serviceType: "Asesoría Psicológica",
    specialistId: "specialist2",
    specialistName: "Rodríguez",
    status: "pendiente",
    isFirstTime: false,
    disability: false,
    reason: "Seguimiento terapia",
    createdAt: new Date(today.getTime() - 86400000 * 5), // 5 days ago
    updatedAt: new Date(today.getTime() - 86400000 * 5),
  },
  {
    id: "appointment8",
    date: today,
    time: "15:30 p.m.",
    requesterName: "Carolina Mendoza",
    requesterType: "Docente",
    serviceType: "Asesoría Espiritual",
    specialistId: "specialist4",
    specialistName: "Martínez",
    status: "pendiente",
    isFirstTime: true,
    disability: false,
    reason: "Consejería personal",
    createdAt: new Date(today.getTime() - 86400000 * 1), // 1 day ago
    updatedAt: new Date(today.getTime() - 86400000 * 1),
  },

  // Tomorrow appointments
  {
    id: "appointment9",
    date: tomorrow,
    time: "10:00 a.m.",
    requesterName: "Pedro Gallego",
    requesterType: "Estudiante",
    serviceType: "Consulta Odontológica",
    specialistId: "specialist3",
    specialistName: "González",
    status: "pendiente",
    isFirstTime: false,
    disability: true,
    reason: "Limpieza dental",
    createdAt: new Date(today.getTime() - 86400000 * 4), // 4 days ago
    updatedAt: new Date(today.getTime() - 86400000 * 4),
  },
  {
    id: "appointment10",
    date: tomorrow,
    time: "11:30 a.m.",
    requesterName: "Isabella Vargas",
    requesterType: "Estudiante",
    serviceType: "Asesoría Psicológica",
    specialistId: "specialist2",
    specialistName: "Rodríguez",
    status: "pendiente",
    isFirstTime: true,
    disability: false,
    reason: "Problemas de adaptación universitaria",
    createdAt: new Date(today.getTime() - 86400000 * 2), // 2 days ago
    updatedAt: new Date(today.getTime() - 86400000 * 2),
  },

  // Day after tomorrow appointments
  {
    id: "appointment11",
    date: dayAfterTomorrow,
    time: "09:30 a.m.",
    requesterName: "Daniela Moreno",
    requesterType: "Estudiante",
    serviceType: "Consulta Odontológica",
    specialistId: "specialist1",
    specialistName: "Pérez",
    status: "pendiente",
    isFirstTime: false,
    disability: false,
    reason: "Revisión brackets",
    createdAt: new Date(today.getTime() - 86400000 * 7), // 7 days ago
    updatedAt: new Date(today.getTime() - 86400000 * 7),
  },
  {
    id: "appointment12",
    date: dayAfterTomorrow,
    time: "14:00 p.m.",
    requesterName: "Javier Santos",
    requesterType: "Administrativo",
    serviceType: "Asesoría Espiritual",
    specialistId: "specialist4",
    specialistName: "Martínez",
    status: "pendiente",
    isFirstTime: false,
    disability: false,
    reason: "Consejería familiar",
    createdAt: new Date(today.getTime() - 86400000 * 3), // 3 days ago
    updatedAt: new Date(today.getTime() - 86400000 * 3),
  },
];
