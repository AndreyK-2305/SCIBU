import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSpecialistById } from "@/services/specialist";
import { Service } from "@/types/service";
import { Specialist } from "@/types/specialist";

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete?: () => void; // Keeping for API compatibility but will move to modal
}

export default function ServiceCard({
  service,
  onEdit,
  onToggleStatus,
}: ServiceCardProps) {
  // Handle both title and name properties
  const title = service.title || service.name || "Sin título";
  const { description, specialists, isActive } = service;

  // Add state to store the loaded specialist names
  const [specialistNames, setSpecialistNames] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch specialist details when the component mounts
  useEffect(() => {
    const fetchSpecialists = async () => {
      if (!specialists || specialists.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const specialistDetails = await Promise.all(
          specialists.map(async (specialistId) => {
            try {
              const specialist = await getSpecialistById(specialistId);
              return {
                id: specialistId,
                name: specialist
                  ? specialist.name
                  : "Especialista no encontrado",
              };
            } catch (error) {
              console.error(
                `Error fetching specialist ${specialistId}:`,
                error,
              );
              return { id: specialistId, name: "Error al cargar especialista" };
            }
          }),
        );

        setSpecialistNames(specialistDetails);
      } catch (error) {
        console.error("Error fetching specialists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, [specialists]);

  return (
    <Card className="rounded-lg border p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <Badge
          className={
            isActive
              ? "rounded-full bg-green-500 px-4 py-1 text-xs font-medium text-white"
              : "rounded-full bg-red-500 px-4 py-1 text-xs font-medium text-white"
          }
        >
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M17 10H19C21 10 22 9 22 7V5C22 3 21 2 19 2H17C15 2 14 3 14 5V7C14 9 15 10 17 10Z" />
              <path d="M5 22C7 22 8 21 8 19V17C8 15 7 14 5 14H3C1 14 0 15 0 17V19C0 21 1 22 3 22H5Z" />
              <path d="M6 10C8.2 10 10 8.2 10 6C10 3.8 8.2 2 6 2C3.8 2 2 3.8 2 6C2 8.2 3.8 10 6 10Z" />
              <path d="M18 22C20.2 22 22 20.2 22 18C22 15.8 20.2 14 18 14C15.8 14 14 15.8 14 18C14 20.2 15.8 22 18 22Z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Especialistas</h3>
            <div className="space-y-1">
              {loading ? (
                <p className="text-gray-500">Cargando especialistas...</p>
              ) : specialistNames.length > 0 ? (
                specialistNames.map((specialist) => (
                  <p key={specialist.id} className="text-gray-600">
                    {specialist.name}
                  </p>
                ))
              ) : (
                <p className="text-gray-600">No hay especialistas asignados</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M16 22.75H8C4.35 22.75 2.25 20.65 2.25 17V7C2.25 3.35 4.35 1.25 8 1.25H16C19.65 1.25 21.75 3.35 21.75 7V17C21.75 20.65 19.65 22.75 16 22.75ZM8 2.75C5.14 2.75 3.75 4.14 3.75 7V17C3.75 19.86 5.14 21.25 8 21.25H16C18.86 21.25 20.25 19.86 20.25 17V7C20.25 4.14 18.86 2.75 16 2.75H8Z" />
              <path d="M18.5 9.25H16.5C15.81 9.25 15.25 8.69 15.25 8V6C15.25 5.31 15.81 4.75 16.5 4.75H18.5C19.19 4.75 19.75 5.31 19.75 6V8C19.75 8.69 19.19 9.25 18.5 9.25ZM16.5 6.25V7.75H18V6.25H16.5Z" />
              <path d="M12 13.75H7C6.59 13.75 6.25 13.41 6.25 13C6.25 12.59 6.59 12.25 7 12.25H12C12.41 12.25 12.75 12.59 12.75 13C12.75 13.41 12.41 13.75 12 13.75Z" />
              <path d="M17 13.75H14C13.59 13.75 13.25 13.41 13.25 13C13.25 12.59 13.59 12.25 14 12.25H17C17.41 12.25 17.75 12.59 17.75 13C17.75 13.41 17.41 13.75 17 13.75Z" />
              <path d="M12 17.75H7C6.59 17.75 6.25 17.41 6.25 17C6.25 16.59 6.59 16.25 7 16.25H12C12.41 16.25 12.75 16.59 12.75 17C12.75 17.41 12.41 17.75 12 17.75Z" />
              <path d="M17 17.75H14C13.59 17.75 13.25 17.41 13.25 17C13.25 16.59 13.59 16.25 14 16.25H17C17.41 16.25 17.75 16.59 17.75 17C17.75 17.41 17.41 17.75 17 17.75Z" />
              <path d="M12 9.75H7C6.59 9.75 6.25 9.41 6.25 9C6.25 8.59 6.59 8.25 7 8.25H12C12.41 8.25 12.75 8.59 12.75 9C12.75 9.41 12.41 9.75 12 9.75Z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Descripción</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="default"
          className="flex-1 bg-indigo-600 font-medium text-white hover:bg-indigo-700"
          onClick={onEdit}
        >
          Editar
        </Button>
        <Button
          variant="destructive"
          className={
            isActive
              ? "flex-1 bg-red-500 font-medium text-white hover:bg-red-600"
              : "flex-1 bg-green-500 font-medium text-white hover:bg-green-600"
          }
          onClick={onToggleStatus}
        >
          {isActive ? "Deshabilitar" : "Activar"}
        </Button>
      </div>
    </Card>
  );
}
