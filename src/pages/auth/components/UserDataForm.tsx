import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAuth from "@/hooks/useAuth";
import { useRegister } from "@/hooks/useRegister";
import { updateUserData, UserData } from "@/services/user";

interface UserDataFormProps {
  email?: string;
  password?: string;
  onBack?: () => void;
}

const formSchema = z.object({
  fullName: z.string().min(1, "El nombre es requerido"),
  documentType: z.string().min(1, "El tipo de documento es requerido"),
  documentNumber: z.string().min(1, "El número de documento es requerido"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  phone: z.string().min(1, "El número de celular es requerido"),
  gender: z.string().min(1, "El sexo es requerido"),
  code: z.string().min(1, "El código es requerido"),
  status: z.string().min(1, "El estamento es requerido"),
  program: z.string().min(1, "El programa académico es requerido"),
  populationGroups: z.array(z.string()),
  socialPrograms: z.array(z.string()),
  email: z.string().optional(),
  role: z.string().optional(),
});

const populationGroupOptions = [
  { id: "victim", label: "Víctima de conflicto armado" },
  { id: "disability", label: "Persona con discapacidad" },
  { id: "talented", label: "Persona con talentos excepcionales" },
  { id: "afro", label: "Comunidades negras o afrocolombianas" },
  { id: "indigenous", label: "Comunidades indígenas" },
  { id: "raizal", label: "Comunidades raizales o palenqueras" },
  { id: "rom", label: "Pueblo Rrom o gitano" },
  { id: "none", label: "No pertenece" },
];

const socialProgramOptions = [
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

type FormValues = z.infer<typeof formSchema>;

export default function UserDataForm({
  email,
  password,
  onBack,
}: UserDataFormProps) {
  const { user } = useAuth();
  const { registerWithEmail } = useRegister();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      documentType: "CC",
      documentNumber: "",
      birthDate: "",
      phone: "",
      gender: "Masculino",
      code: "",
      status: "Estudiante",
      program: "",
      populationGroups: [],
      socialPrograms: [],
      email: email || "",
      role: "beneficiario",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting form data:", data);

      const profileData = {
        ...data,
        email: email || data.email || user?.email || "",
        role: data.role || "beneficiario",
      };

      if (email && password) {
        // Modo registro: crear cuenta y luego actualizar datos
        await registerWithEmail(email, password, profileData);
        toast.success("Cuenta creada exitosamente");
        navigate("/auth/login");
      } else if (user?.uid) {
        // Modo completar perfil: solo actualizar datos
        await updateUserData(user.uid, {
          ...profileData,
          isProfileComplete: true,
        });
        toast.success("Perfil actualizado correctamente");
        // Esperar un momento para mostrar "Finalizado"
        await new Promise((resolve) => setTimeout(resolve, 1000));
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar la solicitud");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/auth/login");
    }
  };

  return (
    <div className="relative mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-sm">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 rounded-full hover:bg-gray-100"
        onClick={handleCancel}
      >
        <X className="h-5 w-5 text-gray-600" />
      </Button>

      {/* Logo and Title */}
      <div className="mb-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold">
          Necesitamos más información sobre ti
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-medium">Información personal</h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres y Apellidos</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-[120px_1fr] gap-2">
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documento</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CC">CC</SelectItem>
                          <SelectItem value="TI">TI</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>&nbsp;</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de nacimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-medium">
              Información institucional
            </h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estamento</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Estudiante">Estudiante</SelectItem>
                        <SelectItem value="Docente">Docente</SelectItem>
                        <SelectItem value="Administrativo">
                          Administrativo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Programa Académico</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="115">
                          115 - Ingeniería de Sistemas
                        </SelectItem>
                        <SelectItem value="116">
                          116 - Ingeniería Electrónica
                        </SelectItem>
                        <SelectItem value="117">
                          117 - Ingeniería Civil
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-medium">
              Preguntas de caracterización
            </h2>
            <div className="space-y-6">
              <div>
                <FormLabel>
                  ¿Pertenece a alguno de los siguientes grupos poblacionales?
                </FormLabel>
                <FormField
                  control={form.control}
                  name="populationGroups"
                  render={() => (
                    <FormItem>
                      <div className="mt-2 grid gap-2">
                        {populationGroupOptions.map((option) => (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="populationGroups"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={option.id}
                                  className="flex items-center space-x-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              option.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== option.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>
                  ¿Pertenece a alguno de estos programas sociales?
                </FormLabel>
                <FormField
                  control={form.control}
                  name="socialPrograms"
                  render={() => (
                    <FormItem>
                      <div className="mt-2 grid gap-2">
                        {socialProgramOptions.map((option) => (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="socialPrograms"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={option.id}
                                  className="flex items-center space-x-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              option.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== option.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              className="w-32 bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Finalizado" : "Enviar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
