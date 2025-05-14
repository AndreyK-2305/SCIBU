import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import Calendar from "@/components/Calendar";
import ScheduleItem from "@/components/ScheduleItem";
import ScheduleModal from "@/components/ScheduleModal";
import { Button } from "@/components/ui/button";
import { sampleSchedules, sampleSpecialists } from "@/data/sampleData";
import { Schedule, ScheduleFormData } from "@/types/schedule";
import { Specialist } from "@/types/specialist";

export default function Horarios() {
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

  // Load data on initial render
  useEffect(() => {
    // Simulate loading
    setLoading(true);

    setTimeout(() => {
      setSchedules(sampleSchedules);
      setSpecialists(sampleSpecialists);
      setLoading(false);
    }, 1000);
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
  const handleDeleteSchedule = (schedule: Schedule) => {
    if (window.confirm("¿Está seguro de que desea eliminar este horario?")) {
      // Remove the schedule from the local state
      setSchedules(schedules.filter((s) => s.id !== schedule.id));
      toast.success("Horario eliminado exitosamente");
    }
  };

  // Function to save a schedule (new or edited)
  const handleSaveSchedule = (scheduleData: ScheduleFormData) => {
    if (currentSchedule) {
      // Update existing schedule
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
      // Create new schedule with a generated ID
      const newSchedule: Schedule = {
        ...scheduleData,
        id: `schedule${schedules.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSchedules([...schedules, newSchedule]);
      toast.success("Horario creado exitosamente");
    }

    // Close the modal
    setIsModalOpen(false);
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

          {/* Schedule list or empty message */}
          {!loading &&
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
