import axios from "axios";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Props {
  instructorId: string;
  instructorName: string;
  onDisabled?: () => void;
}

export const DisableInstructorModal: React.FC<Props> = ({
  instructorId,
  instructorName,
  onDisabled,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDisable = async () => {
    try {
      setLoading(true);
      await axios.put(`/instructores/${instructorId}/deshabilitar/`);
      if (onDisabled) onDisabled();
    } catch (error) {
      console.error("Error deshabilitando instructor", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Deshabilitar Instructor</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            ¿Está seguro que desea deshabilitar al instructor{" "}
            <span className="font-bold text-indigo-600">{instructorName}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Esta acción no se puede deshacer. El instructor será deshabilitado y
            no podrá acceder al sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={handleDisable}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? "Deshabilitando..." : "Deshabilitar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
