import { Specialist, SpecialistFormData } from "@/types/specialist";

import {
  getSpecialistsFromStorage,
  saveSpecialistsToStorage,
} from "./localStorage";

// Get all specialists
export const getAllSpecialists = async (): Promise<Specialist[]> => {
  return getSpecialistsFromStorage();
};

// Get specialist by ID
export const getSpecialistById = async (
  id: string,
): Promise<Specialist | null> => {
  const specialists = getSpecialistsFromStorage();
  const specialist = specialists.find((s) => s.id === id);
  return specialist || null;
};

// Create a new specialist
export const createSpecialist = async (
  specialistData: SpecialistFormData,
): Promise<Specialist> => {
  const specialists = getSpecialistsFromStorage();

  const newSpecialist: Specialist = {
    ...specialistData,
    id: `specialist${specialists.length + 1}`,
    isActive: specialistData.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedSpecialists = [...specialists, newSpecialist];
  saveSpecialistsToStorage(updatedSpecialists);

  return newSpecialist;
};

// Update a specialist
export const updateSpecialist = async (
  id: string,
  specialistData: Partial<SpecialistFormData>,
): Promise<Specialist> => {
  const specialists = getSpecialistsFromStorage();
  const specialistIndex = specialists.findIndex((s) => s.id === id);

  if (specialistIndex === -1) {
    throw new Error(`Specialist with ID ${id} not found`);
  }

  const updatedSpecialist: Specialist = {
    ...specialists[specialistIndex],
    ...specialistData,
    updatedAt: new Date(),
  };

  specialists[specialistIndex] = updatedSpecialist;
  saveSpecialistsToStorage(specialists);

  return updatedSpecialist;
};

// Toggle specialist status
export const toggleSpecialistStatus = async (
  id: string,
): Promise<Specialist> => {
  const specialists = getSpecialistsFromStorage();
  const specialistIndex = specialists.findIndex((s) => s.id === id);

  if (specialistIndex === -1) {
    throw new Error(`Specialist with ID ${id} not found`);
  }

  const updatedSpecialist = {
    ...specialists[specialistIndex],
    isActive: !specialists[specialistIndex].isActive,
    updatedAt: new Date(),
  };

  specialists[specialistIndex] = updatedSpecialist;
  saveSpecialistsToStorage(specialists);

  return updatedSpecialist;
};

// Delete a specialist
export const deleteSpecialist = async (id: string): Promise<void> => {
  const specialists = getSpecialistsFromStorage();
  const updatedSpecialists = specialists.filter((s) => s.id !== id);
  saveSpecialistsToStorage(updatedSpecialists);
};
