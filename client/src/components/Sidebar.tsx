import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  HeartPulse,
  Library,
  Wallet,
  LogOut,
  GraduationCap,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const role = user?.role || "student";

  const menus = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ["admin", "teacher", "student", "parent"],
    },
    {
      title: "Akademik (Admin)",
      icon: BookOpen,
      path: "/dashboard/academic/subjects",
      roles: ["admin"],
    },
    {
      title: "Akademik (Guru)",
      icon: BookOpen,
      path: "/dashboard/academic/grades",
      roles: ["teacher"],
    },
    {
      title: "Projek P5",
      icon: Users,
      path: "/dashboard/p5",
      roles: ["admin", "teacher", "student"],
    },
    {
      title: "Kesiswaan (BK)",
      icon: GraduationCap,
      path: "/dashboard/student-affairs",
      roles: ["admin", "teacher"],
    },
    {
      title: "UKS & Kesehatan",
      icon: HeartPulse,
      path: "/dashboard/uks",
      roles: ["admin", "teacher", "parent"],
    },
    {
      title: "Perpustakaan",
      icon: Library,
      path: "/dashboard/library",
      roles: ["admin", "teacher", "student"],
    },
    {
      title: "Sarana Prasarana",
      icon: Building2,
      path: "/dashboard/assets",
      roles: ["admin"],
    },
    {
      title: "Keuangan & SPP",
      icon: Wallet,
      path: "/dashboard/finance",
      roles: ["admin", "student", "parent"],
    },
  ];

  const filteredMenus = menus.filter((item) => item.roles.includes(role));

  return (
    <div className="flex h-full w-72 flex-col bg-slate-900 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="flex h-20 items-center px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">SIAKAD SMP</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Sch. Management
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 z-10">
        <nav className="space-y-1.5">
          {filteredMenus.map((item) => {
            // Custom logic for route matching to handle sub-routes
            const isActive =
              item.path === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(item.path);

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start space-x-3 h-11 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-medium"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white"
                    )}
                  />
                  <span>{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 z-10">
        <Button
          variant="outline"
          className="w-full justify-start border-slate-700 bg-transparent text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all h-11"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
