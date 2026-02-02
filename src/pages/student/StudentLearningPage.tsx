import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Book,
  CheckCircle,
  MapPin,
  Download,
  Send,
  GoogleDrive,
  Page,
  VideoCamera,
  Search,
  NavArrowRight,
  UserBadgeCheck,
  WarningTriangle,
  SystemRestart,
  EditPencil,
  ScanQrCode,
} from "iconoir-react";
import { cn } from "@/lib/utils";
import StudentQRCard from "@/components/student/StudentQRCard";

// --- Interfaces ---
interface Assessment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  deadline: string;
  type: "assignment" | "material";
  teacher: { username: string; profile?: { fullName: string } };
  attachments: string[];
}

interface Submission {
  _id: string;
  status: "submitted" | "graded" | "late";
  grade?: number;
  feedback?: string;
  submittedAt: string;
  text?: string;
  files?: string[];
  driveLink?: string;
}

interface Schedule {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: { _id: string; name: string };
  teacher: { profile?: { fullName: string } };
  class: { name: string };
}

interface Material {
  _id: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  subject: { name: string; _id: string };
  teacher: { profile?: { fullName: string } };
  gradeLevel: number;
}

// --- Helpers ---
const getFileUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path}`;
};

const StudentLearningPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Data States
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tasks, setTasks] = useState<
    { assessment: Assessment; submission: Submission | null }[]
  >([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Filter States
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedDay, setSelectedDay] = useState("");
  const [todayName, setTodayName] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [selectedMaterialSubject, setSelectedMaterialSubject] = useState("all");
  const [selectedTaskSubject, setSelectedTaskSubject] = useState("all");
  const [selectedTask, setSelectedTask] = useState<{
    assessment: Assessment;
    submission: Submission | null;
  } | null>(null);

  // Form States
  const [answerText, setAnswerText] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [processingAbsence, setProcessingAbsence] = useState("");

  const [isProfileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    avatar: user?.profile?.avatar || "",
    // Basic
    address: user?.profile?.address || "",
    phone: user?.profile?.phone || "",
    bio: user?.profile?.bio || "",
    // Student Specific
    birthPlace: user?.profile?.birthPlace || "",
    birthDate: user?.profile?.birthDate
      ? new Date(user.profile.birthDate).toISOString().split("T")[0]
      : "",

    // Family (Nested would need careful handling, keeping simple for now)
    fatherName: user?.profile?.family?.fatherName || "",
    motherName: user?.profile?.family?.motherName || "",
    phoneParent: user?.profile?.family?.phone || "",
  });

  const handleUpdateProfile = async () => {
    try {
      setSubmitting(true);
      const payload = {
        profile: {
          address: profileData.address,
          phone: profileData.phone,
          bio: profileData.bio,
          birthPlace: profileData.birthPlace,
          birthDate: profileData.birthDate,
          family: {
            fatherName: profileData.fatherName,
            motherName: profileData.motherName,
            phone: profileData.phoneParent,
          },
        },
      };

      const res = await api.put("/auth/profile", payload);

      // Update local user context if possible, or just notify
      toast({
        title: "Profil Berhasil Diupdate",
        description: "Perubahan telah disimpan.",
      });
      setProfileOpen(false);
      // Reload page to reflect changes is simplest for now
      window.location.reload();
    } catch (err) {
      toast({
        title: "Gagal Update",
        description: "Perubahan gagal disimpan.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  useEffect(() => {
    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const d = new Date();
    const indoDay = dayNames[d.getDay()];
    setTodayName(indoDay);
    setSelectedDay(indoDay === "Minggu" ? "Senin" : indoDay);

    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSchedules(),
        fetchTasks(),
        fetchMaterials(),
        fetchSubjects(),
      ]);
    } catch (error) {
      console.error("Failed to load hub data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    const userAny = user as any;
    const clsName = userAny?.profile?.class;
    if (!clsName) return;

    try {
      const clsRes = await api.get("/academic/class");
      const myClass = clsRes.data.find(
        (c: any) =>
          c.name.trim().toLowerCase() === clsName.trim().toLowerCase(),
      );
      if (myClass) {
        const res = await api.get(
          `/schedule?classId=${myClass._id}&day=${selectedDay || todayName}`,
        );
        setSchedules(res.data);
      }
    } catch (e) {
      console.error("Schedule error", e);
    }
  };

  useEffect(() => {
    if (selectedDay) fetchSchedules();
  }, [selectedDay]);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/assessment");
      const assessmentList: Assessment[] = res.data;
      const tasksWithStatus = await Promise.all(
        assessmentList.map(async (a) => {
          try {
            const detailRes = await api.get(`/assessment/${a._id}`);
            return { assessment: a, submission: detailRes.data.submission };
          } catch {
            return { assessment: a, submission: null };
          }
        }),
      );
      setTasks(tasksWithStatus);
    } catch (e) {
      console.error("Tasks error", e);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await api.get("/learning-material");
      setMaterials(res.data);
    } catch (e) {
      console.error("Materials error", e);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/academic/subjects");
      setSubjects(res.data);
    } catch (e) {
      console.error("Subjects error", e);
    }
  };

  const handleAttend = async (scheduleId: string) => {
    setProcessingAbsence(scheduleId);
    try {
      await api.post("/attendance/subject", {
        scheduleId,
        status: "Present",
        date: new Date().toISOString(),
      });
      toast({ title: "Berhasil", description: "Hadir!" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.message || "Gagal absen",
      });
    } finally {
      setProcessingAbsence("");
    }
  };

  const handleTaskSubmit = async () => {
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (const f of filesToUpload) {
        const fd = new FormData();
        fd.append("file", f);
        const up = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls.push(up.data.url);
      }
      await api.post(`/assessment/${selectedTask.assessment._id}/submit`, {
        text: answerText,
        driveLink: driveLink,
        files: uploadedUrls,
      });
      toast({ title: "Tugas berhasil dikirim!" });
      setSelectedTask(null);
      fetchTasks();
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal kirim tugas" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <SystemRestart className="h-10 w-10 animate-spin text-school-gold" />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="relative overflow-hidden rounded-[2rem] bg-school-navy text-white shadow-2xl p-6 md:p-14">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-school-gold/20 to-transparent rounded-full blur-3xl -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <Badge className="bg-school-gold/20 text-school-gold border-none mb-4 px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
              Student Learning Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl font-serif font-black mb-4 tracking-tight leading-tight">
              Semangat Belajar, <br />
              <span className="text-school-gold">
                {user?.profile?.fullName?.split(" ")[0] || "Siswa"}!
              </span>
            </h1>
            <p className="text-blue-100/70 text-lg font-light max-w-md mx-auto md:mx-0">
              Pantau jadwal, akses materi, dan kerjakan tugasmu dalam satu
              tempat yang nyaman.
            </p>
          </div>

          <div className="flex flex-col gap-4 min-w-[280px]">
            <div className="glass-morphism p-6 rounded-2xl border border-white/10 text-center bg-white/5 backdrop-blur-xl">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-school-gold block mb-1">
                {todayName}
              </span>
              <div className="text-3xl font-serif font-bold">
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 p-4 rounded-xl text-center border border-white/5">
                <span className="text-[10px] uppercase font-bold text-white/40 block">
                  Tugas Pending
                </span>
                <span className="text-2xl font-bold text-school-gold">
                  {tasks.filter((t) => !t.submission).length}
                </span>
              </div>
              <div className="bg-white/10 p-4 rounded-xl text-center border border-white/5">
                <span className="text-[10px] uppercase font-bold text-white/40 block">
                  Mata Pelajaran
                </span>
                <span className="text-2xl font-bold text-school-gold">
                  {subjects.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- DASHBOARD CONTENT --- */}
      <Tabs
        defaultValue="schedule"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <div className="z-40 bg-white/80 backdrop-blur-md p-2 rounded-2xl border shadow-sm mb-8">
          <TabsList className="grid grid-cols-3 w-full h-12 bg-transparent">
            <TabsTrigger
              value="schedule"
              className="rounded-xl data-[state=active]:bg-school-navy data-[state=active]:text-white font-bold transition-all"
            >
              <Calendar className="mr-2 w-4 h-4" /> Jadwal & Absen
            </TabsTrigger>
            <TabsTrigger
              value="materials"
              className="rounded-xl data-[state=active]:bg-school-navy data-[state=active]:text-white font-bold transition-all"
            >
              <Book className="mr-2 w-4 h-4" /> Materi Belajar
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="rounded-xl data-[state=active]:bg-school-navy data-[state=active]:text-white font-bold transition-all"
            >
              <NavArrowRight className="mr-2 w-4 h-4" /> Ruang Tugas
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- SCHEDULE TAB --- */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 px-2">
            <h3 className="font-serif text-2xl font-bold text-school-navy flex items-center gap-2">
              <Clock className="w-6 h-6 text-school-gold" /> Jadwal Pelajaran
            </h3>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-school-navy text-school-gold hover:bg-school-navy/90 font-bold border-2 border-school-gold shadow-lg shadow-school-gold/20 animate-pulse">
                    <ScanQrCode className="w-5 h-5 mr-2" /> Tampilkan QR Absen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Absensi QR Code</DialogTitle>
                  </DialogHeader>
                  <StudentQRCard />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 px-2">
            <div className="hidden md:block"></div>
            <div className="flex gap-1 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none w-full md:w-auto">
              {days.map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={selectedDay === d ? "default" : "outline"}
                  onClick={() => setSelectedDay(d)}
                  className={cn(
                    "rounded-full px-5 font-bold transition-all",
                    selectedDay === d
                      ? "bg-school-navy text-white shadow-md scale-105"
                      : "text-slate-500 hover:text-school-navy",
                  )}
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[2rem] bg-slate-50">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                <p className="font-serif text-xl text-slate-400">
                  Tidak ada jadwal untuk hari {selectedDay}.
                </p>
              </div>
            ) : (
              schedules.map((s) => {
                const now = new Date();
                const parseTime = (timeStr: string) => {
                  const [h, m] = timeStr.split(":").map(Number);
                  return { h: h || 0, m: m || 0 };
                };
                const start = parseTime(s.startTime);
                const end = parseTime(s.endTime);

                const startTime = new Date();
                startTime.setHours(start.h, start.m, 0, 0);
                const endTime = new Date();
                endTime.setHours(end.h, end.m, 0, 0);
                const startTimeAllowed = new Date(startTime);
                startTimeAllowed.setMinutes(startTimeAllowed.getMinutes() - 15);

                const isActive =
                  todayName === s.day &&
                  now >= startTimeAllowed &&
                  now <= endTime;
                const isExpired = todayName === s.day && now > endTime;

                return (
                  <Card
                    key={s._id}
                    className="group relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2rem]"
                  >
                    <div
                      className={cn(
                        "absolute top-0 left-0 w-full h-2 shadow-sm",
                        isActive
                          ? "bg-emerald-500 animate-pulse"
                          : isExpired
                            ? "bg-red-400"
                            : "bg-slate-200",
                      )}
                    />
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-school-navy/5 rounded-2xl text-school-navy group-hover:scale-110 transition-transform">
                          <Book className="w-6 h-6" />
                        </div>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] tracking-tighter"
                        >
                          {s.startTime} - {s.endTime}
                        </Badge>
                      </div>
                      <CardTitle className="mt-4 font-serif text-xl text-school-navy leading-tight">
                        {s.subject?.name}
                      </CardTitle>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <UserBadgeCheck className="w-3 h-3" />{" "}
                        {s.teacher?.profile?.fullName || "Belum ditentukan"}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <MapPin className="w-4 h-4 text-school-gold" />{" "}
                        {s.class?.name}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        onClick={() => handleAttend(s._id)}
                        disabled={
                          processingAbsence === s._id ||
                          !isActive ||
                          todayName !== s.day
                        }
                        className={cn(
                          "w-full h-12 rounded-xl font-black tracking-wide text-sm transition-all",
                          isActive
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                            : isExpired
                              ? "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-200 border border-red-300"
                              : "bg-slate-50 text-slate-400 border border-slate-100",
                        )}
                      >
                        {processingAbsence === s._id ? (
                          <SystemRestart className="h-4 w-4 animate-spin" />
                        ) : isActive ? (
                          "ABSEN MASUK SEKARANG"
                        ) : isExpired ? (
                          "TIDAK HADIR (ALPHA)"
                        ) : (
                          "BELUM MULAI"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* --- MATERIALS TAB --- */}
        <TabsContent value="materials" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h3 className="font-serif text-2xl font-bold text-school-navy flex items-center gap-2">
              <Page className="w-6 h-6 text-school-gold" /> Bahan Ajar & Modul
            </h3>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari judul materi atau guru..."
                className="pl-11 h-12 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-school-gold transition-all"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                value={selectedMaterialSubject}
                onValueChange={setSelectedMaterialSubject}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-school-gold">
                  <SelectValue placeholder="Semua Mata Pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {materials.filter((m) => {
              const matchSearch = m.title
                .toLowerCase()
                .includes(materialSearch.toLowerCase());
              const matchSubject =
                selectedMaterialSubject === "all" ||
                m.subject?._id === selectedMaterialSubject;
              return matchSearch && matchSubject;
            }).length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 border-2 border-dashed rounded-[2rem]">
                Tidak ada materi yang ditemukan.
              </div>
            ) : (
              materials
                .filter((m) => {
                  const matchSearch = m.title
                    .toLowerCase()
                    .includes(materialSearch.toLowerCase());
                  const matchSubject =
                    selectedMaterialSubject === "all" ||
                    m.subject?._id === selectedMaterialSubject;
                  return matchSearch && matchSubject;
                })
                .map((m) => (
                  <Card
                    key={m._id}
                    className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem] bg-white"
                  >
                    <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
                      {m.type === "Video" ? (
                        <div className="bg-red-500/10 p-6 rounded-full">
                          <VideoCamera className="w-12 h-12 text-red-600" />
                        </div>
                      ) : (
                        <div className="bg-blue-500/10 p-6 rounded-full">
                          <Page className="w-12 h-12 text-blue-600" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/90 backdrop-blur-sm text-school-navy border-none shadow-sm uppercase text-[9px] font-black">
                          {m.type}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-school-navy text-white text-[9px] px-2 py-0.5 border-none">
                          {m.subject?.name}
                        </Badge>
                      </div>
                      <CardTitle className="font-serif text-xl line-clamp-1 text-school-navy group-hover:text-school-gold transition-colors">
                        {m.title}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {m.description ||
                          "Akses materi pembelajaran yang diupload oleh guru pengampu."}
                      </p>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-0">
                      <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">
                            {m.teacher?.profile?.fullName?.charAt(0) || "G"}
                          </div>
                          <span className="text-xs font-medium text-slate-400">
                            {m.teacher?.profile?.fullName || "Guru"}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-school-navy hover:text-school-gold hover:bg-school-gold/5"
                          asChild
                        >
                          <a
                            href={getFileUrl(m.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-5 h-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        {/* --- TASKS TAB --- */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-2xl font-bold text-school-navy flex items-center gap-2">
              <NavArrowRight className="w-6 h-6 text-school-gold" /> Ruang
              Penugasan
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <div className="px-4 py-1 text-xs font-bold text-slate-400">
                Total: {tasks.length}
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select
                value={selectedTaskSubject}
                onValueChange={setSelectedTaskSubject}
              >
                <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 shadow-sm focus:ring-school-gold">
                  <SelectValue placeholder="Filter Mapel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mapel</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.filter((t) => {
              return (
                selectedTaskSubject === "all" ||
                t.assessment.subject ===
                  subjects.find((s) => s._id === selectedTaskSubject)?.name
              );
            }).length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 border-2 border-dashed rounded-[2rem]">
                Belum ada tugas yang diberikan oleh guru.
              </div>
            ) : (
              tasks
                .filter((t) => {
                  return (
                    selectedTaskSubject === "all" ||
                    t.assessment.subject ===
                      subjects.find((s) => s._id === selectedTaskSubject)?.name
                  );
                })
                .map((t) => (
                  <Card
                    key={t.assessment._id}
                    className={cn(
                      "group border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2rem] cursor-pointer bg-white relative",
                      !t.submission
                        ? "ring-2 ring-red-100"
                        : "ring-1 ring-emerald-50",
                    )}
                    onClick={() => {
                      setSelectedTask(t);
                      setAnswerText(t.submission?.text || "");
                      setDriveLink(t.submission?.driveLink || "");
                      setFilesToUpload([]);
                    }}
                  >
                    {!t.submission && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-14 h-6 flex items-center justify-center rounded-full shadow-lg animate-pulse ring-4 ring-white">
                        PENTING
                      </div>
                    )}

                    <CardHeader className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge
                          className={cn(
                            "text-[9px] font-black border-none uppercase",
                            !t.submission
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600",
                          )}
                        >
                          {t.assessment.subject}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{" "}
                          {new Date(t.assessment.deadline).toLocaleString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <CardTitle className="font-serif text-xl text-school-navy group-hover:text-school-gold transition-colors leading-tight">
                        {t.assessment.title}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2 font-light">
                        {t.assessment.description}
                      </p>
                    </CardHeader>

                    <CardFooter className="px-6 pb-6">
                      <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-2">
                          {t.submission ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <WarningTriangle className="w-5 h-5 text-red-500" />
                          )}
                          <span
                            className={cn(
                              "text-xs font-bold",
                              t.submission
                                ? "text-emerald-700"
                                : "text-red-700",
                            )}
                          >
                            {t.submission
                              ? t.submission.status === "graded"
                                ? `Dinilai: ${t.submission.grade}`
                                : "Diserahkan"
                              : "Belum Kerja"}
                          </span>
                        </div>
                        <div className="p-1 px-3 bg-white rounded-full text-[10px] font-black text-school-navy shadow-sm">
                          {t.assessment.type === "assignment"
                            ? "TUGAS"
                            : "MATERI"}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- TASK DETAIL / SUBMISSION DIALOG --- */}
      <Dialog
        open={!!selectedTask}
        onOpenChange={(o) => !o && setSelectedTask(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-3xl bg-white">
          <div className="bg-school-navy p-10 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-school-gold/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-school-gold text-school-navy border-none font-black text-xs">
                  {selectedTask?.assessment.subject}
                </Badge>
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Tenggat:{" "}
                  {selectedTask?.assessment.deadline
                    ? new Date(selectedTask.assessment.deadline).toLocaleString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "-"}
                </span>
              </div>
              <DialogTitle className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
                {selectedTask?.assessment.title}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Instruksi & Deskripsi
              </h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedTask?.assessment.description}
              </p>

              {selectedTask?.assessment.attachments &&
                selectedTask.assessment.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      Lampiran Soal
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.assessment.attachments.map((url, i) => (
                        <a
                          key={i}
                          href={getFileUrl(url)}
                          target="_blank"
                          className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-school-navy flex items-center gap-2 hover:border-school-gold hover:text-school-gold transition-all"
                        >
                          📄 Lampiran {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-serif font-bold text-school-navy flex items-center gap-3">
                <Send className="w-6 h-6 text-school-gold" /> Lembar Jawaban
              </h3>

              {selectedTask?.submission?.status === "graded" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-500 rounded-3xl p-8 text-white flex flex-col items-center justify-center text-center shadow-xl shadow-emerald-100">
                    <span className="text-xs font-black tracking-widest uppercase text-white/60 mb-2">
                      Skor Akhir
                    </span>
                    <h1 className="text-7xl font-serif font-black">
                      {selectedTask.submission.grade}
                    </h1>
                    <p className="mt-2 text-white/80 font-medium">
                      Luar biasa! Pertahankan prestasimu.
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <span className="text-xs font-black tracking-widest uppercase text-slate-400 mb-3 block">
                      Masukan Guru
                    </span>
                    <p className="italic text-slate-600 leading-relaxed">
                      "
                      {selectedTask.submission.feedback ||
                        "Tidak ada feedback spesifik. Kerja bagus!"}
                      "
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-school-navy uppercase tracking-widest">
                      Teks Jawaban
                    </label>
                    <Textarea
                      placeholder="Ketikkan ringkasan hasil atau jawaban teksmu di sini..."
                      className="min-h-[150px] rounded-2xl border-slate-200 focus:ring-school-gold"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-school-navy uppercase tracking-widest flex items-center gap-2">
                      <GoogleDrive className="w-4 h-4 text-emerald-600" /> Link
                      Tugas (Google Drive / Dropbox)
                    </label>
                    <Input
                      placeholder="https://drive.google.com/..."
                      className="rounded-xl border-slate-200 focus:ring-school-gold"
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      disabled={submitting}
                    />
                    <p className="text-[10px] text-slate-400 italic font-medium px-1">
                      Pastikan link sudah "Public / Anyone with the link can
                      view".
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-school-navy uppercase tracking-widest">
                      Lampiran Tambahan (PDF/JPG)
                    </label>
                    <Input
                      type="file"
                      multiple
                      className="rounded-xl border-dashed border-2 py-6 file:bg-slate-100 file:border-none file:font-bold file:rounded-lg file:text-xs h-auto"
                      onChange={(e) =>
                        e.target.files &&
                        setFilesToUpload(Array.from(e.target.files))
                      }
                      disabled={submitting}
                    />
                  </div>

                  <Button
                    onClick={handleTaskSubmit}
                    disabled={submitting}
                    className="w-full h-16 rounded-2xl bg-school-navy hover:bg-school-gold hover:text-school-navy text-lg font-black tracking-widest shadow-xl shadow-school-navy/20 transition-all uppercase"
                  >
                    {submitting ? (
                      <SystemRestart className="mr-2 animate-spin" />
                    ) : (
                      <Send className="mr-2" />
                    )}
                    {selectedTask?.submission
                      ? "Update Jawaban"
                      : "Kirim Tugas Sekarang"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentLearningPage;
