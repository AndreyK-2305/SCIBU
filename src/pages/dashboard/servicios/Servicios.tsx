import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import ServiceCard from "@/components/ServiceCard";
import ServiceModal from "@/components/ServiceModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { Service } from "@/types/service";

export default function Servicios() {
  // State for services
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | undefined>(
    undefined,
  );
  const [modalTitle, setModalTitle] = useState("Agregar Servicio");

  // Load services from Firebase on initial render
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        // Create query to get services ordered by creation date (newest first)
        const servicesQuery = query(
          collection(db, "services"),
          orderBy("createdAt", "desc"),
        );

        // Get services from Firestore
        const querySnapshot = await getDocs(servicesQuery);

        // Map the query results to Service objects
        const fetchedServices: Service[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedServices.push({
            id: doc.id,
            title: data.title || data.name || "",
            name: data.name || data.title || "",
            description: data.description || "",
            category: data.category || "",
            specialists: data.specialists || [],
            isActive: data.isActive ?? true, // Default to active if not specified
            imageUrl: data.imageUrl || "",
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        });

        setServices(fetchedServices);
        setFilteredServices(fetchedServices);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Error al cargar los servicios. Intente nuevamente.");
        toast.error("Error al cargar los servicios");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = services.filter(
      (service) =>
        service.title.toLowerCase().includes(lowercaseQuery) ||
        service.description.toLowerCase().includes(lowercaseQuery) ||
        service.category?.toLowerCase().includes(lowercaseQuery),
    );

    setFilteredServices(filtered);
  }, [searchQuery, services]);

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
  const handleToggleStatus = async (service: Service) => {
    try {
      // Create a reference to the service document
      const serviceRef = doc(db, "services", service.id);

      // Update the isActive status in Firestore
      await updateDoc(serviceRef, {
        isActive: !service.isActive,
        updatedAt: Timestamp.now(),
      });

      // Update the service in the local state
      const updatedServices = services.map((s) =>
        s.id === service.id
          ? { ...s, isActive: !s.isActive, updatedAt: new Date() }
          : s,
      );

      setServices(updatedServices);

      // Show success message
      toast.success(
        `Servicio ${service.isActive ? "desactivado" : "activado"} exitosamente`,
      );
    } catch (err) {
      console.error("Error toggling service status:", err);
      toast.error("Error al cambiar el estado del servicio");
    }
  };

  // Function to save a service (new or edited)
  const handleSaveService = async (
    serviceData: Omit<Service, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      if (currentService) {
        // Update existing service in Firestore
        const serviceRef = doc(db, "services", currentService.id);

        await updateDoc(serviceRef, {
          ...serviceData,
          updatedAt: Timestamp.now(),
        });

        // Update the service in the local state
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
        // Create new service in Firestore
        const newServiceData = {
          ...serviceData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, "services"), newServiceData);

        // Add the new service to the local state with the generated ID
        const newService: Service = {
          ...serviceData,
          id: docRef.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setServices([newService, ...services]);
        toast.success("Servicio creado exitosamente");
      }

      // Close the modal
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error("Error al guardar el servicio");
    }
  };

  // Function to delete a service
  const handleDeleteService = async (serviceId: string) => {
    try {
      // Delete the service from Firestore
      await deleteDoc(doc(db, "services", serviceId));

      // Remove the service from the local state
      const updatedServices = services.filter((s) => s.id !== serviceId);
      setServices(updatedServices);

      toast.success("Servicio eliminado exitosamente");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error deleting service:", err);
      toast.error("Error al eliminar el servicio");
    }
  };

  // Component for empty state
  const EmptyState = () => (
    <div className="rounded-lg border p-8 text-center">
      <p className="mb-4 text-gray-600">No hay servicios registrados</p>
      <Button onClick={handleAddService} className="bg-indigo-600">
        Agregar primer servicio
      </Button>
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

  // Component for error state
  const ErrorState = () => (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
      <p className="text-red-600">{error}</p>
      <Button
        onClick={() => window.location.reload()}
        className="mt-2 bg-red-600 hover:bg-red-700"
      >
        Reintentar
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header section */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar servicio"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 min-w-[200px]"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                className="absolute top-0 right-0 h-10 w-10 px-3"
                onClick={() => setSearchQuery("")}
              >
                <Icon name="x" className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            onClick={handleAddService}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Crear
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && <LoadingState />}

      {/* Error state */}
      {!loading && error && <ErrorState />}

      {/* Services list or empty message */}
      {!loading &&
        !error &&
        (filteredServices.length > 0 ? (
          <div className="space-y-4">
            {filteredServices.map((service) => (
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
        onDelete={handleDeleteService}
        service={currentService}
        title={modalTitle}
      />
    </div>
  );
}

// Simple Icon component for X
function Icon({ name, className }: { name: string; className?: string }) {
  if (name === "x") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    );
  }
  return null;
}
