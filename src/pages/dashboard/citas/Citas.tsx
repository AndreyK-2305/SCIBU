import { Icon } from "@iconify/react";
import { format, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";
import {
  getAllAppointments,
  getAppointmentsByUserId,
  updateAppointmentStatus,
} from "@/services/appointment";
import { getAllServices } from "@/services/service";
import { isUserAdmin } from "@/services/user";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { Service } from "@/types/service";

import AppointmentForm from "./components/AppointmentForm";
import AppointmentStatusModal from "./components/AppointmentStatusModal";

export default function Citas() {
  // Authentication
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Data state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all",
  );
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

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

  // Load appointments and services
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get services for filtering
        const loadedServices = await getAllServices();
        setServices(loadedServices);

        // Get appointments based on user role
        let loadedAppointments: Appointment[];
        if (user) {
          if (isAdmin) {
            // Admins see all appointments
            loadedAppointments = await getAllAppointments();
          } else {
            // Regular users only see their own appointments
            loadedAppointments = await getAppointmentsByUserId(user.uid);
          }
          setAppointments(loadedAppointments);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Error al cargar los datos. Intente nuevamente.");
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isAdmin]);

  // Apply filters
  useEffect(() => {
    if (!appointments) return;

    let filtered = [...appointments];

    // Filter by date if selected
    if (selectedDate) {
      filtered = filtered.filter((appointment) => {
        const appointmentDate = appointment.date;
        return (
          appointmentDate.getDate() === selectedDate.getDate() &&
          appointmentDate.getMonth() === selectedDate.getMonth() &&
          appointmentDate.getFullYear() === selectedDate.getFullYear()
        );
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          appointment.requesterName.toLowerCase().includes(query) ||
          appointment.specialistName.toLowerCase().includes(query) ||
          appointment.serviceType.toLowerCase().includes(query),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.status === statusFilter,
      );
    }

    // Filter by service
    if (serviceFilter !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.serviceType === serviceFilter,
      );
    }

    // Filter by tab
    if (activeTab === "upcoming") {
      filtered = filtered.filter(
        (appointment) =>
          appointment.date >= new Date() && appointment.status === "pendiente",
      );
    } else if (activeTab === "past") {
      filtered = filtered.filter(
        (appointment) =>
          appointment.date < new Date() ||
          appointment.status === "realizado" ||
          appointment.status === "cancelado",
      );
    }

    setFilteredAppointments(filtered);
  }, [
    appointments,
    selectedDate,
    searchQuery,
    statusFilter,
    serviceFilter,
    activeTab,
  ]);

  // Handle appointment creation
  const handleAppointmentCreated = (newAppointment: Appointment) => {
    setAppointments([newAppointment, ...appointments]);
    setIsFormOpen(false);
    toast.success("Cita agendada exitosamente");
  };

  // Handle opening the status modal
  const handleUpdateStatus = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsStatusModalOpen(true);
  };

  // Handle appointment status update
  const handleStatusUpdate = async (
    status: AppointmentStatus,
    recommendations?: string,
  ) => {
    if (!selectedAppointment) return;

    try {
      await updateAppointmentStatus(
        selectedAppointment.id,
        status,
        recommendations,
      );

      // Update appointment in local state
      const updatedAppointments = appointments.map((appointment) =>
        appointment.id === selectedAppointment.id
          ? {
              ...appointment,
              status,
              recommendations: recommendations || appointment.recommendations,
              updatedAt: new Date(),
            }
          : appointment,
      );

      setAppointments(updatedAppointments);
      setIsStatusModalOpen(false);
      setSelectedAppointment(null);

      toast.success(
        `Estado de la cita actualizado a "${getStatusLabel(status)}"`,
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Error al actualizar el estado de la cita");
    }
  };

  // Helper function to get status label
  const getStatusLabel = (status: AppointmentStatus): string => {
    switch (status) {
      case "pendiente":
        return "Pendiente";
      case "realizado":
        return "Realizada";
      case "cancelado":
        return "Cancelada";
      default:
        return status;
    }
  };

  // Helper function to get status badge color
  const getStatusColor = (status: AppointmentStatus): string => {
    switch (status) {
      case "pendiente":
        return "bg-amber-500";
      case "realizado":
        return "bg-green-500";
      case "cancelado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Format date for display
  const formatAppointmentDate = (date: Date): string => {
    return format(date, "PPP", { locale: es });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Citas</h1>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Agendar Cita
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Tabs */}
          <Tabs
            defaultValue="upcoming"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Próximas</TabsTrigger>
              <TabsTrigger value="past">Historial</TabsTrigger>
            </TabsList>

            <div className="my-4 flex flex-wrap gap-2">
              {/* Search input */}
              <div className="flex min-w-[200px] flex-1">
                <Input
                  placeholder="Buscar por nombre, especialista o servicio"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Status filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as AppointmentStatus | "all")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="realizado">Realizada</SelectItem>
                  <SelectItem value="cancelado">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              {/* Service filter */}
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los servicios</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.title}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="upcoming" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-600">Cargando citas...</p>
                  </div>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="rounded-lg border p-8 text-center">
                  <p className="mb-4 text-gray-600">No tienes citas próximas</p>
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-indigo-600"
                  >
                    Agendar una cita
                  </Button>
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onUpdateStatus={handleUpdateStatus}
                    isAdmin={isAdmin}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-600">Cargando historial...</p>
                  </div>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="rounded-lg border p-8 text-center">
                  <p className="text-gray-600">
                    No tienes citas en tu historial
                  </p>
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onUpdateStatus={handleUpdateStatus}
                    isAdmin={isAdmin}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Calendar */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-semibold">Calendario</h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-medium">Resumen del día</h3>
            {filteredAppointments.length > 0 ? (
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-sm">
                  <span className="font-medium">
                    {filteredAppointments.length}
                  </span>{" "}
                  cita(s) para{" "}
                  <span className="font-medium">
                    {selectedDate ? formatAppointmentDate(selectedDate) : "hoy"}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No hay citas para{" "}
                {selectedDate ? formatAppointmentDate(selectedDate) : "hoy"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Form Modal */}
      {isFormOpen && (
        <AppointmentForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onAppointmentCreated={handleAppointmentCreated}
          services={services}
        />
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedAppointment && (
        <AppointmentStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedAppointment(null);
          }}
          onUpdateStatus={handleStatusUpdate}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
}

// Appointment Card Component
interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus: (appointment: Appointment) => void;
  isAdmin: boolean;
}

function AppointmentCard({
  appointment,
  onUpdateStatus,
  isAdmin,
}: AppointmentCardProps) {
  const { date, time, requesterName, specialistName, serviceType, status } =
    appointment;

  // Format date for display
  const formattedDate = format(date, "PPP", { locale: es });

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{serviceType}</h3>
        <Badge className={`${getStatusColor(status)} px-3 py-1 text-white`}>
          {getStatusLabel(status)}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <Icon icon="ph:calendar" className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium">Fecha y hora</div>
            <div>
              {formattedDate} - {time}
              {isToday(date) && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Hoy
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-100 p-2">
            <Icon icon="ph:user" className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium">Paciente</div>
            <div>{requesterName}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-purple-100 p-2">
            <Icon icon="ph:stethoscope" className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium">Especialista</div>
            <div>{specialistName}</div>
          </div>
        </div>

        {appointment.recommendations && (
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-indigo-100 p-2">
              <Icon icon="ph:note-pencil" className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm font-medium">Recomendaciones</div>
              <div>{appointment.recommendations}</div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {(status === "pendiente" || isAdmin) && (
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onUpdateStatus(appointment)}
            className="text-sm"
          >
            {isAdmin
              ? "Actualizar estado"
              : status === "pendiente"
                ? "Cancelar cita"
                : "Ver detalles"}
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper function to get status label
const getStatusLabel = (status: AppointmentStatus): string => {
  switch (status) {
    case "pendiente":
      return "Pendiente";
    case "realizado":
      return "Realizada";
    case "cancelado":
      return "Cancelada";
    default:
      return status;
  }
};

// Helper function to get status badge color
const getStatusColor = (status: AppointmentStatus): string => {
  switch (status) {
    case "pendiente":
      return "bg-amber-500";
    case "realizado":
      return "bg-green-500";
    case "cancelado":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};
