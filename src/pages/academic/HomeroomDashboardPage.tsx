import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Group,
  StatsUpSquare,
  Calendar,
  Book,
  Check,
  Eye,
  SystemRestart,
  ArrowLeft,
} from "iconoir-react";
import api from "@/services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import HomeroomAttendanceSummary from "./components/HomeroomAttendanceSummary";

interface Student {
  _id: string;
  profile: {
    fullName: string;
    avatar?: string;
    nisn?: string;
    gender?: string;
  };
}

interface DashboardData {
  class: {
    _id: string;
    name: string;
    level: number;
    room?: string;
  };
  totalStudents: number;
  students: Student[];
  attendanceStats: {
    present: number;
    sick: number;
    permission: number;
    absent: number;
  };
  submissionStats: {
    total: number;
    graded: number;
    pending: number;
    late: number;
  };
  avgGrade: number;
  recentAssessments: any[];
  studentWarnings: {
    _id: string;
    name: string;
    issue: string;
  }[];
}

const HomeroomDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Analytics States
  const [trendData, setTrendData] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/homeroom/dashboard");
      setData(res.data);
    } catch (error: any) {
      console.error("Failed to load homeroom dashboard:", error);
      if (error.response?.status === 403) {
        navigate("/teacher/hub");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (trendData.length > 0) return; // Already fetched
    try {
      setLoadingAnalytics(true);
      const [trendRes, heatmapRes] = await Promise.all([
        api.get("/homeroom/analytics/trend"),
        api.get("/homeroom/analytics/heatmap"),
      ]);
      setTrendData(trendRes.data);
      setHeatmapData(heatmapRes.data);
    } catch (error) {
      console.error("Failed to load analytics", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SystemRestart className="w-8 h-8 animate-spin text-school-gold" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <Group className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Anda Bukan Wali Kelas
        </h2>
        <p className="text-slate-500">
          Halaman ini hanya tersedia untuk guru yang ditunjuk sebagai wali
          kelas.
        </p>
        <Button className="mt-4" onClick={() => navigate("/teacher/hub")}>
          Kembali ke Teacher Hub
        </Button>
      </div>
    );
  }

  const totalAttendance =
    data.attendanceStats.present +
    data.attendanceStats.sick +
    data.attendanceStats.permission +
    data.attendanceStats.absent;

  const attendanceRate =
    totalAttendance > 0
      ? Math.round((data.attendanceStats.present / totalAttendance) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-school-navy p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-xl"
              onClick={() => navigate("/dashboard/teacher/hub")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Group className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif">
                Dashboard Wali Kelas {data.class.name}
              </h1>
              <p className="text-white/80 text-sm">
                {data.class.room && `Ruang ${data.class.room} • `}
                {data.totalStudents} Siswa Terdaftar
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-white/30 text-school-gold hover:bg-white hover:text-school-navy"
            onClick={() => navigate("/dashboard/teacher/homeroom/attendance")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Input Absensi
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Siswa</p>
                <p className="text-3xl font-bold text-school-navy">
                  {data.totalStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Group className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Kehadiran Bulan Ini</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {attendanceRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Rata-rata Nilai</p>
                <p className="text-3xl font-bold text-amber-600">
                  {data.avgGrade}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <StatsUpSquare className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tugas Pending</p>
                <p className="text-3xl font-bold text-purple-600">
                  {data.submissionStats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Book className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white rounded-lg"
          >
            Ringkasan
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-white rounded-lg text-school-navy font-bold"
          >
            Analitik Progres
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-white rounded-lg"
          >
            Daftar Siswa
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="data-[state=active]:bg-white rounded-lg"
          >
            Absensi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Attendance Summary */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-school-gold" />
                Rekap Absensi Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-600">
                    {data.attendanceStats.present}
                  </p>
                  <p className="text-sm text-slate-500">Hadir</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <p className="text-2xl font-bold text-yellow-600">
                    {data.attendanceStats.sick}
                  </p>
                  <p className="text-sm text-slate-500">Sakit</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">
                    {data.attendanceStats.permission}
                  </p>
                  <p className="text-sm text-slate-500">Izin</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-600">
                    {data.attendanceStats.absent}
                  </p>
                  <p className="text-sm text-slate-500">Alpha</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Assessments */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-school-gold" />
                Tugas Terbaru untuk Kelas Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentAssessments.length === 0 ? (
                <p className="text-center text-slate-400 py-8">
                  Belum ada tugas untuk kelas ini
                </p>
              ) : (
                <div className="space-y-3">
                  {data.recentAssessments.map((a) => (
                    <div
                      key={a._id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{a.title}</p>
                        <p className="text-sm text-slate-500">
                          {a.subject?.name} •{" "}
                          {a.teacher?.profile?.fullName || "Guru"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-white text-xs capitalize"
                      >
                        {a.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 space-y-2">
                <h4 className="font-bold text-sm text-school-navy mb-3">
                  Peringatan Siswa Hari Ini
                </h4>
                {data.studentWarnings && data.studentWarnings.length > 0 ? (
                  data.studentWarnings.map((warning) => (
                    <div
                      key={warning._id}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-bottom-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <div>
                          <p className="text-sm font-bold text-red-700">
                            {warning.name}
                          </p>
                          <p className="text-xs text-red-500">
                            {warning.issue}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-red-200 text-red-700 hover:bg-red-100"
                        onClick={() =>
                          navigate("/dashboard/teacher/homeroom/attendance")
                        }
                      >
                        Cek Absensi
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium">
                      Semua siswa aman terkendali hari ini!
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Tren Belajar Siswa</CardTitle>
                <CardDescription>
                  Rata-rata nilai kelas dari waktu ke waktu
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loadingAnalytics ? (
                  <div className="w-full h-full flex justify-center items-center">
                    <SystemRestart className="animate-spin text-slate-300 w-8 h-8" />
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="w-full h-full flex justify-center items-center text-slate-400">
                    Belum ada data nilai cukup untuk tren.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        dx={-10}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value) => [`${value}`, "Rata-rata Nilai"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "#2563eb",
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Heatmap Mata Pelajaran</CardTitle>
                <CardDescription>
                  Performa rata-rata kelas per mata pelajaran
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loadingAnalytics ? (
                  <div className="w-full h-full flex justify-center items-center">
                    <SystemRestart className="animate-spin text-slate-300 w-8 h-8" />
                  </div>
                ) : heatmapData.length === 0 ? (
                  <div className="w-full h-full flex justify-center items-center text-slate-400">
                    Belum ada data nilai mata pelajaran.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={heatmapData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="subject"
                        width={90}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#475569",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: any, name: any, props: any) => [
                          `${value}`,
                          "Rata-rata",
                        ]}
                      />
                      <Bar
                        dataKey="average"
                        fill="#f59e0b"
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Daftar Siswa Kelas {data.class.name}</CardTitle>
              <CardDescription>
                {data.totalStudents} siswa terdaftar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>JK</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.students.map((student, idx) => (
                    <TableRow key={student._id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={student.profile?.avatar} />
                            <AvatarFallback className="bg-school-gold/20 text-school-navy text-xs">
                              {student.profile?.fullName?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {student.profile?.fullName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {student.profile?.nisn || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            student.profile?.gender === "L"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-pink-50 text-pink-600"
                          }
                        >
                          {student.profile?.gender || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() =>
                            navigate(`/teacher/homeroom/student/${student._id}`)
                          }
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Rekap Absensi per Siswa</CardTitle>
              <CardDescription>Data kehadiran bulan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <CardContent>
                {activeTab === "attendance" && <HomeroomAttendanceSummary />}
              </CardContent>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomeroomDashboardPage;
