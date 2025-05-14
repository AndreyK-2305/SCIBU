import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import ServiceCard from "@/components/ServiceCard";
import ServiceModal from "@/components/ServiceModal";
import { Button } from "@/components/ui/button";
import { sampleServices, sampleSpecialists } from "@/data/sampleData";
import { Service } from "@/types/service";

export default function Servicios() {
  // State for services
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | undefined>(
    undefined,
  );
  const [modalTitle, setModalTitle] = useState("Agregar Servicio");

  // Load services on initial render
  useEffect(() => {
    // Simulate loading
    setLoading(true);

    setTimeout(() => {
      setServices(sampleServices);
      setLoading(false);
    }, 1000);
  }, []);

  // Function to open the modal for creating a new service
  const handleAddService = () => {
    setCurrentService(undefined);
    setModalTitle("Agregar Servicio");
    setIsModalOpen(true);
  };

  // Function to open the modal for editing a service
  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setModalTitle("Editar Servicio");
    setIsModalOpen(true);
  };

  // Function to toggle service status
  const handleToggleStatus = (service: Service) => {
    // Update the service in the local state
    const updatedServices = services.map((s) =>
      s.id === service.id ? { ...s, isActive: !s.isActive } : s,
    );

    setServices(updatedServices);

    // Show success message
    toast.success(
      `Servicio ${service.isActive ? "desactivado" : "activado"} exitosamente`,
    );
  };

  // Function to save a service (new or edited)
  const handleSaveService = (
    serviceData: Omit<Service, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (currentService) {
      // Update existing service
      const updatedServices = services.map((s) =>
        s.id === currentService.id
          ? {
              ...s,
              ...serviceData,
              updatedAt: new Date(),
            }
          : s,
      );

      setServices(updatedServices);
      toast.success("Servicio actualizado exitosamente");
    } else {
      // Create new service with a generated ID
      const newService: Service = {
        ...serviceData,
        id: `service${services.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setServices([newService, ...services]);
      toast.success("Servicio creado exitosamente");
    }

    // Close the modal
    setIsModalOpen(false);
  };

  // Component for empty state
  const EmptyState = () => (
    <div className="rounded-lg border">
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          No hay servicios registrados
        </p>
      </div>
    </div>
  );

  // Component for loading state
  const LoadingState = () => (
    <div className="flex justify-center py-8">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600">Cargando servicios...</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      {/* Header section */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <Button onClick={handleAddService} className="bg-indigo-600">
          Agregar
        </Button>
      </div>

      {/* Loading state */}
      {loading && <LoadingState />}

      {/* Services list or empty message */}
      {!loading &&
        (services.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => handleEditService(service)}
                onToggleStatus={() => handleToggleStatus(service)}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        ))}

      {/* Modal for creating/editing services */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        service={currentService}
        title={modalTitle}
      />
    </div>
  );
}
