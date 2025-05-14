import { Outlet } from "react-router";

import UserSidebar from "@/components/UserSidebar";

import BaseLayout from "./BaseLayout";

export default function UserDashboardLayout() {
  return (
    <BaseLayout className="mt-16 lg:mt-0 lg:ml-16">
      <UserSidebar />
      <div className="flex min-h-screen flex-col bg-gray-50 p-6">
        <div className="mx-auto w-full max-w-4xl">
          <Outlet />
        </div>
      </div>
    </BaseLayout>
  );
}
