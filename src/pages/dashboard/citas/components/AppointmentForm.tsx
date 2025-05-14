import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { getUserData } from "@/services/user";
import { Appointment, AppointmentFormData } from "@/types/appointment";
import { Service } from "@/types/service";

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
  const [timeOptions] = useState([
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
  ]);

  // Initialize form
  const form = useForm<AppointmentFormData>({
    defaultValues: {
      date: new Date(),
      time: "8:00 AM",
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
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
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
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar servicio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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

              {/* Specialist (Temporary static selection - would come from backend in real app) */}
              <FormField
                control={form.control}
                name="specialistName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialista</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("specialistId", value); // Use the name as ID for now
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar especialista" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Dr. Juan Pérez">
                          Dr. Juan Pérez
                        </SelectItem>
                        <SelectItem value="Dra. María López">
                          Dra. María López
                        </SelectItem>
                        <SelectItem value="Dr. Carlos Rodríguez">
                          Dr. Carlos Rodríguez
                        </SelectItem>
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
                disabled={loading}
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
