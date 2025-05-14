import { Calendar } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Schedule, ScheduleFormData } from "@/types/schedule";
import { Specialist } from "@/types/specialist";

// Simple Select component
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      className={`flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleData: ScheduleFormData) => void;
  schedule?: Schedule;
  title: string;
  specialists: Specialist[];
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  schedule,
  title,
  specialists,
}: ScheduleModalProps) {
  const [specialistId, setSpecialistId] = useState("");
  const [specialistName, setSpecialistName] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (schedule) {
      setSpecialistId(schedule.specialistId);
      setSpecialistName(schedule.specialistName);
      setDate(formatDateForInput(schedule.date));
      setStartTime(schedule.startTime);
      setEndTime(schedule.endTime);
    } else {
      // Reset form when creating a new schedule
      setSpecialistId("");
      setSpecialistName("");
      setDate(formatDateForInput(new Date()));
      setStartTime("");
      setEndTime("");
    }
  }, [schedule, isOpen]);

  // Format date for date input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  // Handle specialist selection
  const handleSpecialistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSpecialistId(id);

    // Find specialist name based on ID
    const specialist = specialists.find((s) => s.id === id);
    setSpecialistName(specialist ? specialist.name : "");
  };

  const handleSave = () => {
    try {
      // Validate form
      if (!specialistId) {
        alert("Por favor seleccione un especialista");
        return;
      }

      if (!date) {
        alert("Por favor seleccione una fecha");
        return;
      }

      if (!startTime) {
        alert("Por favor ingrese una hora de inicio");
        return;
      }

      if (!endTime) {
        alert("Por favor ingrese una hora de fin");
        return;
      }

      // Prepare data for saving
      const scheduleData: ScheduleFormData = {
        specialistId,
        specialistName,
        date: new Date(date),
        startTime,
        endTime,
      };

      // Save the schedule
      onSave(scheduleData);
    } catch (error) {
      console.error("Error al intentar guardar el horario:", error);
      alert("Ocurrió un error al guardar. Por favor, inténtelo de nuevo.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Specialist Selection */}
          <div className="space-y-2">
            <Label htmlFor="specialist">Especialista</Label>
            <Select
              id="specialist"
              value={specialistId}
              onChange={handleSpecialistChange}
            >
              <option value="">Seleccione un especialista</option>
              {specialists.map((specialist) => (
                <option key={specialist.id} value={specialist.id}>
                  Dr. {specialist.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pr-10"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Calendar size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="startTime">Hora de Inicio</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="endTime">Hora de Fin</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-indigo-600"
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-indigo-600">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
