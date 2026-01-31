import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Group,
  Book,
  WarningTriangle,
  Wallet,
  CheckCircle,
  ArrowRight,
  OpenBook,
} from "iconoir-react";
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

  // Chart Data State (Real-time from API)
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>(
    [],
  );

  useEffect(() => {
    if (!user) return; // Wait for user to load

    if (user.role === "student") {
      fetchStudentData();
    } else {
      fetchAdminData();
      if (user.role === "admin") {
        fetchChartData();
      }
    }
  }, [user]);

  // Student Stats State
  const [studentStats, setStudentStats] = useState({
    attendanceStatus: "Belum Absen",
    unpaidBills: 0,
    announcements: [],
    pendingTasks: 0,
  });

  useEffect(() => {
    if (!user) return;

    if (user.role === "student") {
      fetchStudentData();
      fetchStudentStats(); // New Fetch
    } else {
      fetchAdminData();
      if (user.role === "admin") {
        fetchChartData();
      }
    }
  }, [user]);

  const fetchStudentStats = async () => {
    try {
      const { data } = await api.get("/dashboard/student-stats");
      setStudentStats(data);
    } catch (error) {
      console.error("Gagal load student stats", error);
    }
  };

  const fetchAdminData = async () => {
    if (user?.role !== "admin" && user?.role !== "teacher") return;
    try {
      const { data } = await api.get("/dashboard/stats");
      setStatsData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const { data } = await api.get("/finance/chart");
      if (data && Array.isArray(data)) {
        setChartData(data);
      }
    } catch (error) {
      console.error("Failed to fetch chart data", error);
    }
  };

  const fetchStudentData = async () => {
    try {
      const yearRes = await api.get("/academic/years");
      const activeYear =
        yearRes.data.find((y: any) => y.isActive) || yearRes.data[0];

      if (!activeYear) return;

      const { data } = await api.get("/academic/my-grades", {
        params: {
          semester: activeYear.semester || "Ganjil",
          academicYear: activeYear._id,
        },
      });
      setMyGrades(data);
    } catch (error) {
      console.error("Gagal load data siswa", error);
    }
  };

  const handleSelfAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const yearRes = await api.get("/academic/years");
      const activeYear =
        yearRes.data.find((y: any) => y.isActive) || yearRes.data[0];

      if (!activeYear) throw new Error("Tahun ajaran tidak ditemukan");

      await api.post("/attendance/self", {
        academicYear: activeYear._id,
      });
      toast({
        title: "Berhasil",
        description: "Anda berhasil absen hari ini.",
      });
      fetchStudentStats(); // Refresh stats after attendance
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

  // Stats Array Logic
  const stats =
    user?.role === "student"
      ? [
          {
            title: "Kehadiran Hari Ini",
            value: studentStats.attendanceStatus,
            icon: CheckCircle,
            desc: "Status absensi",
            color:
              studentStats.attendanceStatus === "Hadir"
                ? "text-emerald-600"
                : "text-orange-600",
            bgColor:
              studentStats.attendanceStatus === "Hadir"
                ? "bg-emerald-50"
                : "bg-orange-50",
          },
          {
            title: "Tunggakan",
            value: new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(studentStats.unpaidBills * 500000), // Dummy calculation or fetch real amount?
            // Better: use count for now or fix backend to send amount. Backend sends 'count' in unpaidBills properly now?
            // Wait, backend sends countDocuments. Let's just show Count.
            // "2 Tagihan"
            // Actually let's just show count.
            valueDisplay: `${studentStats.unpaidBills} Tagihan`,
            icon: Wallet,
            desc: "Belum Lunas",
            color: "text-red-600",
            bgColor: "bg-red-50",
          },
          {
            title: "Tugas Pending",
            value: studentStats.pendingTasks.toString(),
            icon: Book,
            desc: "Deadline 7 Hari Kedepan",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Rata-Rata Nilai",
            value:
              myGrades.length > 0
                ? (
                    myGrades.reduce((acc, curr) => acc + curr.average, 0) /
                    myGrades.length
                  ).toFixed(1)
                : "0",
            icon: OpenBook,
            desc: "Semester Ini",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
          },
        ]
      : [
          {
            title: "Total Siswa",
            value: (statsData?.studentCount || 0).toString(),
            icon: Group,
            desc: "Aktif Tahun Ini",
            color: "text-school-navy",
            bgColor: "bg-school-navy/10",
          },
          {
            title: "Rata-rata Nilai",
            value: (statsData?.averageGrade || 0).toString(),
            icon: Book,
            desc: "Seluruh Mata Pelajaran",
            color: "text-green-600",
            bgColor: "bg-green-100",
          },
          {
            title: "Laporan Insiden",
            value: (statsData?.incidentCount || 0).toString(),
            icon: WarningTriangle,
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
      icon: Book,
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    },
    {
      label: "Lapor Pelanggaran",
      href: "/dashboard/student-affairs",
      icon: WarningTriangle,
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
      icon: Group,
      color:
        "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
    },
  ];

  const studentQuickActions = [
    {
      label: "Lihat Nilai",
      href: "/dashboard/academic/report",
      icon: Book,
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    },
    {
      label: "Perpustakaan",
      href: "/dashboard/library",
      icon: Book,
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
              disabled={
                attendanceLoading || studentStats.attendanceStatus === "Hadir"
              }
              className={`w-full font-bold shadow-lg ${studentStats.attendanceStatus === "Hadir" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-school-gold hover:bg-yellow-600 text-school-navy"}`}
            >
              {attendanceLoading
                ? "Memproses..."
                : studentStats.attendanceStatus === "Hadir"
                  ? "Sudah Absen"
                  : "Absen Sekarang"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <WelcomeBanner />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat: any, i) => (
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
                {stat.valueDisplay || stat.value}
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
                : user?.role === "admin"
                  ? "Arus Kas Masuk (SPP)"
                  : "Ruang Guru"}
            </CardTitle>
            <CardDescription>
              {user?.role === "student"
                ? "Grafik perkembangan nilai akademik."
                : user?.role === "admin"
                  ? "Tren pembayaran siswa 6 bulan terakhir."
                  : "Pusat aktivitas dan manajemen kelas Anda."}
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
                        className="p-4 bg-slate-50 rounded-lg flex flex-col gap-2 border border-slate-100 hover:border-school-gold/50 transition-colors"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span
                            className="font-bold text-slate-700 truncate max-w-[120px]"
                            title={g.subject}
                          >
                            {g.subject}
                          </span>
                          <div className="text-right">
                            <span className="text-xl font-bold text-school-navy block leading-none">
                              {g.average}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div className="bg-blue-50 px-2 py-1 rounded text-center border border-blue-100">
                            <span className="block text-[10px] text-blue-500 font-bold uppercase">
                              Tugas
                            </span>
                            <span className="block font-bold text-blue-700">
                              {g.assignmentAvg || 0}
                            </span>
                          </div>
                          <div className="bg-purple-50 px-2 py-1 rounded text-center border border-purple-100">
                            <span className="block text-[10px] text-purple-500 font-bold uppercase">
                              Ulangan
                            </span>
                            <span className="block font-bold text-purple-700">
                              {g.examAvg || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <OpenBook className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Belum ada data nilai.</p>
                  </div>
                )}
              </div>
            ) : user?.role === "admin" ? (
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
            ) : (
              // Teacher / Other Role View
              <div className="h-[300px] w-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="bg-school-gold/10 p-4 rounded-full mb-4">
                  <Book className="w-10 h-10 text-school-gold" />
                </div>
                <h3 className="text-lg font-bold text-school-navy mb-2">
                  Akses Cepat Ruang Guru
                </h3>
                <p className="max-w-md mb-6">
                  Kelola jadwal mengajar, penilaian, dan administrasi kelas Anda
                  di satu tempat yang terpadu.
                </p>
                <Button
                  onClick={() =>
                    (window.location.href = "/dashboard/teacher/hub")
                  }
                  className="bg-school-navy hover:bg-school-navy/90"
                >
                  Buka Ruang Guru <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
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
                <WarningTriangle className="w-5 h-5" /> Pengumuman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {user?.role === "student" &&
                studentStats.announcements.length > 0 ? (
                  studentStats.announcements.map((news: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex gap-4 items-start border-l-2 border-school-gold/30 pl-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-school-gold mb-1">
                          {news.title}
                        </p>
                        <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                          {news.summary}
                        </p>
                        <p className="text-[10px] text-white/40 mt-1">
                          {new Date(news.publishedAt).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Default Fallback / Admin View
                  <div className="flex gap-4 items-start border-l-2 border-school-gold/30 pl-4">
                    <div>
                      <p className="text-sm font-bold text-school-gold mb-1">
                        Sistem Informasi Sekolah
                      </p>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Selamat datang di dashboard {user?.role}. Pantau terus
                        informasi terbaru disini.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
