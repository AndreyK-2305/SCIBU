import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { getAppointmentsByUserId } from "@/services/appointment";
import { getUserData, UserData } from "@/services/user";
import { Appointment } from "@/types/appointment";

interface User {
  id: string;
  name: string;
  document: string;
  type: string;
}

export default function ConsultarUsuario() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<{
    userData: UserData;
    appointments: Appointment[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Search users by fullName or documentNumber
      const usersQuery = query(
        collection(db, "users"),
        where("fullName", ">=", searchQuery),
        where("fullName", "<=", searchQuery + "\uf8ff"),
      );

      const userSnapshot = await getDocs(usersQuery);

      // Or try to search by document number
      let userResults: User[] = [];

      if (userSnapshot.empty) {
        const docQuery = query(
          collection(db, "users"),
          where("documentNumber", ">=", searchQuery),
          where("documentNumber", "<=", searchQuery + "\uf8ff"),
        );

        const docSnapshot = await getDocs(docQuery);

        docSnapshot.forEach((doc) => {
          const data = doc.data();
          userResults.push({
            id: doc.id,
            name: data.fullName || "Usuario sin nombre",
            document:
              `${data.documentType || ""} ${data.documentNumber || ""}`.trim(),
            type: data.status || "No especificado",
          });
        });
      } else {
        userSnapshot.forEach((doc) => {
          const data = doc.data();
          userResults.push({
            id: doc.id,
            name: data.fullName || "Usuario sin nombre",
            document:
              `${data.documentType || ""} ${data.documentNumber || ""}`.trim(),
            type: data.status || "No especificado",
          });
        });
      }

      setSearchResults(userResults);

      if (userResults.length === 0) {
        setError("No se encontraron usuarios que coincidan con la búsqueda");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setError("Error al buscar usuarios. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get user data
      const userData = await getUserData(userId);

      if (!userData) {
        throw new Error("No se pudo obtener la información del usuario");
      }

      // Get user appointments
      const userAppointments = await getAppointmentsByUserId(userId);

      // Set selected user with both user data and appointments
      setSelectedUser({
        userData,
        appointments: userAppointments,
      });
    } catch (error) {
      console.error("Error getting user details:", error);
      setError("Error al obtener los detalles del usuario");
    } finally {
      setIsLoading(false);
    }
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

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy");
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
              placeholder="Ingrese nombre o documento"
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

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      )}

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
                  <div>
                    {selectedUser.userData.fullName || "No especificado"}
                  </div>
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
                  <div>
                    {`${selectedUser.userData.documentType || ""} ${selectedUser.userData.documentNumber || ""}`.trim() ||
                      "No especificado"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <Icon icon="ph:calendar" className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Fecha de nacimiento</div>
                  <div>
                    {selectedUser.userData.birthDate || "No especificado"}
                  </div>
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
                  <div>{selectedUser.userData.gender || "No especificado"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <Icon icon="ph:phone" className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Celular</div>
                  <div>{selectedUser.userData.phone || "No especificado"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <Icon icon="ph:at" className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Correo</div>
                  <div>{selectedUser.userData.email || "No especificado"}</div>
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
                  <div>{selectedUser.userData.status || "No especificado"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Icon icon="ph:hash" className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Código</div>
                  <div>{selectedUser.userData.code || "No especificado"}</div>
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
                  <div>
                    {selectedUser.userData.program || "No especificado"}
                  </div>
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
                  {selectedUser.userData.populationGroups &&
                  selectedUser.userData.populationGroups.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {selectedUser.userData.populationGroups.map(
                        (group, index) => (
                          <div key={index}>{group}</div>
                        ),
                      )}
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
                  {selectedUser.userData.socialPrograms &&
                  selectedUser.userData.socialPrograms.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {selectedUser.userData.socialPrograms.map(
                        (program, index) => (
                          <div key={index}>{program}</div>
                        ),
                      )}
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
                        {formatDate(appointment.date)} - {appointment.time}
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
                          <div>{appointment.serviceType}</div>
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
                          <div>{appointment.specialistName}</div>
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
                          <div>{appointment.reason || "No especificado"}</div>
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
      {searchQuery && searchResults.length === 0 && !isLoading && !error && (
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
