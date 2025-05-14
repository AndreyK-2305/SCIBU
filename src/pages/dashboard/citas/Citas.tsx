import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import AppointmentCard from "@/components/AppointmentCard";
import CreateAppointmentModal from "@/components/CreateAppointmentModal";
import RescheduleAppointmentModal from "@/components/RescheduleAppointmentModal";
import UpdateAppointmentStatusModal from "@/components/UpdateAppointmentStatusModal";
import { Button } from "@/components/ui/button";
import {
  getAllAppointments,
  getAppointmentsByDate,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
} from "@/services/appointment";
import { initializeLocalStorage } from "@/services/localStorage";
import { Appointment, AppointmentStatus } from "@/types/appointment";

export default function Citas() {
  // State for appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for selected date
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // State for status update modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // State for reschedule modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  // State for create appointment modal
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Initialize localStorage on first render
  useEffect(() => {
    // Initialize localStorage with sample data if empty
    initializeLocalStorage();
  }, []);

  // Load appointments on initial render or when selectedDate changes
  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  // Function to load appointments
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      let appointmentsData: Appointment[];

      if (selectedDate) {
        // Get appointments for the selected date
        appointmentsData = await getAppointmentsByDate(selectedDate);
      } else {
        // Get all appointments if no date is selected
        appointmentsData = await getAllAppointments();
      }

      setAppointments(appointmentsData);
    } catch (err) {
      console.error("Error al cargar citas:", err);
      setError(
        "No se pudieron cargar las citas. Por favor, inténtelo de nuevo.",
      );
      toast.error("Error al cargar citas. Inténtelo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Function to open the status update modal
  const handleOpenStatusModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setStatusModalOpen(true);
  };

  // Function to update appointment status
  const handleUpdateStatus = async (
    id: string,
    status: AppointmentStatus,
    recommendations?: string,
  ) => {
    try {
      // Update in the backend/localStorage
      await updateAppointmentStatus(id, status, recommendations);

      // Update local state
      setAppointments(
        appointments.map((a) =>
          a.id === id
            ? {
                ...a,
                status,
                recommendations: recommendations || a.recommendations,
                updatedAt: new Date(),
              }
            : a,
        ),
      );

      toast.success(
        `Estado de la cita actualizado a ${status === "realizado" ? "Realizado" : status === "cancelado" ? "Cancelado" : "Pendiente"}`,
      );
    } catch (err) {
      console.error("Error al actualizar estado de la cita:", err);
      toast.error(
        "No se pudo actualizar el estado de la cita. Inténtelo nuevamente.",
      );
    }
  };

  // Function to handle rescheduling an appointment
  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleModalOpen(true);
  };

  // Function to handle the actual rescheduling
  const handleRescheduleAppointment = async (
    appointmentId: string,
    newDate: Date,
    newTime: string,
  ) => {
    try {
      // Update in backend/localStorage
      await updateAppointment(appointmentId, newDate, newTime);

      // Update local state
      setAppointments(
        appointments.map((a) =>
          a.id === appointmentId
            ? {
                ...a,
                date: newDate,
                time: newTime,
                updatedAt: new Date(),
              }
            : a,
        ),
      );

      toast.success("Cita reprogramada exitosamente");
    } catch (err) {
      console.error("Error al reprogramar la cita:", err);
      toast.error("No se pudo reprogramar la cita. Inténtelo nuevamente.");
      throw err; // Rethrow the error so the modal can handle it
    }
  };

  // Function to handle creating a new appointment
  const handleCreateAppointment = () => {
    setCreateModalOpen(true);
  };

  // Function to handle canceling an appointment
  const handleCancel = async (appointment: Appointment) => {
    if (window.confirm("¿Está seguro de que desea cancelar esta cita?")) {
      try {
        await handleUpdateStatus(appointment.id, "cancelado");
        toast.success("Cita cancelada exitosamente");
      } catch (err) {
        console.error("Error al cancelar la cita:", err);
        toast.error("No se pudo cancelar la cita. Inténtelo nuevamente.");
      }
    }
  };

  // Group appointments by date
  const groupAppointmentsByDate = (): Record<string, Appointment[]> => {
    const grouped: Record<string, Appointment[]> = {};

    appointments.forEach((appointment) => {
      const dateStr =
        appointment.date instanceof Date
          ? appointment.date.toLocaleDateString()
          : new Date(appointment.date).toLocaleDateString();

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }

      grouped[dateStr].push(appointment);
    });

    return grouped;
  };

  // Format date for display (DD/MM/YYYY)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  // Component for empty state
  const EmptyState = () => (
    <div className="rounded-lg border p-6 text-center">
      <p className="mb-4 text-gray-500">
        No hay citas registradas para esta fecha
      </p>
      <Button className="bg-indigo-600" onClick={handleCreateAppointment}>
        Agendar Cita
      </Button>
    </div>
  );

  // Component for loading state
  const LoadingState = () => (
    <div className="flex justify-center py-8">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600">Cargando citas...</p>
      </div>
    </div>
  );

  // Component for error state
  const ErrorState = () => (
    <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-600">
      <p>{error}</p>
      <Button
        variant="outline"
        onClick={loadAppointments}
        className="mt-2 border-red-600 text-red-600"
      >
        Reintentar
      </Button>
    </div>
  );

  // Group appointments by date
  const groupedAppointments = groupAppointmentsByDate();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header section */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Citas</h1>
        <Button onClick={handleCreateAppointment} className="bg-indigo-600">
          Agendar
        </Button>
      </div>

      {/* Date picker (placeholder for now) */}
      {/* <DateRangePicker /> */}

      {/* Loading state */}
      {loading && <LoadingState />}

      {/* Error state */}
      {error && !loading && <ErrorState />}

      {/* No appointments */}
      {!loading && !error && appointments.length === 0 && <EmptyState />}

      {/* Appointments by date */}
      {!loading && !error && Object.keys(groupedAppointments).length > 0 && (
        <div className="space-y-8">
          {Object.entries(groupedAppointments).map(
            ([dateStr, dateAppointments]) => (
              <div key={dateStr}>
                <h2 className="mb-4 text-xl font-semibold">
                  {formatDate(dateStr)}
                </h2>
                <div className="space-y-4">
                  {dateAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onUpdateStatus={handleUpdateStatus}
                      onOpenStatusModal={handleOpenStatusModal}
                      onReschedule={handleReschedule}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* Update Status Modal */}
      <UpdateAppointmentStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        appointment={selectedAppointment}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Reschedule Modal */}
      <RescheduleAppointmentModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        appointment={selectedAppointment}
        onReschedule={handleRescheduleAppointment}
      />

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadAppointments}
        isAdmin={true} // Set to true for administrator mode
      />
    </div>
  );
}
