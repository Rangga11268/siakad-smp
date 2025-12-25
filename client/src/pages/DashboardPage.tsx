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
      // Fetch My Grades (Mock or specific endpoint)
      // Ensure endpoint exists or handle error
      const { data } = await api.get(
        "/academic/my-grades?semester=Ganjil&academicYear=676bd6ef259300302c09ef7a"
      ); // Dummy ID for now or fetch active
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
      color: "text-blue-600",
      bgColor: "bg-blue-100",
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
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Lapor Pelanggaran",
      href: "/dashboard/student-affairs",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "Terima Pembayaran",
      href: "/dashboard/finance",
      icon: Wallet,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "PPDB Admin",
      href: "/dashboard/ppdb",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const studentQuickActions = [
    {
      label: "Lihat Nilai",
      href: "/dashboard/academic/report", // Or specialized page
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Perpustakaan",
      href: "/dashboard/library",
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Tagihan Saya",
      href: "/dashboard/finance",
      icon: Wallet,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  if (user?.role === "student") {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600 to-cyan-600 p-8 rounded-3xl text-white shadow-xl">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Selamat Pagi, {user?.profile?.fullName || user?.username}! 👋
            </h2>
            <p className="text-blue-100 opacity-90">
              Siap untuk belajar hari ini? Jangan lupa absen ya!
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
            <Button
              onClick={handleSelfAttendance}
              disabled={attendanceLoading}
              variant="secondary"
              className="w-full md:w-auto font-bold text-blue-700"
            >
              {attendanceLoading ? "Memproses..." : "Absen Sekarang 📍"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-md border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-green-500 h-5 w-5" /> Kehadiran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Hadir</div>
              <p className="text-muted-foreground text-sm">Status hari ini</p>
            </CardContent>
          </Card>
          <Card className="shadow-md border-none col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-blue-500 h-5 w-5" /> Nilai Semester
                Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myGrades.length === 0 ? (
                <p className="text-muted-foreground">Belum ada nilai masuk.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {myGrades.map((g: any, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 p-3 rounded-lg text-center"
                    >
                      <div className="font-semibold text-slate-700">
                        {g.subject}
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {g.average}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          {studentQuickActions.map((action, i) => (
            <a
              key={i}
              href={action.href}
              className="flex flex-col items-center justify-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-slate-200 group"
            >
              <div
                className={`p-4 rounded-full mb-4 ${action.color} group-hover:scale-110 transition-transform`}
              >
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-lg font-medium text-slate-700">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Selamat Pagi, {user?.profile?.fullName || "Admin"}! 👋
          </h2>
          <p className="text-indigo-100 opacity-90">
            Berikut adalah ringkasan aktivitas sekolah hari ini.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-md hover:shadow-lg transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Chart Area */}
        <Card className="col-span-4 shadow-md border-none">
          <CardHeader>
            <CardTitle>Arus Kas Masuk (SPP)</CardTitle>
            <CardDescription>
              Tren pembayaran siswa 6 bulan terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `Rp${value / 1000000}jt`}
                  />
                  <Tooltip
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
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Recent */}
        <div className="col-span-3 space-y-6">
          <Card className="shadow-md border-none">
            <CardHeader>
              <CardTitle>Akses Cepat</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
                <a
                  key={i}
                  href={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
                >
                  <div
                    className={`p-3 rounded-full mb-3 ${action.color} group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 text-center">
                    {action.label}
                  </span>
                </a>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-md border-none">
            <CardHeader>
              <CardTitle>Pengumuman Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      Pembukaan PPDB Gelombang 1
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Segera verifikasi data pendaftar baru.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2 rounded-full bg-orange-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      Batas Input Nilai Rapor
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Jumat, 20 Desember 2024
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
