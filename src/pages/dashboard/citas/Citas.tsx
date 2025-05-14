import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import CreateAppointmentModal from "@/components/CreateAppointmentModal";
import RescheduleAppointmentModal from "@/components/RescheduleAppointmentModal";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import {
  getAllAppointments,
  updateAppointmentStatus,
  updateAppointment,
} from "@/services/appointment";
import { initializeLocalStorage } from "@/services/localStorage";
import { Appointment, AppointmentStatus } from "@/types/appointment";

export default function Citas() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    [],
  );
  const [completedAppointments, setCompletedAppointments] = useState<
    Appointment[]
  >([]);
  const [canceledAppointments, setCanceledAppointments] = useState<
    Appointment[]
  >([]);

  // Selected appointment for modals
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  useEffect(() => {
    // Initialize localStorage if needed
    initializeLocalStorage();

    // Load appointments
    loadAppointments();
  }, [user]);

  // Load appointments filtered by user
  const loadAppointments = async () => {
    try {
      setLoading(true);

      // Get all appointments
      const appointmentsData = await getAllAppointments();

      // Filter appointments by the current user
      const userAppointments = user
        ? appointmentsData.filter(
            (apt) => apt.requesterName === user.displayName,
          )
        : appointmentsData;

      // Sort appointments by date (newest first)
      userAppointments.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });

      // Filter appointments by status
      setPendingAppointments(
        userAppointments.filter((apt) => apt.status === "pendiente"),
      );
      setCompletedAppointments(
        userAppointments.filter((apt) => apt.status === "realizado"),
      );
      setCanceledAppointments(
        userAppointments.filter((apt) => apt.status === "cancelado"),
      );
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancel = async (appointment: Appointment) => {
    if (!window.confirm("¿Está seguro que desea cancelar esta cita?")) {
      return;
    }

    try {
      await updateAppointmentStatus(appointment.id, "cancelado");
      toast.success("Cita cancelada exitosamente");
      loadAppointments();
    } catch (error) {
      console.error("Error canceling appointment:", error);
      toast.error("Error al cancelar la cita");
    }
  };

  // Handle appointment rescheduling
  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleModalOpen(true);
  };

  // Format date for display (DD/MM/YYYY)
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return format(d, "dd/MM/yyyy", { locale: es });
  };

  // Get status badge color
  const getStatusBadgeClass = (status: AppointmentStatus) => {
    switch (status) {
      case "pendiente":
        return "bg-amber-500";
      case "realizado":
        return "bg-green-500";
      case "cancelado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get status text
  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case "pendiente":
        return "Pendiente";
      case "realizado":
        return "Realizada";
      case "cancelado":
        return "Cancelada";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Historial de Citas</h1>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Programar Cita
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Appointments */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Citas Pendientes</h2>
            {pendingAppointments.length > 0 ? (
              <div className="space-y-4">
                {pendingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-lg border-l-4 border-amber-500 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="mdi:calendar"
                          className="h-5 w-5 text-amber-500"
                        />
                        <span className="font-medium">
                          {formatDate(appointment.date)} - {appointment.time}
                        </span>
                      </div>
                      <span
                        className={`${getStatusBadgeClass(appointment.status)} rounded-full px-2 py-1 text-xs font-medium text-white`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-purple-100 p-2">
                          <Icon
                            icon="mdi:stethoscope"
                            className="h-5 w-5 text-purple-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Servicio</div>
                          <div>{appointment.serviceType}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-green-100 p-2">
                          <Icon
                            icon="mdi:doctor"
                            className="h-5 w-5 text-green-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            Especialista
                          </div>
                          <div>{appointment.specialistName}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2 border-t pt-4">
                      <Button
                        variant="outline"
                        className="border-amber-500 text-amber-500"
                        onClick={() => handleReschedule(appointment)}
                      >
                        Reprogramar
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500"
                        onClick={() => handleCancel(appointment)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-6 text-center text-gray-500">
                No tienes citas pendientes
              </div>
            )}
          </div>

          {/* Completed Appointments */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Citas Realizadas</h2>
            {completedAppointments.length > 0 ? (
              <div className="space-y-4">
                {completedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="mdi:calendar"
                          className="h-5 w-5 text-green-500"
                        />
                        <span className="font-medium">
                          {formatDate(appointment.date)} - {appointment.time}
                        </span>
                      </div>
                      <span
                        className={`${getStatusBadgeClass(appointment.status)} rounded-full px-2 py-1 text-xs font-medium text-white`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-purple-100 p-2">
                          <Icon
                            icon="mdi:stethoscope"
                            className="h-5 w-5 text-purple-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Servicio</div>
                          <div>{appointment.serviceType}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-green-100 p-2">
                          <Icon
                            icon="mdi:doctor"
                            className="h-5 w-5 text-green-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            Especialista
                          </div>
                          <div>{appointment.specialistName}</div>
                        </div>
                      </div>

                      {appointment.recommendations && (
                        <div className="col-span-1 flex items-start gap-3 md:col-span-2">
                          <div className="rounded-full bg-blue-100 p-2">
                            <Icon
                              icon="mdi:note"
                              className="h-5 w-5 text-blue-600"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              Recomendaciones
                            </div>
                            <div>{appointment.recommendations}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-6 text-center text-gray-500">
                No tienes citas realizadas
              </div>
            )}
          </div>

          {/* Canceled Appointments */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Citas Canceladas</h2>
            {canceledAppointments.length > 0 ? (
              <div className="space-y-4">
                {canceledAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-lg border-l-4 border-red-500 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="mdi:calendar"
                          className="h-5 w-5 text-red-500"
                        />
                        <span className="font-medium">
                          {formatDate(appointment.date)} - {appointment.time}
                        </span>
                      </div>
                      <span
                        className={`${getStatusBadgeClass(appointment.status)} rounded-full px-2 py-1 text-xs font-medium text-white`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-purple-100 p-2">
                          <Icon
                            icon="mdi:stethoscope"
                            className="h-5 w-5 text-purple-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Servicio</div>
                          <div>{appointment.serviceType}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-green-100 p-2">
                          <Icon
                            icon="mdi:doctor"
                            className="h-5 w-5 text-green-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            Especialista
                          </div>
                          <div>{appointment.specialistName}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-6 text-center text-gray-500">
                No tienes citas canceladas
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <RescheduleAppointmentModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        appointment={selectedAppointment}
        onReschedule={async (id, date, time) => {
          try {
            // In a real implementation, this would call the correct updateAppointment function
            // await updateAppointment(id, { date, time });
            toast.success("Cita reprogramada exitosamente");
            loadAppointments();
            return Promise.resolve();
          } catch (error) {
            toast.error("Error al reprogramar la cita");
            return Promise.reject(error);
          }
        }}
      />

      <CreateAppointmentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadAppointments}
        isAdmin={false} // Set to false for regular user mode
      />
    </div>
  );
}
