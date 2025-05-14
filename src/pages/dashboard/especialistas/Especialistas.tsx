import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import SpecialistCard from "@/components/SpecialistCard";
import SpecialistModal from "@/components/SpecialistModal";
import { Button } from "@/components/ui/button";
import { sampleSpecialists, sampleServices } from "@/data/sampleData";
import { Service } from "@/types/service";
import { Specialist, SpecialistFormData } from "@/types/specialist";

export default function Especialistas() {
  // State for specialists
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // Simulate loading
    setLoading(true);

    setTimeout(() => {
      setSpecialists(sampleSpecialists);
      setAvailableServices(sampleServices);
      setLoading(false);
    }, 1000);
  }, []);

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
  const handleToggleStatus = (specialist: Specialist) => {
    // Update the specialist in the local state
    const updatedSpecialists = specialists.map((s) =>
      s.id === specialist.id ? { ...s, isActive: !s.isActive } : s,
    );

    setSpecialists(updatedSpecialists);

    // Show success message
    toast.success(
      `Especialista ${specialist.isActive ? "desactivado" : "activado"} exitosamente`,
    );
  };

  // Function to save a specialist (new or edited)
  const handleSaveSpecialist = (specialistData: SpecialistFormData) => {
    if (currentSpecialist) {
      // Update existing specialist
      const updatedSpecialists = specialists.map((s) =>
        s.id === currentSpecialist.id
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
      // Create new specialist with a generated ID
      const newSpecialist: Specialist = {
        ...specialistData,
        id: `specialist${specialists.length + 1}`,
        isActive: specialistData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSpecialists([newSpecialist, ...specialists]);
      toast.success("Especialista creado exitosamente");
    }

    // Close the modal
    setIsModalOpen(false);
  };

  // Create a test specialist
  const handleCreateTestSpecialist = () => {
    // Create a test specialist with random data
    const testSpecialist: SpecialistFormData = {
      name: "Test " + new Date().toISOString().substring(11, 16),
      email: `drtest${Date.now()}@ufps.edu.co`,
      phone: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      services: [],
    };

    // If we have services, assign one randomly
    if (availableServices.length > 0) {
      const randomService =
        availableServices[Math.floor(Math.random() * availableServices.length)];
      testSpecialist.services = [randomService.title];
    }

    handleSaveSpecialist(testSpecialist);
  };

  // Component for empty state
  const EmptyState = () => (
    <div className="rounded-lg border">
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          No hay especialistas registrados
        </p>
      </div>
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

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      {/* Header section */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Especialistas</h1>
        <div className="flex space-x-3">
          {import.meta.env.DEV && (
            <Button
              onClick={handleCreateTestSpecialist}
              className="bg-green-600"
            >
              Test
            </Button>
          )}
          <Button onClick={handleAddSpecialist} className="bg-indigo-600">
            Agregar
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && <LoadingState />}

      {/* Specialists list or empty message */}
      {!loading &&
        (specialists.length > 0 ? (
          <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1">
            {specialists.map((specialist) => (
              <SpecialistCard
                key={specialist.id}
                specialist={specialist}
                onEdit={() => handleEditSpecialist(specialist)}
                onToggleStatus={() => handleToggleStatus(specialist)}
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
