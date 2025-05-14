import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import useAuth from "@/hooks/useAuth";
import { isUserAdmin } from "@/services/user";
import { Appointment, AppointmentStatus } from "@/types/appointment";

interface AppointmentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (status: AppointmentStatus, recommendations?: string) => void;
  appointment: Appointment;
}

export default function AppointmentStatusModal({
  isOpen,
  onClose,
  onUpdateStatus,
  appointment,
}: AppointmentStatusModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(
    appointment.status,
  );
  const [recommendations, setRecommendations] = useState(
    appointment.recommendations || "",
  );
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  React.useEffect(() => {
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

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Debe iniciar sesión para actualizar una cita");
      return;
    }

    setLoading(true);
    try {
      // Call the update function
      await onUpdateStatus(selectedStatus, recommendations);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Error al actualizar el estado de la cita");
    } finally {
      setLoading(false);
    }
  };

  const formatAppointmentDate = (date: Date): string => {
    return format(date, "PPP", { locale: es });
  };

  // Show different options based on user role
  const getStatusOptions = () => {
    // Regular users can only cancel appointments
    if (!isAdmin) {
      return (
        <RadioGroup
          value={selectedStatus}
          onValueChange={(value) =>
            setSelectedStatus(value as AppointmentStatus)
          }
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cancelado" id="status-cancelado" />
            <label
              htmlFor="status-cancelado"
              className="text-sm font-medium text-red-600"
            >
              Cancelar cita
            </label>
          </div>
        </RadioGroup>
      );
    }

    // Admins can change to any status
    return (
      <RadioGroup
        value={selectedStatus}
        onValueChange={(value) => setSelectedStatus(value as AppointmentStatus)}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pendiente" id="status-pendiente" />
          <label
            htmlFor="status-pendiente"
            className="text-sm font-medium text-amber-600"
          >
            Pendiente
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="realizado" id="status-realizado" />
          <label
            htmlFor="status-realizado"
            className="text-sm font-medium text-green-600"
          >
            Realizada
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cancelado" id="status-cancelado" />
          <label
            htmlFor="status-cancelado"
            className="text-sm font-medium text-red-600"
          >
            Cancelada
          </label>
        </div>
      </RadioGroup>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isAdmin ? "Actualizar Estado de Cita" : "Cancelar Cita"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Appointment details */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-medium">Detalles de la cita</h3>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Servicio:</span>
                <span className="font-medium">{appointment.serviceType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Fecha:</span>
                <span className="font-medium">
                  {formatAppointmentDate(appointment.date)} - {appointment.time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Especialista:</span>
                <span className="font-medium">
                  {appointment.specialistName}
                </span>
              </div>
            </div>
          </div>

          {/* Status selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado de la cita</label>
            {getStatusOptions()}
          </div>

          {/* Recommendations - only show for admins */}
          {isAdmin && (
            <div className="space-y-2">
              <label htmlFor="recommendations" className="text-sm font-medium">
                Recomendaciones
              </label>
              <Textarea
                id="recommendations"
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Ingrese recomendaciones o notas sobre la cita"
                className="resize-none"
                rows={5}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className={
                selectedStatus === "cancelado"
                  ? "bg-red-600 hover:bg-red-700"
                  : selectedStatus === "realizado"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
              }
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon
                    icon="ph:spinner"
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                  Procesando...
                </>
              ) : selectedStatus === "cancelado" ? (
                "Cancelar Cita"
              ) : selectedStatus === "realizado" ? (
                "Marcar como Realizada"
              ) : (
                "Actualizar Estado"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
