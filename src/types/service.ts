export interface Specialist {
  id?: string;
  name: string;
}

export interface Service {
  id: string;
  title: string;
  name?: string; // Some services might use name instead of title
  description: string;
  category?: string;
  imageUrl?: string;
  isActive: boolean;
  specialists: string[]; // Array of specialist IDs
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServiceFormData {
  title: string;
  description: string;
  category?: string;
  imageUrl?: string;
  specialists: string[]; // Array of specialist IDs
}
