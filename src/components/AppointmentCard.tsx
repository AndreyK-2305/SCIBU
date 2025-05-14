import {
  Clock,
  User,
  Briefcase,
  Award,
  AlertTriangle,
  Info,
  FilePlus,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Appointment, AppointmentStatus } from "@/types/appointment";

interface AppointmentCardProps {
  appointment: Appointment;
  // onUpdateStatus: () => void; // Comentado porque no se usa
  onOpenStatusModal: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

export default function AppointmentCard({
  appointment,
  // onUpdateStatus, // Comentado porque no se usa
  onOpenStatusModal,
  onReschedule,
  onCancel,
}: AppointmentCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Format date for display (DD/MM/YYYY)
  const formatDate = (date: Date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [day, month, year].join("/");
  };

  // Get status badge color
  const getStatusBadgeClass = () => {
    switch (appointment.status) {
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

  // Get status text
  const getStatusText = () => {
    switch (appointment.status) {
      case "pendiente":
        return "Pendiente";
      case "realizado":
        return "Realizado";
      case "cancelado":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="relative mb-4 rounded-lg border bg-white p-6 shadow-sm">
      {/* Date section */}
      <div className="mb-4 text-sm font-medium text-gray-500">
        {formatDate(appointment.date)}
      </div>

      <div className="space-y-6">
        {/* Time */}
        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <Clock className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Hora</h3>
            <p className="text-gray-600">{appointment.time}</p>
          </div>
        </div>

        {/* Requester */}
        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Solicitante</h3>
            <p className="text-gray-600">{appointment.requesterName}</p>
          </div>
        </div>

        {/* Service */}
        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <Briefcase className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Servicio</h3>
            <p className="text-gray-600">{appointment.serviceType}</p>
          </div>
        </div>

        {/* Specialist */}
        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <Award className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Especialista</h3>
            <p className="text-gray-600">Dr. {appointment.specialistName}</p>
          </div>
        </div>

        {/* Only show the following fields if expanded */}
        {expanded && (
          <>
            {/* Disability */}
            <div className="flex items-start">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Incapacidad</h3>
                <p className="text-gray-600">
                  {appointment.disability ? "Sí" : "No"}
                </p>
              </div>
            </div>

            {/* First time */}
            <div className="flex items-start">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <FilePlus className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Primera vez</h3>
                <p className="text-gray-600">
                  {appointment.isFirstTime ? "Sí" : "No"}
                </p>
              </div>
            </div>

            {/* Reason */}
            {appointment.reason && (
              <div className="flex items-start">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Info className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Motivo</h3>
                  <p className="text-gray-600">{appointment.reason}</p>
                </div>
              </div>
            )}

            {/* Recommendations (only for completed appointments) */}
            {appointment.status === "realizado" &&
              appointment.recommendations && (
                <div className="flex items-start">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                    <FilePlus className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Recomendaciones
                    </h3>
                    <p className="text-gray-600">
                      {appointment.recommendations}
                    </p>
                  </div>
                </div>
              )}
          </>
        )}
      </div>

      {/* Status section at bottom */}
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        {/* "See more" button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-indigo-600 hover:underline"
        >
          {expanded ? "Ver menos" : "+ Ver más"}
        </button>

        {/* Status badge */}
        <span
          className={`${getStatusBadgeClass()} rounded-full px-4 py-1.5 text-xs font-medium text-white`}
        >
          {getStatusText()}
        </span>
      </div>

      {/* Action buttons - Only show for pending appointments */}
      {appointment.status === "pendiente" && (
        <div className="mt-4 flex space-x-2">
          <Button
            variant="default"
            className="flex-1 bg-indigo-600 font-medium text-white"
            onClick={() => onOpenStatusModal(appointment)}
          >
            Actualizar Estado
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-amber-500 font-medium text-amber-500"
            onClick={() => onReschedule(appointment)}
          >
            Reprogramar
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-500 font-medium text-red-500"
            onClick={() => onCancel(appointment)}
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Completed appointments with view details */}
      {appointment.status === "realizado" && !expanded && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            className="border-indigo-500 font-medium text-indigo-500"
            onClick={() => setExpanded(true)}
          >
            Ver detalles
          </Button>
        </div>
      )}
    </div>
  );
}
