import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import Calendar from "@/components/Calendar";
import ScheduleItem from "@/components/ScheduleItem";
import ScheduleModal from "@/components/ScheduleModal";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "@/services/schedule";
import { getAllSpecialists } from "@/services/specialist";
import { isUserAdmin } from "@/services/user";
import { Schedule, ScheduleFormData } from "@/types/schedule";
import { Specialist } from "@/types/specialist";

export default function Horarios() {
  // Authentication
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // State for schedules
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for specialists
  const [specialists, setSpecialists] = useState<Specialist[]>([]);

  // State for selected date
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | undefined>(
    undefined,
  );
  const [modalTitle, setModalTitle] = useState("Agregar Horario");

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const adminStatus = await isUserAdmin(user.uid);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  // Load data on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch schedules from Firebase
        const loadedSchedules = await getAllSchedules();
        setSchedules(loadedSchedules);

        // Fetch specialists from Firebase (only active ones)
        const loadedSpecialists = await getAllSpecialists();
        setSpecialists(loadedSpecialists.filter((s) => s.isActive));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos. Intente nuevamente.");
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to open the modal for creating a new schedule
  const handleAddSchedule = () => {
    setCurrentSchedule(undefined);
    setModalTitle("Agregar Horario");
    setIsModalOpen(true);
  };

  // Function to open the modal for editing a schedule
  const handleEditSchedule = (schedule: Schedule) => {
    setCurrentSchedule(schedule);
    setModalTitle("Editar Horario");
    setIsModalOpen(true);
  };

  // Function to delete a schedule
  const handleDeleteSchedule = async (schedule: Schedule) => {
    if (window.confirm("¿Está seguro de que desea eliminar este horario?")) {
      try {
        // Delete the schedule in Firebase
        await deleteSchedule(schedule.id);

        // Remove the schedule from the local state
        setSchedules(schedules.filter((s) => s.id !== schedule.id));
        toast.success("Horario eliminado exitosamente");
      } catch (error) {
        console.error("Error deleting schedule:", error);
        toast.error("Error al eliminar el horario");
      }
    }
  };

  // Function to save a schedule (new or edited)
  const handleSaveSchedule = async (scheduleData: ScheduleFormData) => {
    try {
      if (currentSchedule) {
        // Update existing schedule in Firebase
        await updateSchedule(currentSchedule.id, scheduleData);

        // Update the schedule in the local state
        const updatedSchedules = schedules.map((s) =>
          s.id === currentSchedule.id
            ? {
                ...s,
                ...scheduleData,
                updatedAt: new Date(),
              }
            : s,
        );

        setSchedules(updatedSchedules);
        toast.success("Horario actualizado exitosamente");
      } else {
        // Create new schedule in Firebase
        const newSchedule = await createSchedule(scheduleData);

        // Add the new schedule to the local state
        setSchedules([...schedules, newSchedule]);
        toast.success("Horario creado exitosamente");
      }

      // Close the modal
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Error al guardar el horario");
    }
  };

  // Function to handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Filter schedules by selected date
  const filteredSchedules = schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date);
    return (
      scheduleDate.getDate() === selectedDate.getDate() &&
      scheduleDate.getMonth() === selectedDate.getMonth() &&
      scheduleDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Component for empty state
  const EmptyState = () => (
    <div className="rounded-lg border p-6 text-center">
      <p className="mb-4 text-gray-500">
        No hay horarios registrados para esta fecha
      </p>
      <Button onClick={handleAddSchedule} className="bg-indigo-600">
        Agregar Horario
      </Button>
    </div>
  );

  // Component for loading state
  const LoadingState = () => (
    <div className="flex justify-center py-8">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600">Cargando horarios...</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      {/* Header section */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Horarios</h1>
        <Button onClick={handleAddSchedule} className="bg-indigo-600">
          Crear
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Calendar section */}
        <div className="md:col-span-5">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* Schedules section */}
        <div className="md:col-span-7">
          <h2 className="mb-4 text-xl font-bold">Listado de horarios</h2>

          {/* Loading state */}
          {loading && <LoadingState />}

          {/* Error state */}
          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-2 bg-red-600 hover:bg-red-700"
              >
                Reintentar
              </Button>
            </div>
          )}

          {/* Schedule list or empty message */}
          {!loading &&
            !error &&
            (filteredSchedules.length > 0 ? (
              <div className="space-y-2">
                {filteredSchedules.map((schedule) => (
                  <ScheduleItem
                    key={schedule.id}
                    schedule={schedule}
                    onEdit={() => handleEditSchedule(schedule)}
                    onDelete={() => handleDeleteSchedule(schedule)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            ))}
        </div>
      </div>

      {/* Modal for creating/editing schedules */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchedule}
        schedule={currentSchedule}
        title={modalTitle}
        specialists={specialists}
      />
    </div>
  );
}
