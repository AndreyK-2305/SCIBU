import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sampleServices } from "@/data/sampleData";
import { Specialist } from "@/types/specialist";

interface SpecialistCardProps {
  specialist: Specialist;
  onEdit: () => void;
  onToggleStatus: () => void;
}

export default function SpecialistCard({
  specialist,
  onEdit,
  onToggleStatus,
}: SpecialistCardProps) {
  const { name, email, phone, services, isActive } = specialist;

  // Get actual service titles from the sample data
  const serviceDetails = services.map((serviceName) => {
    // Try to find by exact title match or by ID
    const service = sampleServices.find(
      (s) => s.title === serviceName || s.id === serviceName,
    );
    return service ? service.title : serviceName;
  });

  return (
    <Card className="rounded-lg border p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <h2 className="text-xl font-bold">Dr. {name}</h2>
        <Badge
          variant={isActive ? "sucess" : "destructive"}
          className={
            isActive
              ? "rounded-full bg-green-500 px-4 py-1 text-xs font-medium text-white"
              : "rounded-full bg-red-500 px-4 py-1 text-xs font-medium text-white"
          }
        >
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      <div className="mb-6 space-y-6">
        {/* Correo */}
        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                fill="#FFC107"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Correo</h3>
            <p className="text-gray-600">{email}</p>
          </div>
        </div>

        {/* Celular */}
        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 1H8C6.62 1 5.5 2.12 5.5 3.5V20.5C5.5 21.88 6.62 23 8 23H16C17.38 23 18.5 21.88 18.5 20.5V3.5C18.5 2.12 17.38 1 16 1ZM12 22C11.17 22 10.5 21.33 10.5 20.5C10.5 19.67 11.17 19 12 19C12.83 19 13.5 19.67 13.5 20.5C13.5 21.33 12.83 22 12 22ZM16.5 18H7.5V4H16.5V18Z"
                fill="#10B981"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Celular</h3>
            <p className="text-gray-600">{phone}</p>
          </div>
        </div>

        {/* Servicios */}
        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 7H16V5C16 4.45 15.55 4 15 4H9C8.45 4 8 4.45 8 5V7H5C3.9 7 3 7.9 3 9V14C3 14.75 3.4 15.38 4 15.73V19C4 20.11 4.89 21 6 21H18C19.11 21 20 20.11 20 19V15.72C20.59 15.37 21 14.73 21 14V9C21 7.9 20.1 7 19 7ZM10 5H14V7H10V5ZM18 19H6V16H18V19ZM19 14H5V9H19V14Z"
                fill="#7C3AED"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Servicios</h3>
            {serviceDetails.length > 0 ? (
              serviceDetails.map((service, index) => (
                <p key={index} className="text-gray-600">
                  {service}
                </p>
              ))
            ) : (
              <p className="text-gray-600">No hay servicios asignados</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="default"
          className="bg-indigo-600 font-medium text-white"
          onClick={onEdit}
        >
          Editar
        </Button>
        <Button
          variant="destructive"
          className={
            isActive
              ? "bg-red-500 font-medium text-white hover:bg-red-600"
              : "bg-green-500 font-medium text-white hover:bg-green-600"
          }
          onClick={onToggleStatus}
        >
          {isActive ? "Deshabilitar" : "Activar"}
        </Button>
      </div>
    </Card>
  );
}
