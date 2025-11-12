import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { getAppointmentsByUserId } from "@/services/appointment";
import { getUserData, UserData } from "@/services/user";
import { Appointment } from "@/types/appointment";

import { generateUserReportPDF } from "@/utils/pdfGenerator";

interface User {
  id: string;
  name: string;
  document: string;
  type: string;
  email: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Cargar todos los usuarios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadAllUsers();
    } else {
      // Reset al cerrar
      setSearchQuery("");
      setSelectedUser(null);
      setStartDate(undefined);
      setEndDate(undefined);
      setAllUsers([]);
      setFilteredUsers([]);
    }
  }, [isOpen]);

  // Filtrar usuarios según la búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.document.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  const loadAllUsers = async () => {
    setIsLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);

      const users: User[] = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data() as UserData;
        users.push({
          id: doc.id,
          name: data.fullName || "Sin nombre",
          document: `${data.documentType || ""} ${data.documentNumber || ""}`.trim(),
          type: data.status || "Sin estamento",
          email: data.email || "",
        });
      });

      // Ordenar alfabéticamente por nombre
      users.sort((a, b) => a.name.localeCompare(b.name));

      setAllUsers(users);
      setFilteredUsers(users);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };


  const handleGeneratePDF = async () => {
    if (!selectedUser) {
      toast.error("Por favor seleccione un usuario");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Por favor seleccione un rango de fechas");
      return;
    }

    if (startDate > endDate) {
      toast.error("La fecha de inicio debe ser anterior a la fecha de fin");
      return;
    }

    setIsGenerating(true);
    try {
      // Obtener datos del usuario
      const userData = await getUserData(selectedUser.id);
      if (!userData) {
        toast.error("No se pudieron obtener los datos del usuario");
        return;
      }

      // Obtener citas del usuario
      const allAppointments = await getAppointmentsByUserId(selectedUser.id);

      // Filtrar citas por rango de fechas
      const filteredAppointments = allAppointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });

      // Generar PDF
      await generateUserReportPDF(userData, filteredAppointments, {
        startDate,
        endDate,
      });

      toast.success("PDF generado exitosamente");
      onClose();
      // Reset form
      setSelectedUser(null);
      setStartDate(undefined);
      setEndDate(undefined);
      setSearchQuery("");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exportar Informe de Usuario</DialogTitle>
          <DialogDescription>
            Busque un usuario y seleccione un rango de fechas para generar el
            informe en PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Búsqueda de usuario */}
          <div className="space-y-2">
            <Label htmlFor="user-search">Buscar Usuario (opcional)</Label>
            <Input
              id="user-search"
              placeholder="Filtrar por nombre, documento o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              {filteredUsers.length} usuario(s) encontrado(s)
            </p>
          </div>

          {/* Lista de usuarios */}
          <div className="space-y-2">
            <Label>Seleccione un usuario</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Icon
                  icon="ph:spinner"
                  className="h-6 w-6 animate-spin text-indigo-600"
                />
                <span className="ml-2 text-gray-600">Cargando usuarios...</span>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`cursor-pointer rounded-md border p-3 transition-colors ${
                      selectedUser?.id === user.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">
                      {user.document} - {user.type}
                    </div>
                    {user.email && (
                      <div className="text-xs text-gray-500">{user.email}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
                {searchQuery.trim()
                  ? "No se encontraron usuarios que coincidan con la búsqueda"
                  : "No hay usuarios registrados"}
              </div>
            )}
          </div>

          {/* Usuario seleccionado */}
          {selectedUser && (
            <div className="rounded-md border border-indigo-200 bg-indigo-50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedUser.document}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  <Icon icon="ph:x" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Rango de fechas */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Fecha de Inicio</Label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                locale={es}
                className="rounded-md border"
                disabled={(date) => date > new Date()}
              />
              {startDate && (
                <p className="text-sm text-gray-600">
                  {format(startDate, "PPP", { locale: es })}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fecha de Fin</Label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                locale={es}
                className="rounded-md border"
                disabled={(date) =>
                  date > new Date() || (startDate ? date < startDate : false)
                }
              />
              {endDate && (
                <p className="text-sm text-gray-600">
                  {format(endDate, "PPP", { locale: es })}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancelar
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={
              !selectedUser || !startDate || !endDate || isGenerating
            }
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isGenerating ? (
              <>
                <Icon
                  icon="ph:spinner"
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Generando...
              </>
            ) : (
              <>
                <Icon icon="ph:file-pdf" className="mr-2 h-4 w-4" />
                Generar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

