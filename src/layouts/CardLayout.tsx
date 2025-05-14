import { Outlet } from "react-router";

import BackgroundImg from "@/assets/images/bienestar-bg.jpeg";
import FablabLogoImg from "@/assets/images/bienestar-logo.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import BaseLayout from "./BaseLayout";

interface CardLayoutOptions {
  allowHorizontal?: boolean;
}

export default function CardLayout({
  allowHorizontal = true,
}: CardLayoutOptions) {
  return (
    <BaseLayout className="relative flex min-h-screen items-center justify-center p-5">
      <div className="absolute top-0 left-0 -z-10 h-screen w-screen">
        <img
          src={BackgroundImg}
          alt="Background"
          className="fixed h-full w-full object-cover"
        />
        <div className="fixed h-full w-full bg-purple-500 opacity-50"></div>
      </div>

      <Card>
        <CardContent
          className={cn(
            "grid items-center justify-center gap-6",
            allowHorizontal && "lg:grid-cols-2 lg:gap-12",
          )}
        >
          <img
            src={FablabLogoImg}
            className={cn(
              "mx-auto w-full max-w-16",
              allowHorizontal && "lg:max-w-64",
            )}
            alt="FABLAB Logo"
            width={1506}
            height={1506}
          />
          <Outlet />
        </CardContent>
      </Card>
    </BaseLayout>
  );
}
