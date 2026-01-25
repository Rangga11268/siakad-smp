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
    <div className="flex h-full w-72 flex-col bg-school-navy text-white shadow-2xl relative overflow-hidden border-r border-white/10 font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-school-gold/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-school-gold/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

      {/* Header / Logo */}
      <div className="flex h-24 items-center px-6 z-10 border-b border-white/10 bg-school-navy/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center p-2 border border-white/20 shadow-lg">
            <img
              src="/img/logoNoBg.webp"
              alt="Logo"
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold tracking-wide text-school-gold leading-tight">
              SATYA CENDEKIA
            </h1>
            <p className="text-[10px] text-white/60 font-medium tracking-widest uppercase">
              Management System
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 z-10 space-y-6 custom-scrollbar">
        {menuGroups.map((group, idx) => {
          const filteredItems = group.items.filter((item) =>
            item.roles.includes(role),
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
                  className="w-full justify-between hover:bg-white/10 text-white/50 hover:text-white h-9 px-4 text-xs font-bold uppercase tracking-wider mb-2"
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      openSections[group.label] ? "" : "-rotate-90",
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

      {/* Footer */}
      <div className="p-4 border-t border-white/10 z-10 bg-school-navy">
        <Button
          variant="outline"
          className="w-full justify-start border-white/20 bg-transparent text-white/70 hover:text-school-gold hover:border-school-gold/50 hover:bg-school-gold/10 transition-all h-12 group rounded-none"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
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
          "flex items-center gap-3 px-4 py-3 mx-1 rounded-sm transition-all duration-300 group relative overflow-hidden",
          isActive
            ? "text-school-gold bg-gradient-to-r from-white/10 to-transparent border-l-4 border-school-gold"
            : "text-white/70 hover:text-white hover:bg-white/5 border-l-4 border-transparent",
        )}
      >
        <item.icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            isActive
              ? "text-school-gold"
              : "text-white/50 group-hover:text-white",
          )}
        />
        <span
          className={cn(
            "font-medium text-sm tracking-wide",
            isActive ? "font-semibold" : "",
          )}
        >
          {item.title}
        </span>
      </div>
    </Link>
  );
};

export default Sidebar;
