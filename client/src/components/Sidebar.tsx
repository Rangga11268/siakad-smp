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
  CheckCircle2,
  Printer,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role || "student";

  // State for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Akademik: true,
    Administrasi: true,
    Lainnya: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const menuGroups = [
    {
      label: "Utama",
      items: [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          path: "/dashboard",
          roles: ["admin", "teacher", "student", "parent"],
        },
      ],
    },
    {
      label: "Akademik",
      items: [
        {
          title: "Jadwal Pelajaran",
          icon: CalendarDays,
          path: "/dashboard/academic/schedule",
          roles: ["admin", "teacher"],
        },
        {
          title: "Absensi Pelajaran",
          icon: CalendarDays,
          path: "/dashboard/student/attendance",
          roles: ["student"],
        },
        {
          title: "Data Siswa",
          icon: Users,
          path: "/dashboard/academic/students",
          roles: ["admin", "teacher"],
        },
        {
          title: "Data Mapel",
          icon: BookOpen,
          path: "/dashboard/academic/subjects",
          roles: ["admin"],
        },
        {
          title: "Data Kelas",
          icon: Building2,
          path: "/dashboard/academic/classes",
          roles: ["admin"],
        },
        {
          title: "Tujuan Pembelajaran",
          icon: BookOpen,
          path: "/dashboard/academic/learning-goals",
          roles: ["admin", "teacher"],
        },
        {
          title: "Jurnal Mengajar",
          icon: BookOpen,
          path: "/dashboard/academic/journal",
          roles: ["admin", "teacher"],
        },
        {
          title: "Absensi Harian",
          icon: CheckCircle2,
          path: "/dashboard/academic/attendance",
          roles: ["admin", "teacher"],
        },
        {
          title: "Nilai Saya",
          icon: BookOpen,
          path: "/dashboard/student/grades",
          roles: ["student"],
        },
        {
          title: "Input Nilai",
          icon: BookOpen,
          path: "/dashboard/academic/grades",
          roles: ["teacher", "admin"],
        },
        {
          title: "Bahan Ajar (Guru)",
          icon: BookOpen,
          path: "/dashboard/academic/materials",
          roles: ["admin", "teacher"],
        },
        {
          title: "Bahan Ajar",
          icon: BookOpen,
          path: "/dashboard/student/materials",
          roles: ["student"],
        },
        {
          title: "E-Rapor Siswa",
          icon: Printer,
          path: "/dashboard/academic/report",
          roles: ["admin", "teacher", "student"], // Student can view too? Or specific page
        },
      ],
    },
    {
      label: "Kesiswaan & P5",
      items: [
        {
          title: "Projek P5",
          icon: Users,
          path: "/dashboard/p5",
          roles: ["admin", "teacher", "student"],
        },
        {
          title: "Laporan P5",
          icon: Printer,
          path: "/dashboard/p5/report",
          roles: ["admin", "teacher"],
        },
        {
          title: "Bimbingan Konseling",
          icon: GraduationCap,
          path: "/dashboard/student-affairs",
          roles: ["admin", "teacher"],
        },
      ],
    },
    {
      label: "Fasilitas & Layanan",
      items: [
        {
          title: "UKS & Kesehatan",
          icon: HeartPulse,
          path: "/dashboard/uks",
          roles: ["admin", "teacher", "parent", "student"],
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
      ],
    },
    {
      label: "Administrasi",
      items: [
        {
          title: "PPDB Online",
          icon: Users,
          path: "/dashboard/ppdb",
          roles: ["admin"],
        },
        {
          title: "Keuangan & SPP",
          icon: Wallet,
          path: "/dashboard/finance",
          roles: ["admin", "student", "parent"],
        },
      ],
    },
  ];

  return (
    <div className="flex h-full w-72 flex-col bg-[#0f172a] text-slate-100 shadow-2xl relative overflow-hidden border-r border-slate-800">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

      <div className="flex h-20 items-center px-6 z-10 border-b border-slate-800/50 bg-[#0f172a]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              SIAKAD SMP
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              School Management
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 z-10 space-y-6 custom-scrollbar">
        {menuGroups.map((group, idx) => {
          const filteredItems = group.items.filter((item) =>
            item.roles.includes(role)
          );
          if (filteredItems.length === 0) return null;

          // Just show items if it's "Utama" without accordion, else accordion
          if (group.label === "Utama") {
            return (
              <div key={idx} className="space-y-1">
                {filteredItems.map((item) => (
                  <MenuItem key={item.path} item={item} location={location} />
                ))}
              </div>
            );
          }

          return (
            <Collapsible
              key={idx}
              open={openSections[group.label]}
              onOpenChange={() => toggleSection(group.label)}
              className="space-y-1"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 h-8 px-3 text-xs font-semibold uppercase tracking-wider mb-1"
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      openSections[group.label] ? "" : "-rotate-90"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                {filteredItems.map((item) => (
                  <MenuItem key={item.path} item={item} location={location} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 z-10 bg-[#0f172a]">
        <Button
          variant="outline"
          className="w-full justify-start border-slate-700 bg-transparent text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all h-11 group"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Logout System
        </Button>
      </div>
    </div>
  );
};

const MenuItem = ({ item, location }: { item: any; location: any }) => {
  const isActive =
    item.path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(item.path);

  return (
    <Link to={item.path} className="block">
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
          isActive
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
        )}

        <item.icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            isActive
              ? "text-white"
              : "text-slate-500 group-hover:text-slate-300"
          )}
        />
        <span className="font-medium text-sm">{item.title}</span>
      </div>
    </Link>
  );
};

export default Sidebar;
