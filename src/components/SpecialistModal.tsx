import { X, Eye, EyeOff } from "lucide-react";
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
import { getAllServices } from "@/services/service";
import { Service } from "@/types/service";
import { Specialist, SpecialistFormData } from "@/types/specialist";

interface SpecialistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (specialistData: SpecialistFormData) => void;
  specialist?: Specialist;
  title: string;
  availableServices: Service[];
}

export default function SpecialistModal({
  isOpen,
  onClose,
  onSave,
  specialist,
  title,
  availableServices,
}: SpecialistModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch services on component mount or when modal opens
  useEffect(() => {
    const fetchServices = async () => {
      if (isOpen) {
        try {
          setLoading(true);
          // Use the availableServices from props if provided
          if (availableServices && availableServices.length > 0) {
            setServices(availableServices);
          } else {
            // Otherwise fetch from Firebase
            const services = await getAllServices();
            setServices(services);
          }
        } catch (error) {
          console.error("Error fetching services:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchServices();
  }, [isOpen, availableServices]);

  // Filter out services that are already selected or inactive
  const availableServiceOptions = services.filter(
    (service) => !selectedServices.includes(service.id) && service.isActive,
  );

  useEffect(() => {
    if (specialist) {
      setName(specialist.name);
      setEmail(specialist.email);
      setPhone(specialist.phone);
      setSelectedServices(specialist.services || []);
      setIsActive(specialist.isActive);
      setPassword(""); // Reset password on edit
    } else {
      // Reset form when creating a new specialist
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setSelectedServices([]);
      setIsActive(true);
    }
  }, [specialist, isOpen]);

  useEffect(() => {
    // Simple password strength calculation
    let strength = 0;
    if (password.length > 0) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const handleAddService = () => {
    if (selectedService && !selectedServices.includes(selectedService)) {
      setSelectedServices([...selectedServices, selectedService]);
      setSelectedService("");
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setSelectedServices(
      selectedServices.filter((service) => service !== serviceToRemove),
    );
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Débil";
    if (passwordStrength === 2) return "Media";
    if (passwordStrength === 3) return "Buena";
    return "Fuerte";
  };

  // Get service title by ID
  const getServiceTitle = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    return service ? service.title : serviceId;
  };

  const handleSave = () => {
    try {
      console.log("Guardando especialista...");

      // Validate form
      if (!name.trim()) {
        console.warn("Validación fallida: Nombre de especialista vacío");
        alert("Por favor ingrese un nombre para el especialista");
        return;
      }

      if (!email.trim()) {
        console.warn("Validación fallida: Email de especialista vacío");
        alert("Por favor ingrese un email para el especialista");
        return;
      }

      if (!phone.trim()) {
        console.warn("Validación fallida: Teléfono de especialista vacío");
        alert("Por favor ingrese un teléfono para el especialista");
        return;
      }

      if (!specialist && !password) {
        console.warn("Validación fallida: Contraseña vacía");
        alert("Por favor ingrese una contraseña para el especialista");
        return;
      }

      // Prepare data for saving
      const specialistData: SpecialistFormData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        services: selectedServices,
        isActive,
      };

      // Add password if provided and creating new specialist
      if (password && !specialist) {
        // In a real app, you would hash this password or handle it securely
        // For simplicity, we'll just add it to the data
        (specialistData as any).password = password;
      }

      console.log("Datos del especialista preparados:", specialistData);

      // Llamar a la función de guardado proporcionada por el padre
      onSave(specialistData);
      console.log("Función onSave ejecutada");
    } catch (error) {
      console.error("Error al intentar guardar el especialista:", error);
      alert("Ocurrió un error al guardar. Por favor, inténtelo de nuevo.");
    }
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. perez"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="drperez@ufps.edu.co"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Celular</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 -translate-y-1/2 transform text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && (
              <>
                <div className="mt-1 flex space-x-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded-full ${
                        level <= passwordStrength
                          ? level === 1
                            ? "bg-red-500"
                            : level === 2
                              ? "bg-yellow-500"
                              : level === 3
                                ? "bg-green-500"
                                : "bg-green-600"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  ))}
                </div>
                <div className="mt-1 text-right text-xs">
                  {getPasswordStrengthLabel()}
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="services">Servicios</Label>
            <div className="flex space-x-2">
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
                disabled={loading || availableServiceOptions.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loading ? "Cargando..." : "Seleccionar servicio"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableServiceOptions.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddService}
                className="bg-indigo-600"
                disabled={!selectedService || loading}
              >
                Agregar
              </Button>
            </div>

            {availableServiceOptions.length === 0 &&
              !loading &&
              services.length > 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No hay servicios disponibles para asignar
                </p>
              )}

            {/* List of added services */}
            <div className="mt-2 space-y-2">
              {selectedServices.map((serviceId, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <span>{getServiceTitle(serviceId)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveService(serviceId)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
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
