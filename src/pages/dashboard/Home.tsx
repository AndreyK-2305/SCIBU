import { Icon } from "@iconify/react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  // Extract display name or email to welcome the user
  const userName = user?.displayName || user?.email?.split("@")[0] || "Usuario";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido/a, {userName}
        </h1>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
          </span>
          <span className="text-sm text-muted-foreground">En línea</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximas Citas
            </CardTitle>
            <Icon
              icon="material-symbols:calendar-month"
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No tienes citas pendientes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estado de Perfil
            </CardTitle>
            <Icon
              icon="material-symbols:person-outline"
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Completo</div>
            <p className="text-xs text-muted-foreground">
              Tu perfil está al día
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <h2 className="mt-8 text-xl font-semibold">Acceso Rápido</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-colors hover:bg-slate-50">
          <Link to="/dashboard/datos-personales">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon
                  icon="material-symbols:person-outline"
                  className="h-5 w-5 text-indigo-600"
                />
                <CardTitle className="text-base">Datos Personales</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Revisa y modifica tu información personal en el sistema
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card className="transition-colors hover:bg-slate-50">
          <Link to="/dashboard/citas">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon
                  icon="material-symbols:calendar-month"
                  className="h-5 w-5 text-indigo-600"
                />
                <CardTitle className="text-base">Gestionar Citas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Agenda, consulta o cancela citas en nuestros servicios
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card className="transition-colors hover:bg-slate-50">
          <Link to="/dashboard/consultar-usuario">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon
                  icon="material-symbols:search"
                  className="h-5 w-5 text-indigo-600"
                />
                <CardTitle className="text-base">Consultar Usuario</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Busca información de otros usuarios del sistema
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Help Section */}
      <div className="mt-6">
        <Card className="bg-indigo-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon
                icon="material-symbols:help-outline"
                className="h-5 w-5 text-indigo-600"
              />
              <CardTitle className="text-base">¿Necesitas ayuda?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              Si tienes problemas utilizando el sistema o deseas reportar un
              error, comunícate con el equipo de soporte técnico.
            </p>
            <Button variant="outline" className="text-sm">
              <Icon
                icon="material-symbols:mail-outline"
                className="mr-2 h-4 w-4"
              />
              Contactar Soporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
