import { format } from "date-fns";
import { es } from "date-fns/locale";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getOccupiedTimeSlots } from "@/services/appointment";
import { getSchedulesByDate } from "@/services/schedule";
import { Appointment } from "@/types/appointment";
import { Schedule } from "@/types/schedule";

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onReschedule: (
    appointmentId: string,
    newDate: Date,
    newTime: string,
  ) => Promise<void>;
}

export default function RescheduleAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onReschedule,
}: RescheduleAppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    appointment ? new Date(appointment.date) : undefined,
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadAvailableTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  // Helper function to generate time slots in 30-minute increments
  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const timeSlots: string[] = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    const formatTimeSlot = (hour: number, minute: number) => {
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    };

    // Convert start and end times to minutes for easier comparison
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    // Generate 30-minute slots
    for (
      let timeInMinutes = startTimeInMinutes;
      timeInMinutes < endTimeInMinutes;
      timeInMinutes += 30
    ) {
      const hour = Math.floor(timeInMinutes / 60);
      const minute = timeInMinutes % 60;
      timeSlots.push(formatTimeSlot(hour, minute));
    }

    return timeSlots;
  };

  // Function to load available time slots for the selected date
  const loadAvailableTimeSlots = async (date: Date) => {
    try {
      setLoading(true);

      if (!appointment?.specialistId) {
        setAvailableTimeSlots([]);
        return;
      }

      // Get all schedules for this date
      const schedules = await getSchedulesByDate(date);

      // Generate time slots from schedule start and end times
      const timeSlots = schedules.reduce(
        (slots: string[], schedule: Schedule) => {
          if (schedule.specialistId === appointment.specialistId) {
            // Generate time slots based on start and end times
            const generatedSlots = generateTimeSlots(
              schedule.startTime,
              schedule.endTime,
            );
            return [...slots, ...generatedSlots];
          }
          return slots;
        },
        [],
      );

      // Remove duplicates and sort
      const uniqueTimeSlots = [...new Set(timeSlots)].sort();

      // Get occupied time slots for this date and specialist
      // Exclude the current appointment being rescheduled
      const occupiedTimeSlots = await getOccupiedTimeSlots(
        date,
        appointment.specialistId,
        appointment.id, // Exclude current appointment
        "HH:mm", // Return in HH:mm format to match generated slots
      );

      // Filter out occupied time slots
      const availableTimeSlots = uniqueTimeSlots.filter(
        (slot) => !occupiedTimeSlots.includes(slot),
      );

      setAvailableTimeSlots(availableTimeSlots);

      // Select the first time slot by default if available
      if (availableTimeSlots.length > 0 && !selectedTime) {
        setSelectedTime(availableTimeSlots[0]);
      } else if (availableTimeSlots.length === 0) {
        // Reset selected time if no slots are available
        setSelectedTime("");
      }
    } catch (error) {
      console.error("Error loading available time slots:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle save button click
  const handleSave = async () => {
    if (!appointment || !selectedDate || !selectedTime) return;

    try {
      setLoading(true);
      await onReschedule(appointment.id, selectedDate, selectedTime);
      onClose();
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date for month display
  const formatMonth = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "MMM yyyy", { locale: es });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Reprogramar Cita</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Calendar */}
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={es}
              className="rounded-md border"
              disabled={(date) => {
                // Disable dates in the past
                return date < new Date(new Date().setHours(0, 0, 0, 0));
              }}
            />
          </div>

          {/* Time slots */}
          <div>
            <h3 className="mb-4 font-medium">Listado de horarios</h3>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : availableTimeSlots.length > 0 ? (
              <RadioGroup
                value={selectedTime}
                onValueChange={setSelectedTime}
                className="space-y-2"
              >
                {availableTimeSlots.map((timeSlot) => (
                  <div
                    key={timeSlot}
                    className="flex items-center space-x-2 rounded-md border p-3"
                  >
                    <RadioGroupItem value={timeSlot} id={`time-${timeSlot}`} />
                    <Label htmlFor={`time-${timeSlot}`} className="flex-1">
                      {timeSlot}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="py-4 text-center text-gray-500">
                No hay horarios disponibles para esta fecha
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={!selectedDate || !selectedTime || loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
