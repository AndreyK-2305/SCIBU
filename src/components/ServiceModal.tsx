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
import { getAllSpecialists } from "@/services/specialist";
import { Service } from "@/types/service";
import { Specialist } from "@/types/specialist";

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
  onDelete?: (serviceId: string) => void;
  service?: Service;
  title: string;
}

// Available categories for services
const serviceCategories = [
  { id: "medical", name: "Médico" },
  { id: "dental", name: "Odontológico" },
  { id: "psychological", name: "Psicológico" },
  { id: "nutrition", name: "Nutrición" },
  { id: "physiotherapy", name: "Fisioterapia" },
  { id: "other", name: "Otro" },
];

export default function ServiceModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  service,
  title,
}: ServiceModalProps) {
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [specialists, setSpecialists] = useState<string[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [availableSpecialists, setAvailableSpecialists] = useState<
    Specialist[]
  >([]);
  const [loadingSpecialists, setLoadingSpecialists] = useState(false);

  // Fetch available specialists when modal opens
  useEffect(() => {
    const fetchSpecialists = async () => {
      if (isOpen) {
        try {
          setLoadingSpecialists(true);
          const specialists = await getAllSpecialists();
          setAvailableSpecialists(specialists.filter((s) => s.isActive));
        } catch (error) {
          console.error("Error fetching specialists:", error);
        } finally {
          setLoadingSpecialists(false);
        }
      }
    };

    fetchSpecialists();
  }, [isOpen]);

  // Filter out specialists that are already selected
  const filteredSpecialists = availableSpecialists.filter(
    (specialist) => !specialists.includes(specialist.id),
  );

  const handleAddSpecialist = () => {
    if (selectedSpecialist && !specialists.includes(selectedSpecialist)) {
      setSpecialists([...specialists, selectedSpecialist]);
      setSelectedSpecialist("");
    }
  };

  useEffect(() => {
    if (service) {
      setServiceName(service.title || service.name || "");
      setDescription(service.description || "");
      setCategory(service.category || "");
      setImageUrl(service.imageUrl || "");
      setSpecialists(service.specialists || []);
      setIsActive(service.isActive);
    } else {
      // Reset form when creating a new service
      setServiceName("");
      setDescription("");
      setCategory("");
      setImageUrl("");
      setSpecialists([]);
      setIsActive(true);
    }
    // Reset delete confirmation when modal opens/closes
    setShowDeleteConfirm(false);
  }, [service, isOpen]);

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
        name: serviceName.trim(), // Also set name field for compatibility
        description: description.trim(),
        category: category,
        imageUrl: imageUrl.trim(),
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

  const handleDelete = () => {
    if (service && onDelete) {
      onDelete(service.id);
      onClose();
    }
  };

  // Find specialist name by ID
  const getSpecialistName = (id: string) => {
    const specialist = availableSpecialists.find((s) => s.id === id);
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
            <Label htmlFor="category">Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Escriba aquí una descripción detallada del servicio..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de Imagen (opcional)</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialist">Especialistas</Label>
            <div className="flex space-x-2">
              <Select
                value={selectedSpecialist}
                onValueChange={setSelectedSpecialist}
                disabled={
                  loadingSpecialists || filteredSpecialists.length === 0
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingSpecialists
                        ? "Cargando..."
                        : "Seleccionar especialista"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredSpecialists.map((specialist) => (
                    <SelectItem key={specialist.id} value={specialist.id}>
                      {specialist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddSpecialist}
                className="bg-indigo-600"
                disabled={!selectedSpecialist || loadingSpecialists}
              >
                Agregar
              </Button>
            </div>

            {filteredSpecialists.length === 0 && !loadingSpecialists && (
              <p className="mt-1 text-xs text-amber-600">
                No hay más especialistas disponibles para agregar
              </p>
            )}

            {/* List of added specialists */}
            <div className="mt-2 space-y-2">
              {specialists.map((specialistId) => (
                <div
                  key={specialistId}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <span>{getSpecialistName(specialistId)}</span>
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

          {/* Delete option - only shown when editing existing service */}
          {service && onDelete && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-red-600">
                  Zona de peligro
                </h3>
                {!showDeleteConfirm ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Eliminar servicio
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      ¿Está seguro de que desea eliminar este servicio? Esta
                      acción no se puede deshacer.
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="flex-1 bg-red-500 hover:bg-red-600"
                        onClick={handleDelete}
                      >
                        Confirmar eliminación
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
