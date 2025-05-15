export interface Specialist {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SpecialistFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  isActive?: boolean;
  password?: string;
}
