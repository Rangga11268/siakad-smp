import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  BookOpen,
  AlertTriangle,
  Wallet,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statsData, setStatsData] = useState({
    studentCount: 0,
    averageGrade: 0,
    incidentCount: 0,
    totalUnpaid: 0,
  });

  // Student State
  const [myGrades, setMyGrades] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const chartData = [
    { name: "Jul", value: 4000000 },
    { name: "Agu", value: 3000000 },
    { name: "Sep", value: 2000000 },
    { name: "Okt", value: 2780000 },
    { name: "Nov", value: 1890000 },
    { name: "Des", value: 2390000 },
    { name: "Jan", value: 3490000 },
  ];

  useEffect(() => {
    if (user?.role === "student") {
      fetchStudentData();
    } else {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const { data } = await api.get("/dashboard/stats");
      setStatsData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    }
  };

  const fetchStudentData = async () => {
    try {
      // Dummy endpoint fetch
      const { data } = await api.get(
        "/academic/my-grades?semester=Ganjil&academicYear=676bd6ef259300302c09ef7a",
      );
      setMyGrades(data);
    } catch (error) {
      console.error("Gagal load data siswa", error);
    }
  };

  const handleSelfAttendance = async () => {
    setAttendanceLoading(true);
    try {
      await api.post("/attendance/self", {
        academicYear: "676bd6ef259300302c09ef7a",
      });
      toast({
        title: "Berhasil",
        description: "Anda berhasil absen hari ini.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.message || "Gagal absen.",
      });
    } finally {
      setAttendanceLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Siswa",
      value: (statsData?.studentCount || 0).toString(),
      icon: Users,
      desc: "Aktif Tahun Ini",
      color: "text-school-navy",
      bgColor: "bg-school-navy/10",
    },
    {
      title: "Rata-rata Nilai",
      value: (statsData?.averageGrade || 0).toString(),
      icon: BookOpen,
      desc: "Seluruh Mata Pelajaran",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Laporan Insiden",
      value: (statsData?.incidentCount || 0).toString(),
      icon: AlertTriangle,
      desc: "Status Open/FollowUp",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Tagihan Belum Lunas",
      value: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(statsData?.totalUnpaid || 0),
      icon: Wallet,
      desc: "Total Tunggakan",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const quickActions = [
    {
      label: "Input Nilai",
      href: "/dashboard/academic/grades",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    },
    {
      label: "Lapor Pelanggaran",
      href: "/dashboard/student-affairs",
      icon: AlertTriangle,
      color: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
    },
    {
      label: "Terima Pembayaran",
      href: "/dashboard/finance",
      icon: Wallet,
      color:
        "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    },
    {
      label: "PPDB Admin",
      href: "/dashboard/ppdb",
      icon: Users,
      color:
        "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
    },
  ];

  const studentQuickActions = [
    {
      label: "Lihat Nilai",
      href: "/dashboard/academic/report",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    },
    {
      label: "Perpustakaan",
      href: "/dashboard/library",
      icon: BookOpen,
      color:
        "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
    },
    {
      label: "Tagihan Saya",
      href: "/dashboard/finance",
      icon: Wallet,
      color:
        "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    },
  ];

  const WelcomeBanner = () => (
    <div className="relative overflow-hidden rounded-none md:rounded-2xl bg-school-navy text-white shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-school-gold/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 md:p-10">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            Selamat Pagi,{" "}
            <span className="text-school-gold">
              {user?.profile?.fullName || user?.username || "Admin"}
            </span>
          </h2>
          <p className="text-white/80 max-w-xl text-lg font-light leading-relaxed">
            {user?.role === "student"
              ? "Siapkan diri untuk meraih prestasi terbaik hari ini! Jangan lupa cek jadwal dan tugas."
              : "Berikut adalah ringkasan aktivitas sekolah dan metrik penting hari ini."}
          </p>
        </div>

        <div className="flex flex-col gap-3 min-w-[200px]">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-lg border border-white/10 text-center">
            <span className="text-sm font-medium tracking-widest uppercase text-school-gold">
              {new Date().toLocaleDateString("id-ID", { weekday: "long" })}
            </span>
            <div className="text-2xl font-bold font-serif">
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          {user?.role === "student" && (
            <Button
              onClick={handleSelfAttendance}
              disabled={attendanceLoading}
              className="w-full bg-school-gold hover:bg-yellow-600 text-school-navy font-bold shadow-lg"
            >
              {attendanceLoading ? "Memproses..." : "Absen Sekarang"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <WelcomeBanner />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {(user?.role === "student"
          ? [
              {
                title: "Kehadiran Hari Ini",
                value: "Hadir", // Dinamis nanti
                icon: CheckCircle,
                desc: "Status absensi",
                color: "text-emerald-600",
                bgColor: "bg-emerald-50",
              },
              ...stats.slice(1, 2), // Example reuse
            ]
          : stats
        ).map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-school-gold group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                {stat.title}
              </CardTitle>
              <div
                className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-school-navy mt-2">
                {stat.value}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-7">
        {/* Main Chart or Content Area */}
        <Card className="col-span-4 shadow-lg border-none overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="font-serif text-xl text-school-navy">
              {user?.role === "student"
                ? "Nilai Semester Ini"
                : "Arus Kas Masuk (SPP)"}
            </CardTitle>
            <CardDescription>
              {user?.role === "student"
                ? "Grafik perkembangan nilai akademik."
                : "Tren pembayaran siswa 6 bulan terakhir."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {user?.role === "student" ? (
              <div className="min-h-[300px] flex items-center justify-center">
                {myGrades.length > 0 ? (
                  <div className="grid w-full grid-cols-2 gap-4">
                    {myGrades.map((g, i) => (
                      <div
                        key={i}
                        className="p-4 bg-slate-50 rounded-lg flex justify-between items-center border border-slate-100"
                      >
                        <span className="font-bold text-slate-700">
                          {g.subject}
                        </span>
                        <span className="text-xl font-bold text-school-navy">
                          {g.average}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Belum ada data nilai.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#002366"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#002366"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `Rp${value / 1000000}jt`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      itemStyle={{ color: "#002366", fontWeight: "bold" }}
                      formatter={(value: any) =>
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(value)
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#002366"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar / Quick Actions */}
        <div className="col-span-3 space-y-6">
          <Card className="shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="font-serif text-xl text-school-navy">
                Akses Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {(user?.role === "student"
                  ? studentQuickActions
                  : quickActions
                ).map((action, i) => (
                  <a
                    key={i}
                    href={action.href}
                    className={`flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 hover:shadow-md group ${action.color}`}
                  >
                    <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold text-center leading-tight">
                      {action.label}
                    </span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none bg-school-navy text-white">
            <CardHeader>
              <CardTitle className="font-serif text-lg text-school-gold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Pengumuman Penting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4 items-start border-l-2 border-school-gold/30 pl-4">
                  <div>
                    <p className="text-sm font-bold text-school-gold mb-1">
                      Pembukaan PPDB Gelombang 1
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Segera verifikasi data pendaftar baru melalui menu PPDB
                      Admin sebelum tanggal 20.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start border-l-2 border-school-gold/30 pl-4">
                  <div>
                    <p className="text-sm font-bold text-school-gold mb-1">
                      Batas Input Nilai Rapor
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Para guru dimohon menyelesaikan input nilai sebelum Jumat,
                      20 Desember 2024.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
