import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAppointment } from "@/services/appointment";
import { getSchedulesByDate } from "@/services/schedule";
import { getAllServices } from "@/services/service";
import { getAllSpecialists } from "@/services/specialist";
import { Appointment } from "@/types/appointment";
import { Schedule } from "@/types/schedule";
import { Service } from "@/types/service";
import { Specialist } from "@/types/specialist";

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isAdmin: boolean;
}

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  isAdmin = false,
}: CreateAppointmentModalProps) {
  // Form fields
  const [selectedService, setSelectedService] = useState<string>("");
  const [disability, setDisability] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [requesterName, setRequesterName] = useState<string>("");

  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [allSpecialists, setAllSpecialists] = useState<Specialist[]>([]);
  const [serviceSpecialists, setServiceSpecialists] = useState<Specialist[]>(
    [],
  );
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load services and specialists on initial render
  useEffect(() => {
    loadServicesAndSpecialists();
  }, []);

  // Filter specialists when a service is selected
  useEffect(() => {
    if (selectedService && allSpecialists.length > 0) {
      const service = services.find((s) => s.id === selectedService);
      if (service) {
        // Filter specialists that offer this service
        const specialistIds = service.specialists || [];
        const filtered = allSpecialists.filter((specialist) =>
          specialistIds.includes(specialist.id),
        );

        setServiceSpecialists(filtered);

        // Reset selected specialist
        setSelectedSpecialist("");
      }
    }
  }, [selectedService, allSpecialists]);

  // Load available time slots when date or specialist changes
  useEffect(() => {
    if (selectedDate && selectedSpecialist) {
      loadAvailableTimeSlots(selectedDate);
    }
  }, [selectedDate, selectedSpecialist]);

  // Load services and specialists from local storage
  const loadServicesAndSpecialists = async () => {
    try {
      setLoading(true);

      // Load services
      const servicesData = await getAllServices();
      setServices(servicesData);

      // Load all specialists
      const specialistsData = await getAllSpecialists();
      setAllSpecialists(specialistsData);

      // Set first service as default if available
      if (servicesData.length > 0 && !selectedService) {
        setSelectedService(servicesData[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate time slots in 30-minute increments
  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const timeSlots: string[] = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

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
      timeSlots.push(
        `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      );
    }

    return timeSlots;
  };

  // Load available time slots for the selected date and specialist
  const loadAvailableTimeSlots = async (date: Date) => {
    try {
      setLoading(true);

      // Get all schedules for this date
      const schedules = await getSchedulesByDate(date);

      // Filter schedules for the selected specialist
      const specialistSchedules = schedules.filter(
        (schedule) => schedule.specialistId === selectedSpecialist,
      );

      // Generate time slots from schedule start and end times
      const timeSlots = specialistSchedules.reduce(
        (slots: string[], schedule: Schedule) => {
          const generatedSlots = generateTimeSlots(
            schedule.startTime,
            schedule.endTime,
          );
          return [...slots, ...generatedSlots];
        },
        [],
      );

      // Remove duplicates and sort
      const uniqueTimeSlots = [...new Set(timeSlots)].sort();

      setAvailableTimeSlots(uniqueTimeSlots);

      // Select the first time slot by default if available
      if (uniqueTimeSlots.length > 0 && !selectedTime) {
        setSelectedTime(uniqueTimeSlots[0]);
      } else if (uniqueTimeSlots.length === 0) {
        // Reset selected time if no slots are available
        setSelectedTime("");
      }
    } catch (error) {
      console.error("Error loading available time slots:", error);
    } finally {
      setLoading(false);
    }
  };

  // Move to next step
  const goToNextStep = () => {
    // Validate current step
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!selectedService) errors.service = "Seleccione un servicio";
      if (!reason) errors.reason = "Ingrese el motivo de la consulta";

      // For admin, check student ID and requester name
      if (isAdmin) {
        if (!studentId) errors.studentId = "Ingrese el código de estudiante";
        if (!requesterName)
          errors.requesterName = "Ingrese el nombre del solicitante";
      }
    } else if (step === 2) {
      if (!selectedDate) errors.date = "Seleccione una fecha";
      if (!selectedTime) errors.time = "Seleccione un horario";
      if (!selectedSpecialist) errors.specialist = "Seleccione un especialista";
    }

    setFormErrors(errors);

    // If no errors, proceed to next step
    if (Object.keys(errors).length === 0) {
      if (step === 2) {
        // Submit the form if on step 2
        handleSubmit();
      } else {
        setStep(step + 1);
      }
    }
  };

  // Go back to previous step
  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (
      !selectedService ||
      !selectedDate ||
      !selectedTime ||
      !selectedSpecialist
    ) {
      return;
    }

    try {
      setLoading(true);

      // Get service and specialist data
      const service = services.find((s) => s.id === selectedService);
      const specialist = allSpecialists.find(
        (s) => s.id === selectedSpecialist,
      );

      if (!service || !specialist) {
        toast.error("Datos incompletos. Por favor verifique.");
        return;
      }

      // Create appointment object
      const newAppointment: Omit<
        Appointment,
        "id" | "status" | "createdAt" | "updatedAt"
      > = {
        date: selectedDate,
        time: selectedTime,
        requesterName: isAdmin ? requesterName : "Usuario actual", // Replace with actual user info
        requesterType: isAdmin ? "Estudiante" : "Empleado", // Assume students for admin-created appointments
        serviceType: service.title,
        specialistId: selectedSpecialist,
        specialistName: specialist.name,
        isFirstTime: true, // Assume first time
        disability: disability,
        reason: reason,
      };

      // Create appointment
      await createAppointment(newAppointment);

      // Show success message
      toast.success("Cita agendada exitosamente");

      // Close modal and refresh data
      onSuccess();
      onClose();

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Error al agendar la cita");
    } finally {
      setLoading(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setSelectedService("");
    setDisability(false);
    setReason("");
    setSelectedDate(undefined);
    setSelectedTime("");
    setStudentId("");
    setRequesterName("");
    setSelectedSpecialist("");
    setStep(1);
    setFormErrors({});
  };

  // Get today and tomorrow for date calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = addDays(today, 1);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Programar Cita</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <>
            {/* Step 1: Basic Information */}
            <div className="space-y-6">
              {/* Service */}
              <div className="space-y-2">
                <Label htmlFor="service">Servicio</Label>
                <Select
                  value={selectedService}
                  onValueChange={setSelectedService}
                >
                  <SelectTrigger
                    id="service"
                    className={formErrors.service ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccione un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.service && (
                  <p className="text-sm text-red-500">{formErrors.service}</p>
                )}
              </div>

              {/* Admin-only fields */}
              {isAdmin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Código de estudiante</Label>
                    <Input
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className={formErrors.studentId ? "border-red-500" : ""}
                    />
                    {formErrors.studentId && (
                      <p className="text-sm text-red-500">
                        {formErrors.studentId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requesterName">
                      Nombre del solicitante
                    </Label>
                    <Input
                      id="requesterName"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      className={
                        formErrors.requesterName ? "border-red-500" : ""
                      }
                    />
                    {formErrors.requesterName && (
                      <p className="text-sm text-red-500">
                        {formErrors.requesterName}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Disability */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="disability"
                  checked={disability}
                  onCheckedChange={(checked) => setDisability(checked === true)}
                />
                <Label htmlFor="disability">Incapacidad</Label>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo de la consulta</Label>
                <Textarea
                  id="reason"
                  placeholder="Escriba aquí..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`min-h-32 ${formErrors.reason ? "border-red-500" : ""}`}
                />
                {formErrors.reason && (
                  <p className="text-sm text-red-500">{formErrors.reason}</p>
                )}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Step 2: Date and Time Selection */}
            <div className="space-y-6">
              {/* Specialist selection */}
              <div className="space-y-2">
                <Label htmlFor="specialist">Especialista</Label>
                <Select
                  value={selectedSpecialist}
                  onValueChange={setSelectedSpecialist}
                >
                  <SelectTrigger
                    id="specialist"
                    className={formErrors.specialist ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccione un especialista" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceSpecialists.map((specialist) => (
                      <SelectItem key={specialist.id} value={specialist.id}>
                        {specialist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.specialist && (
                  <p className="text-sm text-red-500">
                    {formErrors.specialist}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Calendar */}
                <div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={es}
                    className={`rounded-md border ${formErrors.date ? "border-red-500" : ""}`}
                    disabled={(date) => {
                      // Disable dates in the past and current day
                      return date < tomorrow;
                    }}
                    defaultMonth={tomorrow}
                    fromDate={tomorrow}
                  />
                  {formErrors.date && (
                    <p className="mt-2 text-sm text-red-500">
                      {formErrors.date}
                    </p>
                  )}
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
                      className={`space-y-2 ${formErrors.time ? "border-red-500" : ""}`}
                    >
                      {availableTimeSlots.map((timeSlot) => (
                        <div
                          key={timeSlot}
                          className="flex items-center space-x-2 rounded-md border p-3"
                        >
                          <RadioGroupItem
                            value={timeSlot}
                            id={`time-${timeSlot}`}
                          />
                          <Label
                            htmlFor={`time-${timeSlot}`}
                            className="flex-1"
                          >
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
                  {formErrors.time && (
                    <p className="mt-2 text-sm text-red-500">
                      {formErrors.time}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={loading}
            >
              Atrás
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          )}

          <Button
            onClick={goToNextStep}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {step === 2 ? "Enviar" : "Siguiente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
