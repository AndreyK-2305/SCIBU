import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getAllAppointments } from "@/services/appointment";
import { getAllServices } from "@/services/service";
import { getAllSpecialists } from "@/services/specialist";

import ExportModal from "./components/ExportModal";
import UserList from "./components/UserList";

export default function Datos() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [totalServices, setTotalServices] = useState<number>(0);
  const [totalSpecialists, setTotalSpecialists] = useState<number>(0);
  const [totalAppointments, setTotalAppointments] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setIsLoading(true);

        // Cargar todos los datos en paralelo
        const [services, specialists, appointments] = await Promise.all([
          getAllServices(),
          getAllSpecialists(),
          getAllAppointments(),
        ]);

        // Contar solo servicios activos
        const activeServices = services.filter((s) => s.isActive !== false);
        setTotalServices(activeServices.length);

        // Contar solo especialistas activos
        const activeSpecialists = specialists.filter(
          (s) => s.isActive !== false,
        );
        setTotalSpecialists(activeSpecialists.length);

        // Contar todas las citas
        setTotalAppointments(appointments.length);
      } catch (error) {
        console.error("Error loading statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Datos del Sistema</h1>
        <Button onClick={() => setIsExportModalOpen(true)}>
          Exportar Datos
        </Button>
      </div>

      {/* Estadísticas del Sistema */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total de Servicios</CardTitle>
            <CardDescription>
              Servicios registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {isLoading ? "..." : totalServices}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Especialistas</CardTitle>
            <CardDescription>Especialistas activos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {isLoading ? "..." : totalSpecialists}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Citas</CardTitle>
            <CardDescription>Citas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {isLoading ? "..." : totalAppointments}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuarios */}
      <UserList />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
