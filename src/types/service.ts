export interface Specialist {
  id?: string;
  name: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  specialists: string[]; // Array of specialist IDs
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServiceFormData {
  title: string;
  description: string;
  specialists: string[]; // Array of specialist IDs
}
