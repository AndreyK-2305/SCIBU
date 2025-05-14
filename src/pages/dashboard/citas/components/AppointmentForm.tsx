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
  DialogFooter,
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
import { Label } from "@/components/ui/label";
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
import {
  getAllUsers,
  getUserData,
  isUserAdmin,
  UserData,
} from "@/services/user";
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
  const [userName, setUserName] = useState<string>("");

  // Admin-specific state
  const [isAdmin, setIsAdmin] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<
    Array<UserData & { id: string }>
  >([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Load specialists and their schedules whenever the modal is opened
  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        console.log("Loading data for appointment form, isOpen:", isOpen);
        setLoadingData(true);
        try {
          console.log("Services passed to AppointmentForm:", services);

          // Check if user is admin
          if (user) {
            const adminStatus = await isUserAdmin(user.uid);
            setIsAdmin(adminStatus);

            // If admin, load all registered users
            if (adminStatus) {
              const users = await getAllUsers();
              setRegisteredUsers(users);
              setSelectedUserId(""); // Reset selection
            }
          }

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

          // Reset form selections when modal is opened
          setSelectedService("");
          setSelectedSpecialist("");
          setSelectedDate(new Date());
          setTimeOptions([]);
          form.reset();

          // Load user data for auto-filling
          if (user) {
            const userData = await getUserData(user.uid);
            if (userData?.fullName) {
              setUserName(userData.fullName);
              form.setValue("requesterName", userData.fullName);
            }

            // Set requesterType based on user status if available
            if (userData?.status) {
              const statusMap: Record<string, string> = {
                Estudiante: "estudiante",
                Docente: "docente",
                Administrativo: "administrativo",
              };
              const requesterType = statusMap[userData.status] || "estudiante";
              form.setValue("requesterType", requesterType);
            } else {
              form.setValue("requesterType", "estudiante"); // Default to student
            }
          }
        } catch (error) {
          console.error("Error loading specialists:", error);
          toast.error("Error al cargar los especialistas");
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadData();
  }, [isOpen, services, user]);

  // Handle user selection (for admins only)
  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId);

    if (userId) {
      try {
        const userData = await getUserData(userId);
        if (userData) {
          // Update form with selected user's name
          form.setValue(
            "requesterName",
            userData.fullName || userData.email || "",
          );

          // Update form with selected user's type
          if (userData.status) {
            const statusMap: Record<string, string> = {
              Estudiante: "estudiante",
              Docente: "docente",
              Administrativo: "administrativo",
            };
            const requesterType = statusMap[userData.status] || "estudiante";
            form.setValue("requesterType", requesterType);
          }
        }
      } catch (error) {
        console.error("Error fetching selected user data:", error);
      }
    }
  };

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

        // Generate 20-minute slots (changed from 30 minutes)
        let currentSlot = startTime;
        while (currentSlot < endTime) {
          const formattedTime = format(currentSlot, "h:mm a");
          times.push(formattedTime);

          // Add 20 minutes for next slot
          currentSlot = new Date(currentSlot.getTime() + 20 * 60000);
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
      requesterName: userName || "",
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
      // Ensure requesterName is set with the user's name
      if (!data.requesterName && userName) {
        data.requesterName = userName;
      }

      // For admins, use selected user's ID if available
      const effectiveUserId =
        isAdmin && selectedUserId ? selectedUserId : user.uid;

      // Add user ID to the appointment data
      const appointmentData = {
        ...data,
        userId: effectiveUserId,
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Programar Cita</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Admin-only: User Selection */}
            {isAdmin && (
              <FormItem>
                <FormLabel>Usuario para la cita</FormLabel>
                <Select value={selectedUserId} onValueChange={handleUserSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {registeredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                  Seleccione el usuario para el cual se agendará esta cita
                </p>
              </FormItem>
            )}

            {/* Service */}
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

            {/* Specialist Selection */}
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
                    disabled={!selectedService || loadingData}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar especialista" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedService ? (
                        getSpecialistsForService(selectedService).length > 0 ? (
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
                        <SelectItem value="no-service" disabled>
                          Primero seleccione un servicio
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Disability Checkbox */}
            <FormField
              control={form.control}
              name="disability"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Incapacidad</FormLabel>
                </FormItem>
              )}
            />

            {/* Reason for consultation */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de la consulta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escriba aquí..."
                      {...field}
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Calendar Column */}
              <div>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <div className="mb-2 flex items-center justify-between">
                        <FormLabel>Fecha</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-indigo-600"
                          onClick={() => field.onChange(new Date())}
                        >
                          Hoy
                        </Button>
                      </div>
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
                          date < new Date() ||
                          !hasSchedulesForDate(date) ||
                          !selectedSpecialist
                        }
                        className="rounded-md border"
                        initialFocus
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Time Selection Column */}
              <div>
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listado de horarios</FormLabel>
                      <div className="h-[340px] space-y-2 overflow-y-auto pr-2">
                        {loadingData ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600"></div>
                            <span className="ml-2">Cargando horarios...</span>
                          </div>
                        ) : timeOptions.length > 0 ? (
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                          >
                            {timeOptions.map((time) => (
                              <div
                                key={time}
                                className="flex items-center space-x-2 rounded-md border p-3"
                              >
                                <RadioGroupItem
                                  value={time}
                                  id={`time-${time}`}
                                />
                                <Label htmlFor={`time-${time}`}>{time}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-center text-gray-500">
                              {!selectedSpecialist
                                ? "Seleccione un especialista para ver horarios disponibles"
                                : selectedDate
                                  ? "No hay horarios disponibles para esta fecha"
                                  : "Seleccione una fecha para ver horarios disponibles"}
                            </p>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Hidden Fields */}
            <FormField
              control={form.control}
              name="requesterName"
              render={({ field }) => <input type="hidden" {...field} />}
            />

            <FormField
              control={form.control}
              name="requesterType"
              render={({ field }) => <input type="hidden" {...field} />}
            />

            <FormField
              control={form.control}
              name="isFirstTime"
              render={({ field }) => (
                <input
                  type="hidden"
                  {...field}
                  value={field.value.toString()}
                />
              )}
            />

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={
                  loading ||
                  !selectedDate ||
                  !form.watch("time") ||
                  !selectedSpecialist
                }
                className="bg-indigo-600 px-12 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Icon
                      icon="ph:spinner"
                      className="mr-2 h-4 w-4 animate-spin"
                    />
                    Procesando...
                  </>
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
