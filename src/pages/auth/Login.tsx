import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
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
import useAuth from "@/hooks/useAuth";
import { handleFirebaseError } from "@/lib/error";
import { db } from "@/lib/firebase";
import { createUserData, getUserData, updateUserData } from "@/services/user";

//import { ADMIN_CREDENTIALS } from "@/utils/adminInfo";

export default function Login() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const formSchema = z.object({
    email: z.string().email("El correo no es válido"),
    password: z.string().nonempty("La contraseña no puede estar vacía"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Función para verificar permisos de Firestore
  const checkFirestorePermissions = async (uid: string) => {
    try {
      console.log("Verificando permisos de Firestore para el usuario:", uid);

      // Intentar leer el documento del usuario
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      console.log("Lectura de documento exitosa:", userDocSnap.exists());

      if (!userDocSnap.exists()) {
        console.log(
          "Documento de usuario no existe. Esto puede ser normal para nuevos usuarios.",
        );
      }

      return true;
    } catch (error) {
      console.error("Error al verificar permisos de Firestore:", error);
      return false;
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Intentando iniciar sesión con:", { email: values.email });
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      console.log("Inicio de sesión exitoso");

      // Verificar permisos de Firestore
      const firestoreAccess = await checkFirestorePermissions(
        userCredential.user.uid,
      );
      if (!firestoreAccess) {
        console.warn(
          "El usuario se autenticó pero no puede acceder a Firestore",
        );
        toast.warning(
          "Inicio de sesión exitoso, pero hay problemas con el acceso a datos",
        );
      }

      // Mostrar mensaje de éxito
      toast.success("Inicio de sesión exitoso");

      // Redirigir al dashboard después de un inicio de sesión exitoso
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Error completo de inicio de sesión:", error);

      if (error instanceof FirebaseError) {
        console.error("Código de error Firebase:", error.code);
        console.error("Mensaje de error Firebase:", error.message);
        handleFirebaseError(toast.error, error);
      } else {
        toast.error(
          "Error al iniciar sesión. Comprueba tu conexión a internet y vuelve a intentarlo.",
        );
      }
    }
  }

  async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();

    try {
      console.log("Iniciando autenticación con Google");
      const userCredential = await signInWithPopup(auth, provider);
      console.log("Autenticación con Google exitosa");

      // Verificar si el usuario ya existe en Firestore
      const userData = await getUserData(userCredential.user.uid);

      // Si el usuario no existe en Firestore, crear los datos iniciales con la información de Google
      if (!userData) {
        console.log("Creando datos de usuario de Google en Firestore");

        // Obtener información del perfil de Google
        const displayName = userCredential.user.displayName || "";
        const email = userCredential.user.email || "";

        // Considerar esto como un perfil básico (incompleto)
        // Estos campos estarán vacíos, lo que marca el perfil como incompleto
        await createUserData(userCredential.user.uid, {
          email,
          fullName: displayName,
          documentType: "",
          documentNumber: "", // Campo requerido vacío = perfil incompleto
          birthDate: "", // Campo requerido vacío = perfil incompleto
          phone: "", // Campo requerido vacío = perfil incompleto
          gender: "",
          code: "",
          status: "",
          program: "",
          populationGroups: [],
          socialPrograms: [],
          role: "beneficiario",
        });

        console.log(
          "Datos de usuario de Google creados con éxito (perfil incompleto)",
        );
      } else if (userData.isProfileComplete === true) {
        // Verificar si realmente el perfil está completo según nuestros criterios
        const isActuallyComplete =
          userData.documentNumber && userData.birthDate && userData.phone;

        // Si el sistema dice que está completo pero falta información crítica, actualizarlo
        if (!isActuallyComplete) {
          console.log("Corrigiendo estado de perfil a incompleto");
          await updateUserData(userCredential.user.uid, {
            isProfileComplete: false,
          });
        }
      }

      // Verificar permisos de Firestore
      const firestoreAccess = await checkFirestorePermissions(
        userCredential.user.uid,
      );
      if (!firestoreAccess) {
        console.warn(
          "El usuario se autenticó con Google pero no puede acceder a Firestore",
        );
        toast.warning(
          "Inicio de sesión exitoso, pero hay problemas con el acceso a datos",
        );
      }

      // Mostrar mensaje de éxito y redirigir
      toast.success("Inicio de sesión con Google exitoso");
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Error completo de Google login:", error);

      if (error instanceof FirebaseError) {
        console.error("Código de error Firebase (Google):", error.code);
        console.error("Mensaje de error Firebase (Google):", error.message);
        handleFirebaseError(toast.error, error, [
          "auth/popup-closed-by-user",
          "auth/cancelled-popup-request",
        ]);
      } else {
        toast.error(
          "Error al iniciar sesión con Google. Comprueba tu conexión a internet y vuelve a intentarlo.",
        );
      }
    }
  }

  return (
    <div className="flex max-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
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
                      placeholder="correo@ejemplo.com"
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
                    <InputPassword {...field} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-right">
              <Button
                variant="link"
                className="p-0 text-xs text-[#6366F1] hover:text-[#4F46E5]"
              >
                <Link to="../password-recovery">Olvidé mi contraseña</Link>
              </Button>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="h-10 w-full bg-[#6366F1] font-semibold hover:bg-[#4F46E5]"
              >
                Iniciar sesión
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">
                    O inicia sesión con
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-10 w-full border-gray-200 font-semibold"
                onClick={handleGoogleLogin}
              >
                <Icon icon="flat-color:google" className="mr-2 h-5 w-5" />
                Google
              </Button>

              <p className="text-center text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <Link
                  to="/auth/register"
                  className="text-[#6366F1] hover:text-[#4F46E5]"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
