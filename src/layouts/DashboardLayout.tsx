import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Menu, GraduationCap } from "lucide-react";
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
      }
    };
    fetchActiveYear();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm z-30">
          {/* Mobile Sidebar Trigger */}
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-school-navy"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-r-0 w-72">
                  <Sidebar />
                </SheetContent>
              </Sheet>
            </div>

            {/* Academic Year Badge */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-school-navy/5 rounded-full border border-school-navy/10">
              <GraduationCap className="w-4 h-4 text-school-navy" />
              <span className="text-xs font-bold text-school-navy uppercase tracking-wider">
                Tahun Ajaran: {academicYear}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-500 hover:text-school-navy hover:bg-school-navy/5"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
            </Button>

            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-school-navy">
                  {user?.profile?.fullName || user?.username || "Pengguna"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                  {user?.role || "Guest"}
                </p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-school-gold/20 shadow-sm">
                <AvatarImage
                  src={user?.profile?.avatar || "https://github.com/shadcn.png"}
                />
                <AvatarFallback className="bg-school-navy text-school-gold font-bold">
                  {user?.username?.substring(0, 2).toUpperCase() || "SC"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
