import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAuth from "@/hooks/useAuth";
import { initializeLocalStorage } from "@/services/localStorage";
import { getUserData, updateUserData } from "@/services/user";

// Population groups options
const populationGroups = [
  { id: "victim", label: "Víctima de conflicto armado" },
  { id: "disability", label: "Persona con discapacidad" },
  { id: "talented", label: "Persona con talentos excepcionales" },
  { id: "afro", label: "Comunidades negras o afrocolombianas" },
  { id: "indigenous", label: "Comunidades indígenas" },
  { id: "raizal", label: "Comunidades raizales o palenqueras" },
  { id: "rom", label: "Pueblo Rrom o gitano" },
  { id: "none", label: "No pertenece" },
];

// Social programs options
const socialPrograms = [
  { id: "jovenes", label: "Jóvenes en acción" },
  { id: "generacionE1", label: "Generación E - Excelencia" },
  { id: "generacionE2", label: "Generación E - Equidad" },
  { id: "victims", label: "Fondo de Víctimas" },
  { id: "alcaldia", label: "Beneficio Alcaldía" },
  { id: "conflict", label: "Víctima del conflicto armado" },
  { id: "mentorias", label: "Mentorías" },
  { id: "matricula", label: "Matrícula Cero" },
  { id: "none", label: "Ninguno" },
];

export default function DatosPersonales() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState("CC");
  const [documentNumber, setDocumentNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Masculino");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("Estudiante");
  const [program, setProgram] = useState("");
  const [selectedPopulationGroups, setSelectedPopulationGroups] = useState<
    string[]
  >([]);
  const [selectedSocialPrograms, setSelectedSocialPrograms] = useState<
    string[]
  >([]);

  useEffect(() => {
    // Initialize localStorage if needed
    initializeLocalStorage();
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const userData = await getUserData(user.uid);

      if (userData) {
        setEmail(userData.email || "");
        setFullName(userData.fullName || "");
        setDocumentType(userData.documentType || "CC");
        setDocumentNumber(userData.documentNumber || "");
        setBirthDate(userData.birthDate || "");
        setPhone(userData.phone || "");
        setGender(userData.gender || "Masculino");
        setCode(userData.code || "");
        setStatus(userData.status || "Estudiante");
        setProgram(userData.program || "");
        setSelectedPopulationGroups(userData.populationGroups || []);
        setSelectedSocialPrograms(userData.socialPrograms || []);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Error al cargar los datos del usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) return;

    try {
      setLoading(true);

      const userData = {
        email,
        fullName,
        documentType,
        documentNumber,
        birthDate,
        phone,
        gender,
        code,
        status,
        program,
        populationGroups: selectedPopulationGroups,
        socialPrograms: selectedSocialPrograms,
        isProfileComplete: true,
      };

      await updateUserData(user.uid, userData);
      toast.success("Datos guardados correctamente");
    } catch (error) {
      console.error("Error saving user data:", error);
      toast.error("Error al guardar los datos");
    } finally {
      setLoading(false);
    }
  };

  const togglePopulationGroup = (groupId: string) => {
    setSelectedPopulationGroups((prev) => {
      // If selecting "none", clear all others
      if (groupId === "none") {
        return ["none"];
      }

      // If selecting another while "none" is selected, remove "none"
      if (prev.includes("none") && groupId !== "none") {
        return [groupId];
      }

      // Toggle normally
      const newSelection = prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId];

      return newSelection.length > 0 ? newSelection : ["none"];
    });
  };

  const toggleSocialProgram = (programId: string) => {
    setSelectedSocialPrograms((prev) => {
      // If selecting "none", clear all others
      if (programId === "none") {
        return ["none"];
      }

      // If selecting another while "none" is selected, remove "none"
      if (prev.includes("none") && programId !== "none") {
        return [programId];
      }

      // Toggle normally
      const newSelection = prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId];

      return newSelection.length > 0 ? newSelection : ["none"];
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">Datos Personales</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">Información personal</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="fullName">Nombres y Apellidos</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-2">
              <div>
                <Label htmlFor="documentType">Documento</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="documentType" className="mt-1">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">CC</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="PA">PA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="documentNumber">&nbsp;</Label>
                <Input
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Celular</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="gender">Sexo</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender" className="mt-1">
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Institutional Information */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">
            Información institucional
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Estamento</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Estudiante">Estudiante</SelectItem>
                  <SelectItem value="Docente">Docente</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="program">Programa Académico</Label>
              <Input
                id="program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Characterization Questions */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">
            Preguntas de caracterización
          </h2>

          <div className="space-y-6">
            <div>
              <Label className="mb-2 block">
                ¿Pertenece a alguno de los siguientes grupos poblacionales?
              </Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {populationGroups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={selectedPopulationGroups.includes(group.id)}
                      onCheckedChange={() => togglePopulationGroup(group.id)}
                    />
                    <Label
                      htmlFor={`group-${group.id}`}
                      className="font-normal"
                    >
                      {group.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">
                ¿Pertenece a alguno de estos programas sociales?
              </Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {socialPrograms.map((program) => (
                  <div key={program.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`program-${program.id}`}
                      checked={selectedSocialPrograms.includes(program.id)}
                      onCheckedChange={() => toggleSocialProgram(program.id)}
                    />
                    <Label
                      htmlFor={`program-${program.id}`}
                      className="font-normal"
                    >
                      {program.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-indigo-600 px-6 py-2 hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Enviar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
