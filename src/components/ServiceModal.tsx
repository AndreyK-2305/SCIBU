import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sampleSpecialists } from "@/data/sampleData";
import { Service } from "@/types/service";

// Definir un componente Textarea simple mientras se resuelve el problema de importación
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

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    serviceData: Omit<Service, "id" | "createdAt" | "updatedAt">,
  ) => void;
  service?: Service;
  title: string;
}

export default function ServiceModal({
  isOpen,
  onClose,
  onSave,
  service,
  title,
}: ServiceModalProps) {
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [specialists, setSpecialists] = useState<string[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Filter out specialists that are already added
  const availableSpecialists = sampleSpecialists.filter(
    (specialist) => !specialists.includes(specialist.id) && specialist.isActive,
  );

  useEffect(() => {
    if (service) {
      setServiceName(service.title);
      setDescription(service.description);
      setSpecialists(service.specialists || []);
      setIsActive(service.isActive);
    } else {
      // Reset form when creating a new service
      setServiceName("");
      setDescription("");
      setSpecialists([]);
      setIsActive(true);
    }
  }, [service, isOpen]);

  const handleAddSpecialist = () => {
    if (selectedSpecialist) {
      setSpecialists([...specialists, selectedSpecialist]);
      setSelectedSpecialist("");
    }
  };

  const handleRemoveSpecialist = (specialistId: string) => {
    setSpecialists(specialists.filter((id) => id !== specialistId));
  };

  const handleSave = () => {
    try {
      console.log("Guardando servicio...");

      // Validate form
      if (!serviceName.trim()) {
        console.warn("Validación fallida: Nombre de servicio vacío");
        alert("Por favor ingrese un nombre para el servicio");
        return;
      }

      // Prepare data for saving
      const serviceData = {
        title: serviceName.trim(),
        description: description.trim(),
        specialists,
        isActive,
      };

      console.log("Datos del servicio preparados:", serviceData);

      // Llamar a la función de guardado proporcionada por el padre
      onSave(serviceData);
      console.log("Función onSave ejecutada");
    } catch (error) {
      console.error("Error al intentar guardar el servicio:", error);
      alert("Ocurrió un error al guardar. Por favor, inténtelo de nuevo.");
    }
  };

  // Get specialist name by ID
  const getSpecialistName = (id: string) => {
    const specialist = sampleSpecialists.find((s) => s.id === id);
    return specialist ? specialist.name : id;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Consulta Odontológica"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Escriba aquí..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialist">Especialistas</Label>
            <div className="flex space-x-2">
              <Select
                value={selectedSpecialist}
                onValueChange={setSelectedSpecialist}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar especialista" />
                </SelectTrigger>
                <SelectContent>
                  {availableSpecialists.map((specialist) => (
                    <SelectItem key={specialist.id} value={specialist.id}>
                      Dr. {specialist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddSpecialist}
                className="bg-indigo-600"
                disabled={!selectedSpecialist}
              >
                Agregar
              </Button>
            </div>

            {/* List of added specialists */}
            <div className="mt-2 space-y-2">
              {specialists.map((specialistId) => (
                <div
                  key={specialistId}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <span>Dr. {getSpecialistName(specialistId)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSpecialist(specialistId)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-indigo-600"
          >
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
