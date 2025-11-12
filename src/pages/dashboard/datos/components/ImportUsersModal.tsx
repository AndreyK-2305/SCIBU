import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
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
import { CSVUserData } from "@/services/user";

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

  // Función para obtener la URL de la API de importación
  const getImportApiUrl = (): string => {
    // Si hay una variable de entorno configurada, usarla
    if (import.meta.env.VITE_API_URL) {
      const baseUrl = import.meta.env.VITE_API_URL.replace("/api/send-email", "");
      return `${baseUrl}/api/import-users`;
    }

    // Detectar si estamos en GitHub Pages
    const isGitHubPages =
      window.location.hostname.includes("github.io") ||
      window.location.hostname.includes("github.com");

    if (isGitHubPages) {
      return "https://scibu-xp9w.vercel.app/api/import-users";
    }

    // En desarrollo local o Vercel, usar ruta relativa
    return "/api/import-users";
  };

  // Función para procesar el CSV usando la API route
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

      const apiUrl = getImportApiUrl();

      // Actualizar progreso inicial
      setProgress(10);

      // Enviar usuarios a la API
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          users,
          password: "123456",
        }),
      });

      setProgress(90);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        
        // Mensaje más descriptivo para errores de configuración
        if (response.status === 500 && errorMessage.includes("Firebase Admin SDK")) {
          throw new Error(
            "El servidor no está configurado correctamente. " +
            "Por favor, configura FIREBASE_SERVICE_ACCOUNT en las variables de entorno de Vercel. " +
            "Consulta la documentación para más detalles."
          );
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setProgress(100);

      // Establecer resultados
      setResults(data.results);

      if (data.results.errors === 0) {
        toast.success(`✅ ${data.results.success} usuarios importados exitosamente`);
      } else {
        toast.warning(
          `⚠️ ${data.results.success} usuarios importados, ${data.results.errors} errores`,
        );
      }

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error: any) {
      console.error("Error processing CSV:", error);
      toast.error(`Error al procesar el CSV: ${error.message}`);
      setProgress(0);
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

  // Mantener el progreso al 100% cuando termine
  useEffect(() => {
    if (results && !isProcessing) {
      setProgress(100);
    }
  }, [results, isProcessing]);

  return (
    <>
      {/* Overlay de carga para evitar pantalla en blanco */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <Icon
                icon="ph:spinner"
                className="h-8 w-8 animate-spin text-indigo-600"
              />
              <p className="text-sm font-medium text-gray-700">
                Importando usuarios...
              </p>
              <div className="w-64">
                <Progress value={progress} className="h-2" />
                <p className="mt-2 text-center text-xs text-gray-500">
                  {Math.round(progress)}% completado
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importar Usuarios desde CSV</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV con los datos de los usuarios. Todos los
            usuarios creados tendrán la contraseña "123456".
          </DialogDescription>
        </DialogHeader>

        {/* Información importante */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-2">
            <Icon icon="ph:info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">
                ℹ️ Información
              </p>
              <p className="text-xs text-blue-800 mt-1">
                Durante la importación, verás el progreso en tiempo real. 
                La importación puede tomar unos minutos dependiendo de la cantidad de usuarios.
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

          {/* Progreso - Mantener visible incluso después de procesar */}
          {(isProcessing || results) && (
            <div className="space-y-2 rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>
                  {isProcessing
                    ? "Procesando usuarios..."
                    : "✅ Procesamiento completado"}
                </span>
                <span className="text-indigo-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              {isProcessing && (
                <p className="text-xs text-gray-500">
                  Por favor, espera mientras se importan los usuarios. No cierres esta ventana.
                </p>
              )}
              {results && !isProcessing && (
                <p className="text-xs text-green-600 font-medium">
                  Importación finalizada. Puedes cerrar esta ventana.
                </p>
              )}
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
    </>
  );
}

