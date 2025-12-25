import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, BookOpen, AlertTriangle, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/services/api";
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
  const [statsData, setStatsData] = useState({
    studentCount: 0,
    averageGrade: 0,
    incidentCount: 0,
    totalUnpaid: 0,
  });

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
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/dashboard/stats");
        setStatsData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Selamat Pagi, Admin! 👋
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
