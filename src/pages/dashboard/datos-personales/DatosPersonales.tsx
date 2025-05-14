import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { createUserData, getUserData, updateUserData } from "@/services/user";

const formSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  fullName: z.string().min(1, "El nombre es requerido"),
  documentType: z.string().min(1, "El tipo de documento es requerido"),
  documentNumber: z.string().min(1, "El número de documento es requerido"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  phone: z.string().min(1, "El número de celular es requerido"),
  gender: z.string().min(1, "El sexo es requerido"),
});

type FormValues = z.infer<typeof formSchema>;

export default function DatosPersonales() {
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      documentType: "CC",
      documentNumber: "",
      birthDate: "",
      phone: "",
      gender: "Masculino",
    },
  });

  useEffect(() => {
    async function loadUserData() {
      if (!user?.uid) return;

      try {
        const userData = await getUserData(user.uid);
        if (userData) {
          form.reset({
            email: userData.email,
            fullName: userData.fullName,
            documentType: userData.documentType,
            documentNumber: userData.documentNumber,
            birthDate: userData.birthDate,
            phone: userData.phone,
            gender: userData.gender,
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Error al cargar los datos del usuario");
      }
    }

    loadUserData();
  }, [user, form]);

  async function onSubmit(data: FormValues) {
    if (!user?.uid) return;

    try {
      const userData = await getUserData(user.uid);
      if (userData) {
        await updateUserData(user.uid, data);
        toast.success("Datos actualizados correctamente");
      } else {
        await createUserData(user.uid, data);
        toast.success("Datos guardados correctamente");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      toast.error("Error al guardar los datos");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Datos Personales</h1>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold">Información personal</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input className="bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres y Apellidos</FormLabel>
                    <FormControl>
                      <Input className="bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                          <SelectTrigger className="bg-white">
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
                        <Input className="bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <FormControl>
                      <Input type="date" className="bg-white" {...field} />
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
                      <Input className="bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
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

            <div className="mt-8 flex justify-center">
              <Button type="submit" className="w-32 bg-indigo-600">
                Guardar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
