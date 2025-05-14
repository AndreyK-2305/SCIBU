import { Icon } from "@iconify/react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initializeLocalStorage } from "@/services/localStorage";

interface User {
  id: string;
  name: string;
  document: string;
  type: string;
}

interface UserDetails {
  name: string;
  document: string;
  age: number;
  birthdate: string;
  gender: string;
  phone: string;
  email: string;
  type: string;
  code: string;
  program: string;
  populationGroups: string[];
  socialPrograms: string[];
  appointments: Appointment[];
}

interface Appointment {
  date: string;
  time: string;
  service: string;
  specialist: string;
  disability: boolean;
  isFirstTime: boolean;
  reason: string;
  recommendations?: string;
  status: "pendiente" | "realizado" | "cancelado";
}

export default function ConsultarUsuario() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock users data for the example
  const mockUsers: User[] = [
    {
      id: "1",
      name: "Juan David",
      document: "CC 1234567890",
      type: "Estudiante",
    },
    {
      id: "2",
      name: "Juan Camilo",
      document: "CC 0000000000",
      type: "Docente",
    },
  ];

  // Mock user details
  const mockUserDetails: Record<string, UserDetails> = {
    "1": {
      name: "Juan David",
      document: "CC 1234567890",
      age: 19,
      birthdate: "CC 1234567890",
      gender: "Masculino",
      phone: "1234567890",
      email: "juandavidv@ufps.edu.co",
      type: "Estudiante",
      code: "1152200",
      program: "Ingeniería de Sistemas",
      populationGroups: ["Grupo Poblacional 1", "Grupo Poblacional 2"],
      socialPrograms: ["Programa Social 1", "Programa Social 2"],
      appointments: [
        {
          date: "20/03/2025",
          time: "8:00 a.m.",
          service: "Consulta Odontológica",
          specialist: "Dr. Pérez",
          disability: false,
          isFirstTime: true,
          reason: "Lorem",
          recommendations: "Lorem",
          status: "realizado",
        },
      ],
    },
    "2": {
      name: "Juan Camilo",
      document: "CC 0000000000",
      age: 35,
      birthdate: "CC 0000000000",
      gender: "Masculino",
      phone: "0000000000",
      email: "juancamilo@ufps.edu.co",
      type: "Docente",
      code: "D001",
      program: "Facultad de Ingeniería",
      populationGroups: [],
      socialPrograms: [],
      appointments: [],
    },
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    // Simulate an API call
    setTimeout(() => {
      // Filter users based on the search query
      const filteredUsers = mockUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.document.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      setSearchResults(filteredUsers);
      setIsLoading(false);
    }, 500);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(mockUserDetails[userId]);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-amber-500";
      case "realizado":
        return "bg-green-500";
      case "cancelado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pendiente":
        return "Pendiente";
      case "realizado":
        return "Realizada";
      case "cancelado":
        return "Cancelada";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Consultar Usuario</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="mb-1 block text-sm font-medium">
              Documento o Nombre
            </label>
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Juan"
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? "Buscando..." : "Buscar"}
          </Button>
        </div>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && !selectedUser && (
        <div className="space-y-4">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-indigo-100 p-2">
                  <Icon icon="ph:user" className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <div className="font-semibold">Nombre</div>
                  <div>{user.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-100 p-2">
                  <Icon icon="ph:medal" className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold">Estamento</div>
                  <div>{user.type}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-2">
                  <Icon
                    icon="ph:identification-card"
                    className="h-6 w-6 text-green-600"
                  />
                </div>
                <div>
                  <div className="font-semibold">Documento</div>
                  <div>{user.document}</div>
                </div>
              </div>

              <Button
                onClick={() => handleUserSelect(user.id)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Detalles
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* User Details */}
      {selectedUser && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4">
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => setSelectedUser(null)}
            >
              <Icon icon="ph:arrow-left" className="mr-2" />
              Volver
            </Button>
            <h2 className="mb-2 text-xl font-bold">Detalles de Usuario</h2>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">Datos personales</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-indigo-100 p-2">
                  <Icon icon="ph:user" className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Nombre</div>
                  <div>{selectedUser.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Icon
                    icon="ph:identification-card"
                    className="h-5 w-5 text-green-600"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium">Documento</div>
                  <div>{selectedUser.document}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <Icon icon="ph:calendar" className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Edad</div>
                  <div>{selectedUser.age}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <Icon icon="ph:calendar" className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Fecha de nacimiento</div>
                  <div>{selectedUser.birthdate}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-indigo-100 p-2">
                  <Icon
                    icon="ph:gender-intersex"
                    className="h-5 w-5 text-indigo-600"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium">Sexo</div>
                  <div>{selectedUser.gender}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <Icon icon="ph:phone" className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Celular</div>
                  <div>{selectedUser.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <Icon icon="ph:at" className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Correo</div>
                  <div>{selectedUser.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Information */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">
              Datos institucionales
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <Icon icon="ph:medal" className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Estamento</div>
                  <div>{selectedUser.type}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Icon icon="ph:hash" className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Código</div>
                  <div>{selectedUser.code}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-teal-100 p-2">
                  <Icon
                    icon="ph:graduation-cap"
                    className="h-5 w-5 text-teal-600"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium">Programa Académico</div>
                  <div>{selectedUser.program}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Characterization */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">Caracterización</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-blue-100 p-2">
                  <Icon
                    icon="ph:users-three"
                    className="h-5 w-5 text-blue-600"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium">
                    Grupos Poblacionales
                  </div>
                  {selectedUser.populationGroups.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {selectedUser.populationGroups.map((group, index) => (
                        <div key={index}>{group}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      No pertenece a ningún grupo poblacional
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-red-100 p-2">
                  <Icon icon="ph:heart" className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Programas Sociales</div>
                  {selectedUser.socialPrograms.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {selectedUser.socialPrograms.map((program, index) => (
                        <div key={index}>{program}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      No participa en programas sociales
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Appointment History */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Historial de Citas</h3>
            {selectedUser.appointments.length > 0 ? (
              <div className="space-y-4">
                {selectedUser.appointments.map((appointment, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="font-medium">
                        {appointment.date} - {appointment.time}
                      </div>
                      <span
                        className={`${getStatusBadgeClass(appointment.status)} rounded-full px-2 py-1 text-xs font-medium text-white`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-purple-100 p-2">
                          <Icon
                            icon="ph:stethoscope"
                            className="h-5 w-5 text-purple-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Servicio</div>
                          <div>{appointment.service}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-green-100 p-2">
                          <Icon
                            icon="ph:user-focus"
                            className="h-5 w-5 text-green-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            Especialista
                          </div>
                          <div>{appointment.specialist}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-orange-100 p-2">
                          <Icon
                            icon="ph:bandaids"
                            className="h-5 w-5 text-orange-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Incapacidad</div>
                          <div>{appointment.disability ? "Si" : "No"}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-100 p-2">
                          <Icon
                            icon="ph:info"
                            className="h-5 w-5 text-blue-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Primera vez</div>
                          <div>{appointment.isFirstTime ? "Si" : "No"}</div>
                        </div>
                      </div>

                      <div className="col-span-1 flex items-start gap-3 md:col-span-2">
                        <div className="rounded-full bg-blue-100 p-2">
                          <Icon
                            icon="ph:chat-circle-text"
                            className="h-5 w-5 text-blue-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Motivo</div>
                          <div>{appointment.reason}</div>
                        </div>
                      </div>

                      {appointment.recommendations && (
                        <div className="col-span-1 flex items-start gap-3 md:col-span-2">
                          <div className="rounded-full bg-purple-100 p-2">
                            <Icon
                              icon="ph:note-pencil"
                              className="h-5 w-5 text-purple-600"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              Recomendaciones
                            </div>
                            <div>{appointment.recommendations}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-gray-500">
                No hay citas registradas
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !isLoading && (
        <div className="rounded-lg border bg-gray-50 p-8 text-center">
          <Icon
            icon="ph:magnifying-glass"
            className="mx-auto mb-4 h-12 w-12 text-gray-400"
          />
          <p className="mb-2 text-gray-600">
            No se encontraron resultados para "{searchQuery}"
          </p>
          <p className="text-sm text-gray-500">
            Intenta con otro término de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}
