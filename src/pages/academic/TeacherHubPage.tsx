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
  NavArrowRight,
  WarningTriangle,
  Trophy,
  User,
  Printer,
} from "iconoir-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const TeacherHubPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for data
  const [stats, setStats] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [upNext, setUpNext] = useState<any>(null);

  // Day Logic
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = days[new Date().getDay()];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Calculate Up Next whenever schedules change
    if (schedules.length > 0) {
      calculateUpNext(schedules);
    }
  }, [schedules]);

  const fetchData = async () => {
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
    }
  };

  const calculateUpNext = (todaysSchedules: any[]) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMinute;

    // Sort by start time
    const sorted = [...todaysSchedules].sort((a, b) => {
      const timeA =
        parseInt(a.startTime.split(":")[0]) * 60 +
        parseInt(a.startTime.split(":")[1]);
      const timeB =
        parseInt(b.startTime.split(":")[0]) * 60 +
        parseInt(b.startTime.split(":")[1]);
      return timeA - timeB;
    });

    // Find first class that hasn't ended users
    const next = sorted.find((s) => {
      const endH = parseInt(s.endTime.split(":")[0]);
      const endM = parseInt(s.endTime.split(":")[1]);
      const endTimeVal = endH * 60 + endM;
      return endTimeVal > currentTimeVal;
    });

    setUpNext(next || null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="space-y-6 pb-10 font-sans">
      {/* 1. Header & Hero Section: Greeting + Up Next */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branding / Welcome Card */}
        <Card className="lg:col-span-2 bg-school-navy border-none shadow-xl text-white overflow-hidden relative min-h-[220px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-school-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-school-gold/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <CardContent className="relative z-10 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <User className="w-5 h-5 text-school-gold" />
              </div>
              <Badge className="bg-school-gold text-school-navy hover:bg-school-gold/90 font-bold px-3">
                {user?.role === "admin" ? "Administrator" : "Guru Profesional"}
              </Badge>
              <span className="text-white/60 text-sm">
                {today},{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3 leading-tight">
              {getGreeting()}, <br />
              <span className="text-school-gold">
                {user?.profile?.fullName || user?.username}
              </span>
            </h1>

            <p className="text-white/70 max-w-lg text-sm md:text-base">
              Siap untuk menginspirasi siswa hari ini? Anda memiliki{" "}
              <span className="text-white font-bold">
                {schedules.length} kelas
              </span>{" "}
              dan{" "}
              <span className="text-white font-bold">
                {stats?.pendingGrading || 0} tugas
              </span>{" "}
              yang perlu diperiksa.
            </p>
          </CardContent>
        </Card>

        {/* Up Next Card */}
        <Card className="bg-white border-none shadow-lg relative overflow-hidden flex flex-col">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-school-navy to-school-gold" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-school-navy flex items-center gap-2">
              <Clock className="w-5 h-5 text-school-gold" />
              Aktivitas Berikutnya
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center py-4">
            {upNext ? (
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-school-navy">
                      {upNext.subject?.name}
                    </h3>
                    <p className="text-slate-500 font-medium text-lg">
                      {upNext.class?.name}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 px-3 py-1 text-xs"
                  >
                    {upNext.startTime} - {upNext.endTime}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>
                      Status: <b>Aktif</b>
                    </span>
                  </div>
                  <div className="w-px h-4 bg-slate-300 my-auto" />
                  <div className="flex items-center gap-2">
                    <Group className="w-4 h-4 text-blue-500" />
                    <span>{stats?.classStats?.studentCount || 30} Siswa</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-school-navy hover:bg-school-gold hover:text-school-navy group transition-all"
                  onClick={() => navigate("/dashboard/academic/journal")}
                >
                  Mulai Kelas
                  <NavArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Semua kelas hari ini selesai!</p>
                <p className="text-xs mt-1">
                  Istirahat sejenak atau siapkan materi besok.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 2. Stats Grid - Visual Actionable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className="border-none shadow-sm bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer group"
          onClick={() => navigate("/dashboard/academic/attendance")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <div className="p-3 bg-white rounded-full text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-school-navy">
                {stats?.classStats?.attendanceRate || 0}%
              </p>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                Kehadiran (Wali)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-none shadow-sm bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer group"
          onClick={() => navigate("/dashboard/academic/assessment")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <div className="p-3 bg-white rounded-full text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-school-navy">
                {stats?.pendingGrading || 0}
              </p>
              <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">
                Perlu Dinilai
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-none shadow-sm bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer group"
          onClick={() => navigate("/dashboard/academic/materials")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <div className="p-3 bg-white rounded-full text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
              <BookStack className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-school-navy">
                {stats?.teachingHours || 0}
              </p>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
                Jam Mengajar
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-none shadow-sm bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer group"
          onClick={() => navigate("/dashboard/teacher/homeroom")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <div className="p-3 bg-white rounded-full text-rose-600 shadow-sm group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-school-navy">
                {stats?.classStats?.avgGrade || "-"}
              </p>
              <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">
                Performa (Wali)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Content: Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="schedule" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl text-school-navy">
                Detail Aktivitas
              </h3>
              <TabsList className="bg-white border border-slate-100 shadow-sm">
                <TabsTrigger
                  value="schedule"
                  className="data-[state=active]:bg-school-navy data-[state=active]:text-white"
                >
                  Jadwal
                </TabsTrigger>
                <TabsTrigger
                  value="grading"
                  className="data-[state=active]:bg-school-navy data-[state=active]:text-white"
                >
                  Penilaian
                </TabsTrigger>
                {stats?.homeroomClass && (
                  <TabsTrigger
                    value="homeroom"
                    className="data-[state=active]:bg-school-navy data-[state=active]:text-white"
                  >
                    Wali Kelas
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent
              value="schedule"
              className="space-y-4 animate-in slide-in-from-bottom-2"
            >
              {schedules.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">
                    Tidak ada jadwal tersisa hari ini.
                  </p>
                </div>
              ) : (
                schedules.map((schedule) => {
                  const isActive = upNext?._id === schedule._id;

                  return (
                    <div
                      key={schedule._id}
                      className={`
                        p-4 rounded-xl border flex items-center gap-4 transition-all
                        ${isActive ? "bg-white border-school-gold shadow-md scale-[1.01]" : "bg-white border-slate-100 hover:border-slate-200"}
                      `}
                    >
                      <div
                        className={`
                         w-14 h-14 rounded-lg flex flex-col items-center justify-center shrink-0 font-bold
                         ${isActive ? "bg-school-navy text-school-gold" : "bg-slate-100 text-slate-500"}
                       `}
                      >
                        <span className="text-sm">
                          {schedule.startTime.split(":")[0]}
                        </span>
                        <span className="text-[10px] opacity-70">
                          :{schedule.startTime.split(":")[1]}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h4
                          className={`font-bold ${isActive ? "text-school-navy" : "text-slate-700"}`}
                        >
                          {schedule.subject?.name}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {schedule.class?.name} • Ruang 101
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {isActive && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 animate-pulse">
                            Berlangsung
                          </Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full"
                          onClick={() =>
                            navigate("/dashboard/academic/journal")
                          }
                        >
                          <NavArrowRight className="w-5 h-5 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent
              value="grading"
              className="space-y-4 animate-in slide-in-from-bottom-2"
            >
              {assessments.slice(0, 3).map((assessment) => (
                <div
                  key={assessment._id}
                  className="p-4 bg-white rounded-xl border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-school-navy group-hover:text-school-gold transition-colors">
                        {assessment.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {assessment.subject?.name} • Deadline:{" "}
                        {new Date(assessment.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/dashboard/academic/assessment")}
                  >
                    Nilai
                  </Button>
                </div>
              ))}
              {assessments.length === 0 && (
                <div className="p-6 text-center text-slate-400 italic">
                  Belum ada tugas yang perlu dinilai.
                </div>
              )}
            </TabsContent>

            {stats?.homeroomClass && (
              <TabsContent
                value="homeroom"
                className="space-y-6 animate-in slide-in-from-bottom-2"
              >
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-school-navy">
                      <Group className="w-5 h-5 text-school-gold" />
                      Kelas Perwalian: {stats.homeroomClass}
                    </CardTitle>
                    <CardDescription>
                      Ringkasan aktivitas siswa di kelas Anda hari ini.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-2xl font-bold text-school-navy">
                          {stats?.classStats?.studentCount || 0}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Total Siswa
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-2xl font-bold text-emerald-600">
                          {stats?.classStats?.attendanceRate || 0}%
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Kehadiran Hari Ini
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-school-navy mb-2">
                        Peringatan Siswa
                      </h4>

                      {stats?.classStats?.studentWarnings?.length > 0 ? (
                        stats.classStats.studentWarnings
                          .map((warning: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <div>
                                  <p className="text-xs font-bold text-red-700">
                                    {stats.classStats.absentCount} Siswa Belum
                                    Absen
                                  </p>
                                  <p className="text-[10px] text-red-500">
                                    {warning.name} &{" "}
                                    {stats.classStats.absentCount - 1} lainnya
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-100"
                                onClick={() =>
                                  navigate("/dashboard/teacher/homeroom")
                                }
                              >
                                Cek
                              </Button>
                            </div>
                          ))
                          .slice(0, 1) // Just show one summary card if there are issues
                      ) : (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <p className="text-xs text-emerald-700 font-medium">
                            Semua siswa hadir hari ini!
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <Button
                        className="w-full bg-school-navy hover:bg-school-gold hover:text-school-navy text-xs"
                        onClick={() => navigate("/dashboard/teacher/homeroom")}
                      >
                        Buka Dashboard Wali Kelas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar Widgets (Actionable) */}
        <div className="space-y-6">
          {/* Needs Attention Widget */}
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-school-navy">
                <WarningTriangle className="w-4 h-4 text-amber-500" />
                Perlu Perhatian
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              {!stats?.missingAttendance?.length &&
              !stats?.pendingGradingDetails?.length ? (
                <div className="text-slate-400 text-center py-4 italic">
                  Semua aman terkendali! 🎉
                </div>
              ) : (
                <>
                  {stats?.missingAttendance?.map((item: any, idx: number) => (
                    <div
                      key={`att-${idx}`}
                      className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0"
                    >
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-medium">
                          Absensi {item.className} (Kemarin)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {item.subjectName} • {item.time}
                        </span>
                      </div>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-amber-600 text-xs font-bold"
                        onClick={() =>
                          navigate("/dashboard/academic/attendance")
                        }
                      >
                        Lengkapi
                      </Button>
                    </div>
                  ))}

                  {stats?.pendingGradingDetails?.map((item: any) => (
                    <div
                      key={`grad-${item._id}`}
                      className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0"
                    >
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-medium">
                          Nilai {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {item.count} siswa menunggu
                        </span>
                      </div>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-amber-600 text-xs font-bold"
                        onClick={() =>
                          navigate("/dashboard/academic/assessment")
                        }
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Tools Widget */}
          <Card className="bg-slate-900 text-white border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-school-gold">
                Quick Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-xs justify-start"
                onClick={() => navigate("/dashboard/academic/journal")}
              >
                <Journal className="w-3 h-3 mr-2" /> Jurnal
              </Button>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-xs justify-start"
                onClick={() => navigate("/dashboard/academic/scan")}
              >
                <CheckingBadge className="w-3 h-3 mr-2" /> Scan QR
              </Button>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-xs justify-start"
                onClick={() => navigate("/dashboard/academic/report")}
              >
                <Printer className="w-3 h-3 mr-2" /> E-Rapor
              </Button>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-xs justify-start"
                onClick={() => navigate("/dashboard/academic/materials")}
              >
                <BookStack className="w-3 h-3 mr-2" /> Materi
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper component for Icon (since standard import missing it mostly)
const CheckingBadge = (props: any) => (
  <svg
    width="24px"
    height="24px"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="currentColor"
    {...props}
  >
    <path
      d="M14.5 16L16.5 18L20.5 13"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
);

export default TeacherHubPage;
