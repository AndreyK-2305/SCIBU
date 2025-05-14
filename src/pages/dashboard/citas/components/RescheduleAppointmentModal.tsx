import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateAppointment } from "@/services/appointment";
import { getSchedulesBySpecialistId } from "@/services/schedule";
import { Appointment } from "@/types/appointment";
import { Schedule } from "@/types/schedule";

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onAppointmentRescheduled: (updatedAppointment: Appointment) => void;
}

export default function RescheduleAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onAppointmentRescheduled,
}: RescheduleAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Load specialist schedules when component mounts
  useEffect(() => {
    const loadSchedules = async () => {
      if (!appointment.specialistId || !isOpen) return;

      try {
        setLoading(true);
        const schedules = await getSchedulesBySpecialistId(
          appointment.specialistId,
        );
        setAvailableSchedules(schedules);
      } catch (error) {
        console.error("Error loading specialist schedules:", error);
        toast.error("Error al cargar los horarios disponibles");
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [appointment.specialistId, isOpen]);

  // Update available times when date changes
  useEffect(() => {
    if (!selectedDate || availableSchedules.length === 0) {
      setAvailableTimes([]);
      return;
    }

    // Filter schedules for the selected date
    const dateSchedules = availableSchedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date);
      return (
        scheduleDate.getDate() === selectedDate.getDate() &&
        scheduleDate.getMonth() === selectedDate.getMonth() &&
        scheduleDate.getFullYear() === selectedDate.getFullYear()
      );
    });

    if (dateSchedules.length === 0) {
      setAvailableTimes([]);
      return;
    }

    // Generate available time slots
    const times: string[] = [];

    dateSchedules.forEach((schedule) => {
      // Generate time slots in 1-hour increments
      const [startHour, startMinute] = schedule.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = schedule.endTime.split(":").map(Number);

      const startDate = new Date();
      startDate.setHours(startHour, startMinute, 0);

      const endDate = new Date();
      endDate.setHours(endHour, endMinute, 0);

      // Create slots in 1-hour increments
      const currentSlot = new Date(startDate);
      while (currentSlot < endDate) {
        const formattedTime = format(currentSlot, "h:mm a");
        times.push(formattedTime);

        // Add one hour
        currentSlot.setTime(currentSlot.getTime() + 60 * 60 * 1000);
      }
    });

    setAvailableTimes([...new Set(times)].sort());
  }, [selectedDate, availableSchedules]);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time selection when date changes
  };

  // Check if a date has available schedules
  const hasSchedulesForDate = (date: Date): boolean => {
    return availableSchedules.some((schedule) => {
      const scheduleDate = new Date(schedule.date);
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Handle reschedule
  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Por favor seleccione una fecha y hora");
      return;
    }

    try {
      setLoading(true);

      // Update appointment with new date and time
      await updateAppointment(appointment.id, {
        date: selectedDate,
        time: selectedTime,
      });

      // Create updated appointment object
      const updatedAppointment: Appointment = {
        ...appointment,
        date: selectedDate,
        time: selectedTime,
        updatedAt: new Date(),
      };

      // Notify parent component
      onAppointmentRescheduled(updatedAppointment);
      toast.success("Cita reprogramada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Error al reprogramar la cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reprogramar Cita</DialogTitle>
          <DialogDescription>
            Seleccione una nueva fecha y hora para la cita con{" "}
            {appointment.specialistName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
          {/* Calendar */}
          <div>
            <Label className="mb-2 block font-medium">
              Seleccione una fecha
            </Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) =>
                date < new Date() || !hasSchedulesForDate(date)
              }
              className="rounded-md border"
              initialFocus
            />
          </div>

          {/* Time selection */}
          <div>
            <Label className="mb-2 block font-medium">
              Seleccione una hora
            </Label>
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600"></div>
                <span className="ml-2">Cargando horarios...</span>
              </div>
            ) : availableTimes.length > 0 ? (
              <RadioGroup
                value={selectedTime}
                onValueChange={setSelectedTime}
                className="space-y-2"
              >
                {availableTimes.map((time) => (
                  <div
                    key={time}
                    className="flex items-center space-x-2 rounded-md border p-2"
                  >
                    <RadioGroupItem value={time} id={time} />
                    <Label htmlFor={time} className="font-normal">
                      {time}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="rounded-md border border-gray-200 p-3 text-center text-gray-500">
                {selectedDate
                  ? "No hay horarios disponibles para esta fecha."
                  : "Seleccione una fecha para ver los horarios disponibles."}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleReschedule}
            disabled={loading || !selectedDate || !selectedTime}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Icon icon="ph:spinner" className="mr-2 h-4 w-4 animate-spin" />
                Reprogramando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
