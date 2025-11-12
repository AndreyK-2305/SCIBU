import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { getUserData } from "@/services/user";

import { Button } from "./ui/button";

interface NavItem {
  label: string;
  icon: string;
  url: string;
}

// Modified navigation items for regular users
const navItems: NavItem[] = [
  {
    label: "Inicio",
    icon: "material-symbols:home-outline",
    url: "/dashboard",
  },
  {
    label: "Datos Personales",
    icon: "material-symbols:person-outline",
    url: "/dashboard/datos-personales",
  },
  {
    label: "Citas",
    icon: "material-symbols:calendar-month",
    url: "/dashboard/citas",
  },
];

export default function UserSidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [userName, setUserName] = useState<string>("Usuario");

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Fetch user data from Firestore to get full name
        const userData = await getUserData(user.uid);
        if (userData?.fullName) {
          setUserName(userData.fullName);
        } else if (user.displayName) {
          setUserName(user.displayName);
        } else if (user.email) {
          setUserName(user.email.split("@")[0]);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [user]);

  // Compare the current path with navigation items
  const currentNavItem = navItems.find((item) => pathname === item.url);

  const [collapsed, setCollapsed] = useState(true);

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
          "fixed top-0 left-0 z-10 flex w-full flex-col overflow-hidden bg-[#3730a3] p-3 text-white transition-[height] lg:min-h-screen lg:transition-[width]",
          collapsed && "h-16 lg:w-16",
          !collapsed && "h-screen lg:w-64",
        )}
      >
        {/* Header con menú y usuario */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon icon="mdi:menu" className="size-6" />
          </Button>

          {/* Usuario en la parte superior */}
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Icon icon="mingcute:user-4-fill" className="size-6" />
              <div className="flex flex-col">
                <p className="text-xs font-bold">Usuario</p>
                <p className="text-xs opacity-80 truncate max-w-[120px]">
                  {userName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navegación en el medio */}
        <nav className="flex flex-1 flex-col items-start gap-4 overflow-y-auto py-4">
          {navItems.map((item, index) => (
            <Link to={item.url} key={index} className="w-full">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start has-[>svg]:p-0",
                  pathname === item.url && "bg-neutral-100 text-neutral-900",
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

        {/* Botón de cerrar sesión en la parte inferior */}
        {!collapsed && (
          <div className="mt-auto border-t border-indigo-400/20 pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-indigo-700"
              onClick={logout}
            >
              <Icon icon="material-symbols:logout" className="ml-[6px] size-6" />
              <span className="mr-[6px]">Cerrar Sesión</span>
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
