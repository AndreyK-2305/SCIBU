import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
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
import { InputPassword } from "@/components/ui/input-password";
import { useRegister } from "@/hooks/useRegister";

import UserDataForm from "./components/UserDataForm";

// Función para medir la fortaleza de la contraseña
function measurePasswordStrength(password: string): {
  strength: number;
  message: string;
  color: string;
} {
  let strength = 0;
  let message = "Muy débil";
  let color = "bg-red-500";

  // Criterios de fortaleza
  if (password.length >= 8) strength += 20;
  if (password.match(/[a-z]/)) strength += 20;
  if (password.match(/[A-Z]/)) strength += 20;
  if (password.match(/[0-9]/)) strength += 20;
  if (password.match(/[^a-zA-Z0-9]/)) strength += 20;

  // Determinar mensaje y color basado en la fortaleza
  if (strength >= 80) {
    message = "Muy fuerte";
    color = "bg-green-500";
  } else if (strength >= 60) {
    message = "Fuerte";
    color = "bg-blue-500";
  } else if (strength >= 40) {
    message = "Media";
    color = "bg-yellow-500";
  } else if (strength >= 20) {
    message = "Débil";
    color = "bg-orange-500";
  }

  return { strength, message, color };
}

const formSchema = z.object({
  email: z.string().email("El correo no es válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const { registerWithEmail, registerWithGoogle } = useRegister();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showUserDataForm, setShowUserDataForm] = useState(false);
  const [registrationData, setRegistrationData] = useState<FormValues | null>(
    null,
  );
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    message: "",
    color: "",
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormValues) {
    if (isRegistering) return;

    try {
      setIsRegistering(true);
      setRegistrationData(data);
      setShowUserDataForm(true);
    } catch (error) {
      console.error("Error en el registro:", error);
      setIsRegistering(false);
    }
  }

  const handlePasswordChange = (value: string) => {
    const strength = measurePasswordStrength(value);
    setPasswordStrength(strength);
  };

  if (showUserDataForm && registrationData) {
    return (
      <UserDataForm
        email={registrationData.email}
        password={registrationData.password}
        onBack={() => {
          setShowUserDataForm(false);
          setIsRegistering(false);
        }}
      />
    );
  }

  return (
    <div className="flex max-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <h1 className="text-2xl font-bold">Crear Cuenta</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="pepe@ufps.edu.co"
                      {...field}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Contraseña</FormLabel>
                  <FormControl>
                    <InputPassword
                      {...field}
                      className="h-10"
                      onChange={(e) => {
                        field.onChange(e);
                        handlePasswordChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  {field.value && (
                    <div className="mt-2">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Fortaleza: {passwordStrength.message}
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-2">
              <Button
                type="submit"
                className="h-10 w-full bg-[#6366F1] font-semibold hover:bg-[#4F46E5]"
                disabled={isRegistering}
              >
                Crear Cuenta
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">
                    O crea tu cuenta con
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-10 w-full border-gray-200 font-semibold"
                onClick={() => registerWithGoogle()}
              >
                <Icon icon="flat-color:google" className="mr-2 h-5 w-5" />
                Google
              </Button>

              <p className="text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/auth/login"
                  className="text-[#6366F1] hover:text-[#4F46E5]"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
