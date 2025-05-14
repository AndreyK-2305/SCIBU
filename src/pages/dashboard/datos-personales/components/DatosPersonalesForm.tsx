import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormCombobox from "@/components/ui/form-combobox";
import FormInput from "@/components/ui/form-input";
import FormInputDate from "@/components/ui/form-input-date";
import FormSelect from "@/components/ui/form-select";
import { useAsyncWithToken } from "@/hooks/useAsyncWithToken";
import { handleAxiosError } from "@/lib/error";
import {
  DatosPersonalesFormInput,
  DatosPersonalesFormOutput,
  DatosPersonalesFormSchema,
} from "@/schemas/datos-personales";
import { getAll as getEstadosCiviles } from "@/services/estado-civil";
import { getAll as getModalidades } from "@/services/modalidad";
import { getAll as getMunicipios } from "@/services/municipio";
import { getAll as getPaises } from "@/services/pais";
import { getAll as getPoblacionesEspeciales } from "@/services/poblacion-especial";
import { getAll as getTiposDocumento } from "@/services/tipo-documento";

interface DatosPersonalesFormProps {
  onSubmit: (data: DatosPersonalesFormOutput) => void;
}

export default function DatosPersonalesForm({
  onSubmit,
}: DatosPersonalesFormProps) {
  const form = useForm<
    DatosPersonalesFormInput,
    unknown,
    DatosPersonalesFormOutput
  >({
    resolver: zodResolver(DatosPersonalesFormSchema),
    defaultValues: {
      primer_nombre: "",
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: "",
      id_tipo_documento: undefined,
      documento: "",
      fecha_expedicion: new Date(),
      sexo: undefined,
      fecha_nacimiento: new Date(),
      id_pais: undefined,
      id_municipio: undefined,
      telefono: "",
      correo_personal: "",
      correo_institucional: "",
      direccion_institucional: "",
      id_poblacion_especial: undefined,
      id_estado_civil: undefined,
      direccion: "",
      entidad: "",
      id_modalidad: undefined,
    },
  });

  const { result: tiposDocumento } = useAsyncWithToken(getTiposDocumento, []);
  const { result: paises } = useAsyncWithToken(getPaises, []);
  const { result: municipios } = useAsyncWithToken(getMunicipios, []);
  const { result: poblacionesEspeciales } = useAsyncWithToken(
    getPoblacionesEspeciales,
    [],
  );
  const { result: estadosCiviles } = useAsyncWithToken(getEstadosCiviles, []);
  const { result: modalidades } = useAsyncWithToken(getModalidades, []);

  async function handleSubmit(datosPersonales: DatosPersonalesFormOutput) {
    try {
      await onSubmit(datosPersonales);
      form.reset();
    } catch (error) {
      if (error instanceof AxiosError) {
        handleAxiosError(toast.error, error);
      }

      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
        <FormInput
          name="primer_nombre"
          control={form.control}
          label="Primer nombre"
        />

        <FormInput
          name="segundo_nombre"
          control={form.control}
          label="Segundo nombre"
        />

        <FormInput
          name="primer_apellido"
          control={form.control}
          label="Primer apellido"
        />

        <FormInput
          name="segundo_apellido"
          control={form.control}
          label="Segundo apellido"
        />

        <div>
          Documento
          <div className="mt-1 flex items-end gap-2">
            {tiposDocumento && (
              <FormSelect
                control={form.control}
                name="id_tipo_documento"
                items={tiposDocumento}
                itemLabel="siglas"
                itemValue="id"
              />
            )}

            <FormInput control={form.control} name="documento" />
          </div>
        </div>

        <FormSelect
          control={form.control}
          name="sexo"
          items={["Masculino", "Femenino"]}
          label="Sexo"
        />

        <FormInputDate
          control={form.control}
          name="fecha_expedicion"
          label="Fecha de expedición"
        />

        <FormInputDate
          control={form.control}
          name="fecha_nacimiento"
          label="Fecha de nacimiento"
        />

        {paises && (
          <FormCombobox
            control={form.control}
            name="id_pais"
            itemLabel="nombre"
            itemValue="id"
            items={paises}
            label="País"
          />
        )}

        {municipios && (
          <FormCombobox
            control={form.control}
            name="id_municipio"
            itemLabel="nombre"
            itemValue="id"
            items={municipios}
            label="Municipio"
          />
        )}

        <FormInput control={form.control} name="telefono" label="Teléfono" />
        <FormInput
          control={form.control}
          name="correo_personal"
          label="Correo personal"
        />
        <FormInput
          control={form.control}
          name="correo_institucional"
          label="Correo institucional"
        />

        <FormInput
          control={form.control}
          name="direccion_institucional"
          label="Dirección institucional"
        />

        {poblacionesEspeciales && (
          <FormSelect
            control={form.control}
            name="id_poblacion_especial"
            items={poblacionesEspeciales}
            itemLabel="nombre"
            itemValue="id"
            label="Población especial"
          />
        )}

        {estadosCiviles && (
          <FormSelect
            control={form.control}
            name="id_estado_civil"
            items={estadosCiviles}
            itemLabel="nombre"
            itemValue="id"
            label="Estado civil"
          />
        )}

        <FormInput name="direccion" control={form.control} label="Dirección" />
        <FormInput name="entidad" control={form.control} label="Entidad" />

        {modalidades && (
          <FormSelect
            name="id_modalidad"
            control={form.control}
            label="Modalidad"
            items={modalidades}
            itemValue="id"
            itemLabel="nombre"
          />
        )}

        <Button type="submit" className="w-full">
          Guardar
        </Button>
      </form>
    </Form>
  );
}
