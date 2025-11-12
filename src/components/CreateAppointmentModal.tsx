import { addDays } from "date-fns";
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
import useAuth from "@/hooks/useAuth";
import { createAppointment } from "@/services/appointment";
import {
  getScheduleById,
  getSchedulesBySpecialistId,
} from "@/services/schedule";
import { getAllServices } from "@/services/service";
import { getAllSpecialists } from "@/services/specialist";
import { getUserData } from "@/services/user";
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
  // Auth hook for getting current user info
  const { user } = useAuth();

  // Form fields
  const [selectedService, setSelectedService] = useState<string>("");
  const [disability, setDisability] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [requesterName, setRequesterName] = useState<string>("");
  const [userInfo, setUserInfo] = useState<any>(null);

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

  // Current date + 1 day for calendar min date
  const tomorrow = addDays(new Date(), 1);

  // Load services and specialists on initial render
  useEffect(() => {
    loadServicesAndSpecialists();

    // Load user info if not admin
    if (!isAdmin && user?.uid) {
      loadUserInfo(user.uid);
    }
  }, [isAdmin, user]);

  // Function to load current user information
  const loadUserInfo = async (userId: string) => {
    try {
      const userData = await getUserData(userId);
      if (userData) {
        setUserInfo(userData);
        setRequesterName(userData.fullName || "");
        setStudentId(userData.code || "");
      }
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  };

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

  // Load available time slots when date and specialist are selected
  useEffect(() => {
    if (selectedDate && selectedSpecialist) {
      loadAvailableTimeSlots(selectedDate);
    } else {
      setAvailableTimeSlots([]);
      setSelectedTime("");
    }
  }, [selectedDate, selectedSpecialist]);

  // Load initial data (services and specialists)
  const loadServicesAndSpecialists = async () => {
    try {
      setLoading(true);
      const [servicesData, specialistsData] = await Promise.all([
        getAllServices(),
        getAllSpecialists(),
      ]);

      setServices(servicesData);
      setAllSpecialists(specialistsData);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Error al cargar los datos iniciales");
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots from start and end time
  const generateTimeSlots = (startTime: string, endTime: string) => {
    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute <= endMinute)
    ) {
      const formattedHour = currentHour.toString().padStart(2, "0");
      const formattedMinute = currentMinute.toString().padStart(2, "0");
      const timeSlot = `${formattedHour}:${formattedMinute}`;

      slots.push(timeSlot);

      // Increment by 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    return slots;
  };

  // Load available time slots for the selected date and specialist
  const loadAvailableTimeSlots = async (date: Date) => {
    try {
      setLoading(true);

      // Get all schedules for this date
      const schedules = await getSchedulesBySpecialistId(selectedSpecialist);

      // Filter schedules for the selected specialist
      const specialistSchedules = schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.date);
        return (
          scheduleDate.getDate() === date.getDate() &&
          scheduleDate.getMonth() === date.getMonth() &&
          scheduleDate.getFullYear() === date.getFullYear()
        );
      });

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

  // Validate form based on current step
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!selectedService) {
        errors.service = "Debe seleccionar un servicio";
      }

      if (isAdmin) {
        if (!studentId) {
          errors.studentId = "Debe ingresar el código del estudiante";
        }

        if (!requesterName) {
          errors.requesterName = "Debe ingresar el nombre del solicitante";
        }
      }

      if (!reason) {
        errors.reason = "Debe ingresar el motivo de la consulta";
      }
    } else if (step === 2) {
      if (!selectedSpecialist) {
        errors.specialist = "Debe seleccionar un especialista";
      }

      if (!selectedDate) {
        errors.date = "Debe seleccionar una fecha";
      }

      if (!selectedTime) {
        errors.time = "Debe seleccionar una hora";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  // Handle back to step 1
  const handleBackStep = () => {
    setStep(1);
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
        "id" | "createdAt" | "updatedAt"
      > = {
        date: selectedDate,
        time: selectedTime,
        requesterName: isAdmin
          ? requesterName
          : userInfo?.fullName || "Usuario actual",
        requesterType: isAdmin
          ? "Estudiante"
          : userInfo?.status || "Estudiante",
        serviceType: service.title,
        specialistId: selectedSpecialist,
        specialistName: specialist.name,
        isFirstTime: true, // Assume first time
        disability: disability,
        reason: reason,
        status: "pendiente", // Agregar el estado pendiente por defecto
        userId: user?.uid || undefined, // Agregar userId del usuario actual
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agendar cita</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <>
            <div className="space-y-6 py-4">
              {/* Service selection */}
              <div className="space-y-2">
                <Label htmlFor="service" className="font-medium">
                  Servicio <span className="text-red-500">*</span>
                </Label>
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
                  <p className="mt-2 text-sm text-red-500">
                    {formErrors.service}
                  </p>
                )}
              </div>

              {/* Student ID and requester name - Only for admin mode */}
              {isAdmin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="studentId" className="font-medium">
                      Código de estudiante{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className={formErrors.studentId ? "border-red-500" : ""}
                    />
                    {formErrors.studentId && (
                      <p className="mt-2 text-sm text-red-500">
                        {formErrors.studentId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requesterName" className="font-medium">
                      Nombre del solicitante{" "}
                      <span className="text-red-500">*</span>
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
                      <p className="mt-2 text-sm text-red-500">
                        {formErrors.requesterName}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Disability option */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="disability"
                    checked={disability}
                    onCheckedChange={(checked) =>
                      setDisability(checked as boolean)
                    }
                  />
                  <Label htmlFor="disability">Persona con discapacidad</Label>
                </div>
              </div>

              {/* Consultation reason */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="font-medium">
                  Motivo de la consulta <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`min-h-32 resize-none ${
                    formErrors.reason ? "border-red-500" : ""
                  }`}
                  placeholder="Describa el motivo de la consulta"
                />
                {formErrors.reason && (
                  <p className="mt-2 text-sm text-red-500">
                    {formErrors.reason}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Siguiente
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <Label className="font-medium">
                  Seleccione un especialista{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedSpecialist}
                  onValueChange={setSelectedSpecialist}
                >
                  <SelectTrigger
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
                  <p className="mt-2 text-sm text-red-500">
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

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackStep}
                disabled={loading}
              >
                Regresar
              </Button>
              <div className="space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? "Agendando..." : "Agendar cita"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
