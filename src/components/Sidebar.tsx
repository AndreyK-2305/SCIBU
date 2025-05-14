import { Icon } from "@iconify/react";
import { useState } from "react";
import { Link, useLocation } from "react-router";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface NavItem {
  label: string;
  icon: string;
  url: string;
}

const navItems: NavItem[] = [
  {
    label: "Datos Personales",
    icon: "material-symbols:database-outline",
    url: "datos-personales",
  },
  {
    label: "Servicios",
    icon: "material-symbols:home-repair-service-outline",
    url: "servicios",
  },
  {
    label: "Especialistas",
    icon: "ph:users",
    url: "especialistas",
  },
  {
    label: "Horarios",
    icon: "material-symbols:schedule",
    url: "horarios",
  },
  {
    label: "Citas",
    icon: "material-symbols:calendar-month",
    url: "citas",
  },
  {
    label: "Datos",
    icon: "material-symbols:database-outline",
    url: "datos",
  },
];

export default function Sidebar() {
  const { auth } = useAuth();
  const { pathname } = useLocation();

  const currentItemPath = pathname.split("/")[2];
  const currentNavItem =
    currentItemPath?.length > 0
      ? navItems.find((item) => item.url === currentItemPath)
      : undefined;

  const [collapsed, setCollapsed] = useState(true);

  async function handleLogout() {
    await auth.signOut();
  }

  return (
    <>
      {!collapsed && (
        <div
          className="absolute top-0 left-0 h-screen w-screen bg-neutral-950 opacity-30"
          onClick={() => setCollapsed(true)}
        ></div>
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-10 w-full space-y-10 overflow-hidden bg-[#3730a3] p-3 text-white transition-[height] lg:min-h-screen lg:transition-[width]",
          collapsed && "h-16 lg:w-16",
          !collapsed && "h-screen lg:w-64",
        )}
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon icon="mdi:menu" className="size-6" />
          </Button>

          <Popover>
            <PopoverTrigger
              className={cn(
                "cursor-pointer transition-opacity",
                collapsed && "lg:opacity-0",
              )}
            >
              <Icon icon="mingcute:user-4-fill" className="size-6" />
            </PopoverTrigger>
            <PopoverContent className="w-fit">
              <p className="text-center font-bold">Juan Afanador</p>
              <p className="text-center text-sm">ADMIN</p>
              <Separator className="my-4" />
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </PopoverContent>
          </Popover>
        </div>
        <nav className="flex h-full flex-col items-start gap-4 overflow-y-auto">
          {navItems.map((item, index) => (
            <Link to={item.url} key={index}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start has-[>svg]:p-0",
                  currentNavItem === item && "bg-neutral-100 text-neutral-900",
                  collapsed && "w-9",
                )}
                onClick={() => {
                  setCollapsed(true);
                }}
              >
                <Icon icon={item.icon} className="ml-[6px] size-6" />
                <span
                  className={cn(
                    "mr-[6px] overflow-hidden transition-opacity",
                    collapsed && "opacity-0",
                  )}
                >
                  {item.label}
                </span>
              </Button>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
