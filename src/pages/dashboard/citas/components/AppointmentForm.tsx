import { Icon } from "@iconify/react";
import {
  format,
  isWithinInterval,
  parse,
  setHours,
  setMinutes,
} from "date-fns";
import { es } from "date-fns/locale";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  getAllSchedules,
  getSchedulesBySpecialistId,
} from "@/services/schedule";
import { getAllSpecialists } from "@/services/specialist";
import { getUserData } from "@/services/user";
import { Appointment, AppointmentFormData } from "@/types/appointment";
import { Schedule } from "@/types/schedule";
import { Service } from "@/types/service";
import { Specialist } from "@/types/specialist";

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: (appointment: Appointment) => void;
  services: Service[];
}

export default function AppointmentForm({
  isOpen,
  onClose,
  onAppointmentCreated,
  services,
}: AppointmentFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
  const [timeOptions, setTimeOptions] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [serviceSpecialistsMap, setServiceSpecialistsMap] = useState<
    Record<string, Specialist[]>
  >({});
  const initialized = useRef(false);

  // Load specialists and their schedules
  useEffect(() => {
    const loadData = async () => {
      if (isOpen && !initialized.current) {
        console.log("Loading data for appointment form, isOpen:", isOpen);
        setLoadingData(true);
        try {
          console.log("Services passed to AppointmentForm:", services);

          // Get all specialists
          const loadedSpecialists = await getAllSpecialists();
          const activeSpecialists = loadedSpecialists.filter(
            (specialist) => specialist.isActive,
          );
          setSpecialists(activeSpecialists);

          console.log("Active specialists:", activeSpecialists);

          // Create a mapping of services to specialists
          const specialistsMap: Record<string, Specialist[]> = {};

          services.forEach((service) => {
            console.log(
              `Service "${service.title}" has specialists:`,
              service.specialists,
            );
            if (service.specialists && service.specialists.length > 0) {
              const serviceSpecialists = activeSpecialists.filter(
                (specialist) => service.specialists.includes(specialist.id),
              );
              specialistsMap[service.title] = serviceSpecialists;
              console.log(
                `Mapped ${serviceSpecialists.length} specialists to service "${service.title}"`,
                serviceSpecialists,
              );
            } else {
              specialistsMap[service.title] = [];
            }
          });

          console.log("Final service-specialists mapping:", specialistsMap);
          setServiceSpecialistsMap(specialistsMap);
          initialized.current = true;
        } catch (error) {
          console.error("Error loading specialists:", error);
          toast.error("Error al cargar los especialistas");
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadData();
  }, [isOpen, services]);

  // Reset initialized flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      initialized.current = false;
    }
  }, [isOpen]);

  // Load specialist schedules when a specialist is selected
  useEffect(() => {
    const loadSpecialistSchedules = async () => {
      if (selectedSpecialist) {
        try {
          setLoadingData(true);
          // Get schedules for the selected specialist
          const schedules =
            await getSchedulesBySpecialistId(selectedSpecialist);
          setAvailableSchedules(schedules);
        } catch (error) {
          console.error("Error loading specialist schedules:", error);
          toast.error("Error al cargar los horarios del especialista");
        } finally {
          setLoadingData(false);
        }
      } else {
        setAvailableSchedules([]);
      }
    };

    loadSpecialistSchedules();
  }, [selectedSpecialist]);

  // Generate time options based on selected date and specialist schedules
  useEffect(() => {
    if (selectedDate && availableSchedules.length > 0) {
      // Filter schedules for the selected date
      const dateSchedules = availableSchedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.date);
        return (
          scheduleDate.getDate() === selectedDate.getDate() &&
          scheduleDate.getMonth() === selectedDate.getMonth() &&
          scheduleDate.getFullYear() === selectedDate.getFullYear()
        );
      });

      // Generate time slots from schedules
      const times: string[] = [];
      dateSchedules.forEach((schedule) => {
        const startTime = parse(schedule.startTime, "HH:mm", new Date());
        const endTime = parse(schedule.endTime, "HH:mm", new Date());

        // Generate 30-minute slots
        let currentSlot = startTime;
        while (currentSlot < endTime) {
          const formattedTime = format(currentSlot, "h:mm a");
          times.push(formattedTime);

          // Add 30 minutes for next slot
          currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
        }
      });

      setTimeOptions(
        [...new Set(times)].sort((a, b) => {
          return (
            parse(a, "h:mm a", new Date()).getTime() -
            parse(b, "h:mm a", new Date()).getTime()
          );
        }),
      );
    } else {
      setTimeOptions([]);
    }
  }, [selectedDate, availableSchedules]);

  // Initialize form
  const form = useForm<AppointmentFormData>({
    defaultValues: {
      date: new Date(),
      time: "",
      requesterName: "",
      requesterType: "estudiante",
      serviceType: "",
      specialistId: "",
      specialistName: "",
      status: "pendiente",
      isFirstTime: true,
      disability: false,
      reason: "",
      recommendations: "",
    },
  });

  // Check if date has available schedules
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

  // Get specialists for selected service
  const getSpecialistsForService = (serviceTitle: string): Specialist[] => {
    const result = serviceSpecialistsMap[serviceTitle] || [];
    console.log(`Getting specialists for service "${serviceTitle}":`, result);
    return result;
  };

  // Handle service selection
  const handleServiceChange = (serviceTitle: string) => {
    console.log(`Service changed to "${serviceTitle}"`);
    setSelectedService(serviceTitle);
    setSelectedSpecialist("");
    form.setValue("serviceType", serviceTitle);
    form.setValue("specialistId", "");
    form.setValue("specialistName", "");
    setAvailableSchedules([]);
    setTimeOptions([]);

    // Debug the specialists available for this service
    const specialists = serviceSpecialistsMap[serviceTitle] || [];
    console.log(
      `Available specialists for service "${serviceTitle}":`,
      specialists,
    );
  };

  // Handle specialist selection
  const handleSpecialistChange = (specialistId: string) => {
    setSelectedSpecialist(specialistId);
    form.setValue("specialistId", specialistId);

    // Find specialist name
    const specialist = specialists.find((s) => s.id === specialistId);
    if (specialist) {
      form.setValue("specialistName", specialist.name);
    }
  };

  // On form submission
  const onSubmit = async (data: AppointmentFormData) => {
    if (!user) {
      toast.error("Debe iniciar sesión para agendar una cita");
      return;
    }

    setLoading(true);
    try {
      // Get user data if available
      const userData = await getUserData(user.uid);

      // Populate requesterName if not provided
      if (!data.requesterName && userData?.fullName) {
        data.requesterName = userData.fullName;
      }

      // Add user ID to the appointment data
      const appointmentData = {
        ...data,
        userId: user.uid,
      };

      // Create appointment in Firebase
      const newAppointment = await createAppointment(appointmentData);

      // Call the callback with the new appointment
      onAppointmentCreated(newAppointment);

      // Close the form
      onClose();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Error al crear la cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agendar Cita</DialogTitle>
          <DialogDescription>
            Complete el formulario para agendar una nueva cita.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              {/* Date Picker */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                            disabled={!selectedSpecialist || loadingData}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date);
                              setSelectedDate(date);
                              form.setValue("time", ""); // Reset time when date changes
                            }
                          }}
                          disabled={(date) =>
                            date < new Date() || !hasSchedulesForDate(date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={timeOptions.length === 0 || loadingData}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.length > 0 ? (
                          timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-options" disabled>
                            {loadingData
                              ? "Cargando horarios..."
                              : !selectedSpecialist
                                ? "Primero seleccione un especialista"
                                : "No hay horarios disponibles"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Service and Specialist */}
            <div className="grid grid-cols-2 gap-4">
              {/* Service Type */}
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servicio</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleServiceChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar servicio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services
                          .filter((service) => service.isActive)
                          .map((service) => (
                            <SelectItem key={service.id} value={service.title}>
                              {service.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Requester Name */}
              <FormField
                control={form.control}
                name="requesterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Requester Type */}
              <FormField
                control={form.control}
                name="requesterType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="estudiante">Estudiante</SelectItem>
                        <SelectItem value="docente">Docente</SelectItem>
                        <SelectItem value="administrativo">
                          Administrativo
                        </SelectItem>
                        <SelectItem value="externo">Externo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Specialist */}
              <FormField
                control={form.control}
                name="specialistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialista</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleSpecialistChange(value);
                      }}
                      value={field.value}
                      disabled={!selectedService}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar especialista" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedService ? (
                          getSpecialistsForService(selectedService).length >
                          0 ? (
                            getSpecialistsForService(selectedService).map(
                              (specialist) => (
                                <SelectItem
                                  key={specialist.id}
                                  value={specialist.id}
                                >
                                  {specialist.name}
                                </SelectItem>
                              ),
                            )
                          ) : (
                            <SelectItem value="no-specialists" disabled>
                              No hay especialistas disponibles
                            </SelectItem>
                          )
                        ) : (
                          <SelectItem value="select-service" disabled>
                            Primero seleccione un servicio
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* First Time and Disability */}
            <div className="grid grid-cols-2 gap-4">
              {/* Is First Time */}
              <FormField
                control={form.control}
                name="isFirstTime"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>¿Primera vez?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        defaultValue={field.value ? "true" : "false"}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="firstTimeYes" />
                          <label htmlFor="firstTimeYes">Sí</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="firstTimeNo" />
                          <label htmlFor="firstTimeNo">No</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Disability */}
              <FormField
                control={form.control}
                name="disability"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>¿Tiene alguna discapacidad?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        defaultValue={field.value ? "true" : "false"}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="disabilityYes" />
                          <label htmlFor="disabilityYes">Sí</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="disabilityNo" />
                          <label htmlFor="disabilityNo">No</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de la consulta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa brevemente el motivo de su consulta"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form buttons */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={loading || !timeOptions.length}
              >
                {loading ? (
                  <>
                    <Icon
                      icon="ph:spinner"
                      className="mr-2 h-4 w-4 animate-spin"
                    />
                    Creando...
                  </>
                ) : (
                  "Agendar Cita"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
