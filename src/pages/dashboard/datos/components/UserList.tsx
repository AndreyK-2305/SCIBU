import { Icon } from "@iconify/react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { getAppointmentsByUserId } from "@/services/appointment";
import { UserData, setUserAsAdmin } from "@/services/user";

interface User {
  id: string;
  name: string;
  document: string;
  type: string;
  email: string;
  role: string;
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

interface UserDetails {
  name: string;
  document: string;
  documentType: string;
  documentNumber: string;
  age?: number;
  birthDate: string;
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

export default function UserList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);

  // Load users from Firebase on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);

        const users: User[] = [];
        usersSnapshot.forEach((doc) => {
          const userData = doc.data() as UserData;
          users.push({
            id: doc.id,
            name: userData.fullName || "Sin nombre",
            document: `${userData.documentType || ""} ${userData.documentNumber || ""}`,
            type: userData.status || "Sin estamento",
            email: userData.email || "",
            role: userData.role || "beneficiario",
          });
        });

        setAllUsers(users);
        // Initially show all users
        setSearchResults(users);
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Error al cargar usuarios");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      // If search is empty, show all users
      setSearchResults(allUsers);
      return;
    }

    setIsLoading(true);

    // Filter users based on the search query
    const filteredUsers = allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.document.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    setSearchResults(filteredUsers);
    setIsLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setIsLoading(true);

      if (newRole === "admin") {
        // Use the setUserAsAdmin function from services
        await setUserAsAdmin(userId);
      } else {
        // For other roles, update the role field directly
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          role: newRole,
        });
      }

      // Update local state
      setSearchResults((prevResults) =>
        prevResults.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );

      setAllUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );

      toast.success(`Rol de usuario actualizado a ${newRole}`);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Error al actualizar el rol del usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = async (userId: string) => {
    try {
      setIsLoading(true);

      // Fetch user details from Firebase
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        toast.error("Usuario no encontrado");
        return;
      }

      const userData = userDoc.data() as UserData;

      // Calculate age (if birthDate exists)
      let age: number | undefined = undefined;
      if (userData.birthDate) {
        const birthYear = new Date(userData.birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        age = currentYear - birthYear;
      }

      // Fetch real appointment data from Firebase
      const appointmentsData = await getAppointmentsByUserId(userId);

      // Convert the Firebase appointments to the format expected by the UI
      const appointments: Appointment[] = appointmentsData.map(
        (appointment) => ({
          date: appointment.date.toLocaleDateString("es-CO"),
          time: appointment.time,
          service: appointment.serviceType,
          specialist: appointment.specialistName,
          disability: appointment.disability,
          isFirstTime: appointment.isFirstTime,
          reason: appointment.reason || "",
          recommendations: appointment.recommendations,
          status: appointment.status as "pendiente" | "realizado" | "cancelado",
        }),
      );

      // Create the user details object
      const userDetails: UserDetails = {
        name: userData.fullName || "Sin nombre",
        document: `${userData.documentType || ""} ${userData.documentNumber || ""}`,
        documentType: userData.documentType || "",
        documentNumber: userData.documentNumber || "",
        age,
        birthDate: userData.birthDate || "",
        gender: userData.gender || "",
        phone: userData.phone || "",
        email: userData.email || "",
        type: userData.status || "",
        code: userData.code || "",
        program: userData.program || "",
        populationGroups: userData.populationGroups || [],
        socialPrograms: userData.socialPrograms || [],
        appointments,
      };

      setSelectedUser(userDetails);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Error al cargar los detalles del usuario");
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

  // Render the user details view
  if (selectedUser) {
    return (
      <div className="space-y-6">
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
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
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

            {selectedUser.age && (
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <Icon icon="ph:calendar" className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Edad</div>
                  <div>{selectedUser.age}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <Icon icon="ph:calendar" className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Fecha de nacimiento</div>
                <div>{selectedUser.birthDate}</div>
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
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Datos institucionales</h3>
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
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Caracterización</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-blue-100 p-2">
                <Icon icon="ph:users-three" className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Grupos Poblacionales</div>
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
        <div className="rounded-lg bg-white p-6 shadow-sm">
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
                        <div className="text-sm font-medium">Especialista</div>
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

                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-indigo-100 p-2">
                        <Icon
                          icon="ph:question"
                          className="h-5 w-5 text-indigo-600"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Motivo</div>
                        <div>{appointment.reason}</div>
                      </div>
                    </div>

                    {appointment.recommendations && (
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-violet-100 p-2">
                          <Icon
                            icon="ph:note-pencil"
                            className="h-5 w-5 text-violet-600"
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
            <div className="text-center text-gray-500">
              No hay citas registradas para este usuario
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Consultar Usuario</h2>

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

      {/* User List - Card style */}
      {searchResults.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {isLoading
            ? "Cargando usuarios..."
            : searchQuery
              ? "No se encontraron resultados. Intenta con otra búsqueda."
              : "No hay usuarios registrados en el sistema."}
        </div>
      ) : (
        <div className="space-y-4">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex flex-col rounded-lg border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="mb-3 flex items-center gap-4 md:mb-0">
                <div className="rounded-full bg-indigo-100 p-2">
                  <Icon icon="ph:user" className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <div className="font-semibold">Nombre</div>
                  <div>{user.name}</div>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-4 md:mb-0">
                <div className="rounded-full bg-amber-100 p-2">
                  <Icon icon="ph:medal" className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold">Estamento</div>
                  <div>{user.type}</div>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-4 md:mb-0">
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

              <div className="flex items-center justify-between">
                <Button
                  onClick={() => handleUserSelect(user.id)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Detalles
                </Button>

                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="ml-3 rounded border border-gray-300 px-2 py-1 text-sm"
                  disabled={isLoading}
                >
                  <option value="beneficiario">Beneficiario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
