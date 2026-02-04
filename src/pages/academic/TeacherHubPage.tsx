import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  BookStack,
  Group,
  Clock,
  CheckCircle,
  Journal,
  ClipboardCheck,
  OpenBook,
  Building,
  ScanQrCode,
  Printer,
  Book,
} from "iconoir-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const TeacherHubPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("schedule");

  // State for data
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);

  // Day Logic
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = days[new Date().getDay()];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await api.get(`/dashboard/teacher-stats?day=${today}`);
      setStats(statsRes.data);

      // 2. Fetch Schedule Today
      if (user?.id) {
        const scheduleRes = await api.get(
          `/schedule?teacherId=${user.id}&day=${today}`,
        );
        setSchedules(scheduleRes.data);
      }

      // 3. Fetch Assessments (for Grading Tab) - limit to recent
      if (user?.id) {
        const assessRes = await api.get(
          `/academic/assessment?teacher=${user.id}`,
        );
        setAssessments(assessRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch teacher hub data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <h2 className="font-serif text-3xl font-bold text-school-navy mb-2">
            Ruang Guru
          </h2>
          <p className="text-slate-500 max-w-xl leading-relaxed">
            Pusat kendali aktivitas mengajar Anda. Kelola jadwal, penilaian, dan
            administrasi kelas dalam satu tampilan terpadu.
          </p>
        </div>
      </div>

      {/* Main Stats / Welcome */}
      <Card className="bg-gradient-to-br from-school-navy to-slate-900 border-none shadow-xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-school-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-school-gold text-school-navy hover:bg-school-gold/90">
                {user?.role === "admin" ? "Administrator" : "Guru Pengajar"}
              </Badge>
              {stats?.homeroomClass && (
                <Badge variant="outline" className="text-white border-white/20">
                  Wali Kelas {stats.homeroomClass}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-serif font-bold mb-2">
              Selamat Pagi, {user?.profile?.fullName || user?.username}! ☀️
            </h1>
            <p className="text-white/70 max-w-2xl">
              Anda memiliki{" "}
              <span className="text-school-gold font-bold">
                {stats?.teachingHours || 0} jam mengajar
              </span>{" "}
              hari ini dan{" "}
              <span className="text-school-gold font-bold">
                {stats?.pendingGrading || 0} tugas
              </span>{" "}
              yang perlu dinilai. Semangat mengajar!
            </p>
          </div>

          {/* Quick Actions Grid using 2x2 layout */}
          <div className="grid grid-cols-2 gap-3 min-w-[300px]">
            <Button
              onClick={() => navigate("/dashboard/academic/journal")}
              className="h-auto py-3 flex flex-col items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/10"
            >
              <Journal className="w-5 h-5 text-school-gold" />
              <span className="text-xs">Isi Jurnal</span>
            </Button>
            <Button
              onClick={() => navigate("/dashboard/academic/attendance")}
              className="h-auto py-3 flex flex-col items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/10"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-xs">Absensi</span>
            </Button>
            <Button
              onClick={() => navigate("/dashboard/academic/grades")}
              className="h-auto py-3 flex flex-col items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/10"
            >
              <ClipboardCheck className="w-5 h-5 text-blue-400" />
              <span className="text-xs">Input Nilai</span>
            </Button>
            <Button
              onClick={() => navigate("/dashboard/academic/materials")}
              className="h-auto py-3 flex flex-col items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/10"
            >
              <BookStack className="w-5 h-5 text-purple-400" />
              <span className="text-xs">Bahan Ajar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Menu Lengkap Grid */}
      <h3 className="font-bold text-xl text-school-navy flex items-center gap-2">
        <Book className="w-6 h-6 text-school-gold" /> Menu Lengkap
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Jadwal Pelajaran",
            icon: Calendar,
            path: "/dashboard/academic/schedule",
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            title: "Absensi Siswa",
            icon: CheckCircle,
            path: "/dashboard/academic/attendance",
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            title: "Input Nilai",
            icon: ClipboardCheck,
            path: "/dashboard/academic/grades",
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            title: "Bahan Ajar",
            icon: BookStack,
            path: "/dashboard/academic/materials",
            color: "text-purple-500",
            bg: "bg-purple-50",
          },
          {
            title: "Bank Asesmen",
            icon: Book,
            path: "/dashboard/academic/assessment",
            color: "text-pink-500",
            bg: "bg-pink-50",
          },
          {
            title: "Tujuan Pembelajaran",
            icon: CheckCircle,
            path: "/dashboard/academic/learning-goals",
            color: "text-cyan-500",
            bg: "bg-cyan-50",
          },
          {
            title: "Data Siswa",
            icon: Group,
            path: "/dashboard/academic/students",
            color: "text-indigo-500",
            bg: "bg-indigo-50",
          },
          {
            title: "Scan QR",
            icon: ScanQrCode,
            path: "/dashboard/academic/scan",
            color: "text-slate-500",
            bg: "bg-slate-50",
          },
          {
            title: "E-Rapor",
            icon: Printer,
            path: "/dashboard/academic/report",
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            title: "Jurnal Mengajar",
            icon: Journal,
            path: "/dashboard/academic/journal",
            color: "text-teal-500",
            bg: "bg-teal-50",
          },
        ].map((item, idx) => (
          <Card
            key={idx}
            className="group hover:shadow-md transition-all cursor-pointer border-none shadow-sm bg-white"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div
                className={`p-3 rounded-full ${item.bg} group-hover:scale-110 transition-transform`}
              >
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <span className="font-bold text-school-navy text-sm">
                {item.title}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs
        defaultValue="schedule"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-white p-1 rounded-full shadow-sm border border-slate-100 w-full sm:w-auto overflow-x-auto justify-start">
          <TabsTrigger
            value="schedule"
            className="rounded-full px-6 data-[state=active]:bg-school-navy data-[state=active]:text-white transition-all"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Jadwal Mengajar
          </TabsTrigger>
          <TabsTrigger
            value="grading"
            className="rounded-full px-6 data-[state=active]:bg-school-navy data-[state=active]:text-white transition-all"
          >
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Manajemen Tugas
          </TabsTrigger>
          {stats?.homeroomClass && (
            <TabsTrigger
              value="homeroom"
              className="rounded-full px-6 data-[state=active]:bg-school-navy data-[state=active]:text-white transition-all"
            >
              <Group className="w-4 h-4 mr-2" />
              Wali Kelas
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent
          value="schedule"
          className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"
        >
          {/* Today's Schedule List */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-school-navy flex items-center gap-2">
                <Calendar className="w-5 h-5 text-school-gold" />
                Jadwal Hari Ini ({today})
              </h3>
            </div>

            {schedules.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  Tidak ada jadwal mengajar hari ini.
                </p>
                <p className="text-xs text-slate-400">
                  Selamat beristirahat atau persiapkan materi untuk besok!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules.map((schedule) => (
                  <Card
                    key={schedule._id}
                    className="group hover:shadow-lg transition-all border-none shadow-sm bg-white overflow-hidden relative"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-school-gold" />
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <Badge
                          variant="outline"
                          className="border-school-navy/20 text-school-navy bg-school-navy/5"
                        >
                          {schedule.class?.name}
                        </Badge>
                        <Badge
                          className={`
                                            ${
                                              new Date().getHours() >=
                                                parseInt(
                                                  schedule.startTime.split(
                                                    ":",
                                                  )[0],
                                                ) &&
                                              new Date().getHours() <
                                                parseInt(
                                                  schedule.endTime.split(
                                                    ":",
                                                  )[0],
                                                )
                                                ? "bg-green-100 text-green-700 animate-pulse"
                                                : "bg-slate-100 text-slate-600"
                                            }
                                        `}
                        >
                          {new Date().getHours() >=
                            parseInt(schedule.startTime.split(":")[0]) &&
                          new Date().getHours() <
                            parseInt(schedule.endTime.split(":")[0])
                            ? "Sedang Berlangsung"
                            : `${schedule.startTime} - ${schedule.endTime}`}
                        </Badge>
                      </div>

                      <h4 className="font-bold text-lg text-school-navy mb-1">
                        {schedule.subject?.name}
                      </h4>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4" />
                        {schedule.startTime} - {schedule.endTime} WIB
                      </p>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() =>
                            navigate("/dashboard/academic/attendance")
                          }
                        >
                          Absen
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-school-navy text-xs hover:bg-school-gold hover:text-school-navy"
                          onClick={() =>
                            navigate("/dashboard/academic/journal")
                          }
                        >
                          Isi Jurnal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="grading"
          className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.length === 0 ? (
              <div className="col-span-full p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Belum ada tugas yang dibuat.</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/dashboard/academic/assessment")}
                >
                  Buat Tugas Baru
                </Button>
              </div>
            ) : (
              assessments.map((assessment) => (
                <Card
                  key={assessment._id}
                  className="hover:shadow-md transition-shadow border-slate-100"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge className="mb-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                        {assessment.type === "assignment" ? "Tugas" : "Ujian"}
                      </Badge>
                      {/* Ideally show pending count here but API doesn't support yet per item efficiently */}
                    </div>
                    <CardTitle className="text-base font-bold text-school-navy line-clamp-2">
                      {assessment.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {assessment.subject?.name} •{" "}
                      {assessment.classes?.map((c: any) => c.name).join(", ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Deadline:{" "}
                      {new Date(assessment.deadline).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                    <Button
                      className="w-full bg-slate-900 text-xs h-8"
                      onClick={() => navigate("/dashboard/academic/assessment")}
                    >
                      Lihat Penilaian
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="homeroom"
          className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"
        >
          <Card>
            <CardHeader>
              <CardTitle>Kelas Perwalian: {stats?.homeroomClass}</CardTitle>
              <CardDescription>
                Ringkasan aktivitas siswa di kelas Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <h4 className="text-red-800 font-bold mb-1">
                    Kehadiran (Alpha)
                  </h4>
                  <p className="text-2xl font-bold text-red-600">
                    0{" "}
                    <span className="text-sm font-normal text-red-400">
                      Siswa
                    </span>
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <h4 className="text-orange-800 font-bold mb-1">
                    Tagihan Penunggak
                  </h4>
                  <p className="text-2xl font-bold text-orange-600">
                    0{" "}
                    <span className="text-sm font-normal text-orange-400">
                      Siswa
                    </span>
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="text-blue-800 font-bold mb-1">
                    Insiden Siswa
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    0{" "}
                    <span className="text-sm font-normal text-blue-400">
                      Kasus
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/academic/students")}
                >
                  Lihat Data Siswa
                </Button>
                <Button
                  onClick={() => navigate("/dashboard/academic/attendance")}
                >
                  Cek Rekap Absensi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Homeroom Tab - Wali Kelas */}
        {stats?.homeroomClass && (
          <TabsContent
            value="homeroom"
            className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"
          >
            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Group className="w-6 h-6 text-school-navy" />
                  Dashboard Wali Kelas {stats.homeroomClass}
                </CardTitle>
                <CardDescription>
                  Kelola dan pantau kelas perwalian Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
                    <p className="text-2xl font-bold text-school-navy">
                      {stats.classStudentCount || 0}
                    </p>
                    <p className="text-xs text-slate-500">Total Siswa</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.classAttendanceRate || 0}%
                    </p>
                    <p className="text-xs text-slate-500">Kehadiran</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      {stats.classAvgGrade || 0}
                    </p>
                    <p className="text-xs text-slate-500">Rata-rata Nilai</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.classPendingSubmissions || 0}
                    </p>
                    <p className="text-xs text-slate-500">Tugas Pending</p>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-school-navy hover:bg-school-gold hover:text-school-navy"
                  onClick={() => navigate("/dashboard/teacher/homeroom")}
                >
                  <Group className="w-5 h-5 mr-2" />
                  Buka Dashboard Wali Kelas Lengkap
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default TeacherHubPage;
