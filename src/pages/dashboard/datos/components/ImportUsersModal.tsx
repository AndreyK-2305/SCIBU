import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CSVUserData, createUserFromCSV } from "@/services/user";

interface ImportUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export default function ImportUsersModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportUsersModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    total: number;
    success: number;
    errors: number;
    errorDetails: Array<{ email: string; error: string }>;
  } | null>(null);

  // Función para parsear CSV
  const parseCSV = (csvText: string): CSVUserData[] => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length === 0) {
      throw new Error("El archivo CSV está vacío");
    }

    // Omitir la primera línea si es un encabezado
    const dataLines = lines.slice(1);
    const users: CSVUserData[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      // Parsear la línea CSV (manejar comillas y comas)
      const values: string[] = [];
      let currentValue = "";
      let insideQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim()); // Agregar el último valor

      // Validar que tenga al menos 6 columnas
      if (values.length < 6) {
        console.warn(`Línea ${i + 2} tiene menos de 6 columnas, omitiendo`);
        continue;
      }

      const [documentType, documentNumber, fullName, email, code, program] =
        values;

      // Validar campos requeridos
      if (!email || !email.includes("@")) {
        console.warn(`Línea ${i + 2}: Email inválido, omitiendo`);
        continue;
      }

      if (!fullName || !documentNumber || !documentType) {
        console.warn(`Línea ${i + 2}: Campos requeridos faltantes, omitiendo`);
        continue;
      }

      users.push({
        documentType: documentType.trim(),
        documentNumber: documentNumber.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        code: code?.trim() || "",
        program: program?.trim() || "",
      });
    }

    return users;
  };

  // Función para manejar el cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error("Por favor selecciona un archivo CSV");
        return;
      }
      setFile(selectedFile);
      setResults(null);
    }
  };

  // Función para procesar el CSV
  const handleImport = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo CSV");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      // Leer el archivo
      const text = await file.text();
      const users = parseCSV(text);

      if (users.length === 0) {
        toast.error("No se encontraron usuarios válidos en el archivo CSV");
        setIsProcessing(false);
        return;
      }

      const total = users.length;
      let success = 0;
      let errors = 0;
      const errorDetails: Array<{ email: string; error: string }> = [];

      // Procesar usuarios uno por uno
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        setProgress(((i + 1) / total) * 100);

        try {
          const result = await createUserFromCSV(user, "123456");
          if (result.success) {
            success++;
          } else {
            errors++;
            errorDetails.push({
              email: user.email,
              error: result.error || "Error desconocido",
            });
          }
        } catch (error: any) {
          errors++;
          errorDetails.push({
            email: user.email,
            error: error.message || "Error desconocido",
          });
        }

        // Pequeña pausa para no sobrecargar Firebase
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setResults({
        total,
        success,
        errors,
        errorDetails,
      });

      if (errors === 0) {
        toast.success(`✅ ${success} usuarios importados exitosamente`);
      } else {
        toast.warning(
          `⚠️ ${success} usuarios importados, ${errors} errores`,
        );
      }

      // Cerrar sesión al finalizar la importación (si se crearon usuarios)
      if (success > 0) {
        // Importar signOut desde firebase/auth
        const { getAuth, signOut } = await import("firebase/auth");
        const auth = getAuth();
        
        try {
          await signOut(auth);
          toast.info(
            "Importación completada. Tu sesión se cerró. Por favor, vuelve a iniciar sesión.",
            { duration: 5000 },
          );
          
          // Redirigir al login después de un breve delay
          setTimeout(() => {
            window.location.href = "/auth/login";
          }, 2000);
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        }
      }

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error: any) {
      console.error("Error processing CSV:", error);
      toast.error(`Error al procesar el CSV: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para descargar plantilla CSV
  const downloadTemplate = () => {
    const template = `documento,numero documento,nombre,correo,codigo,programa academico
CC,1234567890,Juan Pérez,juan.perez@example.com,20241001,Ingeniería de Sistemas
TI,9876543210,María García,maria.garcia@example.com,20241002,Psicología`;

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_usuarios.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setFile(null);
      setResults(null);
      setProgress(0);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importar Usuarios desde CSV</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV con los datos de los usuarios. Todos los
            usuarios creados tendrán la contraseña "123456".
          </DialogDescription>
        </DialogHeader>

        {/* Advertencia importante */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-2">
            <Icon icon="ph:warning" className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">
                ⚠️ Advertencia Importante
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Después de importar usuarios, tu sesión se cerrará automáticamente 
                y deberás volver a iniciar sesión. Esto es necesario para crear 
                las cuentas de los usuarios correctamente.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Información del formato */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-blue-900">
              Formato del CSV:
            </h3>
            <p className="text-xs text-blue-800">
              El archivo debe tener las siguientes columnas (en orden):
            </p>
            <ul className="mt-2 list-inside list-disc text-xs text-blue-800">
              <li>documento (CC, TI, etc.)</li>
              <li>numero documento</li>
              <li>nombre</li>
              <li>correo</li>
              <li>codigo</li>
              <li>programa academico</li>
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={downloadTemplate}
            >
              <Icon icon="ph:download" className="mr-2 h-4 w-4" />
              Descargar Plantilla
            </Button>
          </div>

          {/* Selector de archivo */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Seleccionar archivo CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Procesando usuarios...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Resultados */}
          {results && (
            <div className="space-y-2">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 text-sm font-semibold">Resultados:</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Total:</span> {results.total}
                  </p>
                  <p className="text-green-600">
                    <span className="font-medium">Exitosos:</span>{" "}
                    {results.success}
                  </p>
                  <p className="text-red-600">
                    <span className="font-medium">Errores:</span>{" "}
                    {results.errors}
                  </p>
                </div>

                {results.errorDetails.length > 0 && (
                  <div className="mt-4 max-h-40 overflow-y-auto">
                    <h4 className="mb-2 text-xs font-semibold text-red-600">
                      Detalles de errores:
                    </h4>
                    <ul className="space-y-1 text-xs">
                      {results.errorDetails.map((error, index) => (
                        <li key={index} className="text-red-600">
                          <span className="font-medium">{error.email}:</span>{" "}
                          {error.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              {results ? "Cerrar" : "Cancelar"}
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Icon
                    icon="ph:spinner"
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                  Procesando...
                </>
              ) : (
                <>
                  <Icon icon="ph:upload" className="mr-2 h-4 w-4" />
                  Importar Usuarios
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

