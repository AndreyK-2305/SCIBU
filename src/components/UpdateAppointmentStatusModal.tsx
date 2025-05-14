import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Appointment, AppointmentStatus } from "@/types/appointment";

// Simple Textarea component
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

interface UpdateAppointmentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onUpdateStatus: (
    id: string,
    status: AppointmentStatus,
    recommendations?: string,
  ) => void;
}

export default function UpdateAppointmentStatusModal({
  isOpen,
  onClose,
  appointment,
  onUpdateStatus,
}: UpdateAppointmentStatusModalProps) {
  const [status, setStatus] = useState<AppointmentStatus>("pendiente");
  const [recommendations, setRecommendations] = useState("");

  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status);
      setRecommendations(appointment.recommendations || "");
    }
  }, [appointment]);

  const handleSave = () => {
    if (appointment) {
      onUpdateStatus(
        appointment.id,
        status,
        recommendations.trim() ? recommendations : undefined,
      );
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Actualizar estado de cita
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as AppointmentStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="realizado">Realizada</SelectItem>
                <SelectItem value="cancelado">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recomendaciones</Label>
            <Textarea
              id="recommendations"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Escriba las recomendaciones o hallazgos de la cita..."
              rows={6}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-gray-500">
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
