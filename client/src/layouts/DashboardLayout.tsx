import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import api from "@/services/api";

const DashboardLayout = () => {
  const { user } = useAuth();
  const [academicYear, setAcademicYear] = useState("2024/2025 (Ganjil)");

  useEffect(() => {
    const fetchActiveYear = async () => {
      try {
        const res = await api.get("/academic/years");
        const activeYear = res.data.find((y: any) => y.status === "active");
        if (activeYear) {
          setAcademicYear(`${activeYear.name} (${activeYear.semester})`);
        }
      } catch (error) {
        console.error("Failed to fetch academic year:", error);
        // Keep default if fetch fails
      }
    };
    fetchActiveYear();
  }, []);

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
          {/* Mobile Sidebar Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>

          <div className="font-medium text-muted-foreground hidden md:block">
            Tahun Ajaran:{" "}
            <span className="text-foreground font-semibold">
              {academicYear}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <div className="flex items-center space-x-3 border-l pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">
                  {user?.profile?.fullName || user?.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role || "Guest"}
                </p>
              </div>
              <Avatar>
                <AvatarImage
                  src={user?.profile?.avatar || "https://github.com/shadcn.png"}
                />
                <AvatarFallback>
                  {user?.username?.substring(0, 2).toUpperCase() || "CN"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
