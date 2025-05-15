import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import SpecialistCard from "@/components/SpecialistCard";
import SpecialistModal from "@/components/SpecialistModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllServices } from "@/services/service";
import {
  getAllSpecialists,
  createSpecialist,
  updateSpecialist,
  updateSpecialistStatus,
} from "@/services/specialist";
import { Service } from "@/types/service";
import { Specialist, SpecialistFormData } from "@/types/specialist";

export default function Especialistas() {
  // State for specialists
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>(
    [],
  );

  // State for available services
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSpecialist, setCurrentSpecialist] = useState<
    Specialist | undefined
  >(undefined);
  const [modalTitle, setModalTitle] = useState("Agregar Especialista");

  // Load specialists and services on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch specialists from Firebase
        const loadedSpecialists = await getAllSpecialists();
        setSpecialists(loadedSpecialists);
        setFilteredSpecialists(loadedSpecialists);

        // Fetch services from Firebase
        const loadedServices = await getAllServices();
        setAvailableServices(loadedServices);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos. Intente nuevamente.");
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSpecialists(specialists);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = specialists.filter(
      (specialist) =>
        specialist.name.toLowerCase().includes(lowercaseQuery) ||
        specialist.email.toLowerCase().includes(lowercaseQuery) ||
        specialist.phone.toLowerCase().includes(lowercaseQuery),
    );

    setFilteredSpecialists(filtered);
  }, [searchQuery, specialists]);

  // Function to open the modal for creating a new specialist
  const handleAddSpecialist = () => {
    setCurrentSpecialist(undefined);
    setModalTitle("Agregar Especialista");
    setIsModalOpen(true);
  };

  // Function to open the modal for editing a specialist
  const handleEditSpecialist = (specialist: Specialist) => {
    setCurrentSpecialist(specialist);
    setModalTitle("Editar Especialista");
    setIsModalOpen(true);
  };

  // Function to toggle specialist status
  const handleToggleStatus = async (specialist: Specialist) => {
    try {
      // Update status in Firebase
      await updateSpecialistStatus(specialist.id, !specialist.isActive);

      // Update the specialist in the local state
      const updatedSpecialists = specialists.map((s) =>
        s.id === specialist.id
          ? { ...s, isActive: !s.isActive, updatedAt: new Date() }
          : s,
      );

      setSpecialists(updatedSpecialists);

      // Show success message
      toast.success(
        `Especialista ${specialist.isActive ? "desactivado" : "activado"} exitosamente`,
      );
    } catch (err) {
      console.error("Error toggling specialist status:", err);
      toast.error("Error al cambiar el estado del especialista");
    }
  };

  // Function to save a specialist (new or edited)
  const handleSaveSpecialist = async (specialistData: SpecialistFormData) => {
    try {
      if (specialistData.id) {
        // Update existing specialist in Firebase
        await updateSpecialist(specialistData.id, specialistData);

        // Update the specialist in the local state
        const updatedSpecialists = specialists.map((s) =>
          s.id === specialistData.id
            ? {
                ...s,
                ...specialistData,
                updatedAt: new Date(),
              }
            : s,
        );

        setSpecialists(updatedSpecialists);
        toast.success("Especialista actualizado exitosamente");
      } else {
        // Create new specialist in Firebase
        const newSpecialist = await createSpecialist(specialistData);

        // Add the new specialist to the local state
        setSpecialists([newSpecialist, ...specialists]);
        toast.success("Especialista creado exitosamente");
      }

      // Close the modal
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving specialist:", err);
      toast.error("Error al guardar el especialista");
    }
  };

  // Component for empty state
  const EmptyState = () => (
    <div className="rounded-lg border p-8 text-center">
      <p className="mb-4 text-gray-600">No hay especialistas registrados</p>
      <Button onClick={handleAddSpecialist} className="bg-indigo-600">
        Agregar primer especialista
      </Button>
    </div>
  );

  // Component for loading state
  const LoadingState = () => (
    <div className="flex justify-center py-8">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600">Cargando especialistas...</p>
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
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      {/* Header section */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Especialistas</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar especialista"
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
            onClick={handleAddSpecialist}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Agregar
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && <LoadingState />}

      {/* Error state */}
      {!loading && error && <ErrorState />}

      {/* Specialists list or empty message */}
      {!loading &&
        !error &&
        (filteredSpecialists.length > 0 ? (
          <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1">
            {filteredSpecialists.map((specialist) => (
              <SpecialistCard
                key={specialist.id}
                specialist={specialist}
                onEdit={() => handleEditSpecialist(specialist)}
                onToggleStatus={() => handleToggleStatus(specialist)}
                availableServices={availableServices}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        ))}

      {/* Modal for creating/editing specialists */}
      <SpecialistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSpecialist}
        specialist={currentSpecialist}
        title={modalTitle}
        availableServices={availableServices}
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
