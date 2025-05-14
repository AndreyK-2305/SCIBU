import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { sampleSpecialists } from "@/data/sampleData";
import { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onToggleStatus: () => void;
}

export default function ServiceCard({
  service,
  onEdit,
  onToggleStatus,
}: ServiceCardProps) {
  const { title, description, specialists, isActive } = service;

  // Find specialist names based on IDs
  const specialistNames = specialists.map((specialistId) => {
    const specialist = sampleSpecialists.find((s) => s.id === specialistId);
    return specialist
      ? `Dr. ${specialist.name}`
      : `Sin nombre (${specialistId})`;
  });

  return (
    <Card className="rounded-lg border p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
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
        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.6666 3.33334H13.3333V1.66667H6.66665V3.33334H3.33331C2.41665 3.33334 1.66665 4.08334 1.66665 5.00001V6.66667C1.66665 9.16667 3.58331 11.25 6.08331 11.6667C6.74998 13.4167 8.33331 14.75 10.2333 14.9667C10.7833 16.05 11.85 16.6667 13.0833 16.6667H16.6666C17.5833 16.6667 18.3333 15.9167 18.3333 15V5.00001C18.3333 4.08334 17.5833 3.33334 16.6666 3.33334ZM3.33331 6.66667V5.00001H6.66665V8.33334C4.83331 8.33334 3.33331 7.63334 3.33331 6.66667ZM13.3333 15C12.5833 15 11.9166 14.5833 11.6666 14H13.3333C14.25 14 15 13.25 15 12.3333V7.50001C15 6.58334 14.25 5.83334 13.3333 5.83334H8.33331C7.41665 5.83334 6.66665 6.58334 6.66665 7.50001V12.3333C6.66665 13.25 7.41665 14 8.33331 14H10C10.25 14.5833 10.9166 15 11.6666 15H13.3333Z"
                fill="#10B981"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Especialistas</h3>
            {/* Display specialist names */}
            {specialistNames.length > 0 ? (
              specialistNames.map((specialistName, index) => (
                <p key={index} className="text-gray-600">
                  {specialistName}
                </p>
              ))
            ) : (
              <p className="text-gray-600">No hay especialistas asignados</p>
            )}
          </div>
        </div>

        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18ZM11 5H9V11H15V9H11V5Z"
                fill="#818CF8"
              />
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
