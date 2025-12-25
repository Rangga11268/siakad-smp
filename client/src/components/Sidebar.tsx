import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  HeartPulse,
  Library,
  Wallet,
  Settings,
  LogOut,
  GraduationCap,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const location = useLocation();
  const role = "admin"; // TODO: Get from Auth Context

  const menus = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ["admin", "teacher", "student", "parent"],
    },
    {
      title: "Akademik",
      icon: BookOpen,
      path: "/dashboard/academic",
      roles: ["admin", "teacher"],
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
      title: "E-Sarpras",
      icon: Building2,
      path: "/dashboard/assets",
      roles: ["admin"],
    },
    {
      title: "Keuangan",
      icon: Wallet,
      path: "/dashboard/finance",
      roles: ["admin", "student", "parent"],
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold tracking-tight text-primary">
          SIAKAD SMP
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {menus.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={
                  location.pathname.startsWith(item.path)
                    ? "secondary"
                    : "ghost"
                }
                className={cn(
                  "w-full justify-start space-x-3",
                  location.pathname.startsWith(item.path) &&
                    "bg-secondary font-medium"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-4">
        <Button
          variant="outline"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
