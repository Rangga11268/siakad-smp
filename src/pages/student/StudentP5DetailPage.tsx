import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Journal,
  InfoCircle,
  Star,
  Plus,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Send,
} from "iconoir-react";
import api from "@/services/api";

const StudentP5DetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [logbooks, setLogbooks] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const [logForm, setLogForm] = useState({ title: "", content: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (projectId && user) fetchData();
  }, [projectId, user]);

  // Helper url
  const getFileUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  const fetchData = async () => {
    if (!user) return;
    try {
      const studentId = (user as any).id || (user as any)._id;

      const [repRes, logRes] = await Promise.all([
        api.get(`/p5/report/${projectId}/${studentId}`),
        api.get(`/p5/logbook/${projectId}`),
      ]);

      setProject(repRes.data.project);
      setReport(repRes.data.assessment);
      setLogbooks(logRes.data);
    } catch (error) {
      console.error("Gagal load detail P5", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data projek",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLogbook = async () => {
    if (!logForm.title || !logForm.content) {
      toast({ variant: "destructive", title: "Mohon lengkapi jurnal" });
      return;
    }
    setSubmitting(true);
    try {
      let media: string[] = [];
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        media.push(uploadRes.data.url);
      }

      await api.post("/p5/logbook", {
        project: projectId,
        title: logForm.title,
        content: logForm.content,
        media,
      });
      toast({
        title: "Jurnal Tersimpan",
        description: "Refleksi Anda berhasil dicatat.",
      });
      setIsLogbookOpen(false);
      setLogForm({ title: "", content: "" });
      setSelectedFile(null);
      fetchData(); // Reload logs
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal simpan jurnal" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Memuat Digital Logbook...
      </div>
    );
  if (!project)
    return (
      <div className="p-8 text-center text-red-500">Projek tidak ditemukan</div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header / Hero */}
      <div className="bg-school-navy text-white rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-school-gold/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <Button
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 mb-4 pl-0"
          onClick={() => navigate("/dashboard/student/p5")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Galeri Projek
        </Button>
        <div className="relative z-10">
          <Badge className="bg-school-gold text-school-navy hover:bg-yellow-400 mb-2 font-bold px-3 py-1">
            {project.theme}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            {project.title}
          </h1>
          <p className="text-white/80 max-w-2xl text-lg leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>

      <Tabs defaultValue="logbook" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-lg border shadow-sm">
          <TabsTrigger
            value="logbook"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white gap-2"
          >
            <Journal className="w-4 h-4" /> Jurnal Perjalanan
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white gap-2"
          >
            <InfoCircle className="w-4 h-4" /> Info & Fasilitator
          </TabsTrigger>
          <TabsTrigger
            value="report"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white gap-2"
          >
            <Star className="w-4 h-4" /> Rapor & Evaluasi
          </TabsTrigger>
        </TabsList>

        {/* Tab: Logbook (Jurnal) */}
        <TabsContent value="logbook" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-school-navy">
              Timeline Proses
            </h3>
            <Dialog open={isLogbookOpen} onOpenChange={setIsLogbookOpen}>
              <DialogTrigger asChild>
                <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-lg">
                  <Plus className="mr-2 h-4 w-4" /> Tulis Refleksi Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-school-navy">
                    Jurnal Refleksi
                  </DialogTitle>
                  <DialogDescription>
                    Catat progres, tantangan, dan pembelajaranmu minggu ini.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="font-semibold text-sm">
                      Judul / Fase
                    </label>
                    <Input
                      placeholder="Contoh: Minggu 1 - Observasi Lingkungan"
                      value={logForm.title}
                      onChange={(e) =>
                        setLogForm({ ...logForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-sm">
                      Refleksi & Catatan
                    </label>
                    <Textarea
                      placeholder="Ceritakan prosesmu, apa yang sulit, dan apa solusinya..."
                      className="h-32 resize-none"
                      value={logForm.content}
                      onChange={(e) =>
                        setLogForm({ ...logForm, content: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-sm">
                      Lampiran (Foto/Dokumen)
                    </label>
                    <Input
                      type="file"
                      onChange={(e) =>
                        setSelectedFile(
                          e.target.files ? e.target.files[0] : null,
                        )
                      }
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <p className="text-xs text-slate-400">
                      Supported: JPG, PNG, PDF, DOCX (Max 10MB)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateLogbook}
                    disabled={submitting}
                    className="bg-school-navy text-white w-full"
                  >
                    {submitting ? "Menyimpan..." : "Simpan ke Timeline"}{" "}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Timeline UI */}
          <div className="relative pl-8 border-l-2 border-slate-200 space-y-8">
            {logbooks.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-lg text-center text-slate-500 italic border border-slate-100">
                Belum ada catatan jurnal. Mulai tulis perjalananmu sekarang!
              </div>
            ) : (
              logbooks.map((log) => (
                <div key={log._id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[41px] top-4 w-6 h-6 rounded-full bg-white border-4 border-school-gold shadow-md group-hover:scale-110 transition-transform"></div>

                  <Card className="hover:shadow-lg transition-all border-l-4 border-l-school-navy">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg text-school-navy">
                            {log.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            {new Date(log.createdAt).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </div>
                        </div>
                        {log.feedback && (
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-600 bg-green-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Dinilai
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {log.content}
                      </p>

                      {log.media && log.media.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {log.media.map((m: any, idx: number) => (
                            <a
                              key={idx}
                              href={getFileUrl(m)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-slate-100 px-3 py-2 rounded text-blue-600 hover:underline flex items-center gap-1 border"
                            >
                              📄 Lihat Lampiran
                            </a>
                          ))}
                        </div>
                      )}

                      {log.feedback && (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex gap-3 text-sm">
                          <User className="w-5 h-5 text-school-gold shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-school-navy block mb-1">
                              Komentar Fasilitator:
                            </span>
                            <p className="text-slate-700 italic">
                              "{log.feedback}"
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab: Info - Corrected Targets Render */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-slate-500">Tema</p>
                  <p className="font-medium">{project.theme}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500">Fase / Kelas</p>
                  <p className="font-medium">Fase D (SMP) / {project.level}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500">Periode</p>
                  <p className="font-medium">
                    {new Date(project.startDate).toLocaleDateString()} -{" "}
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="font-semibold text-slate-500 mb-2">
                  Dimensi Profil Pelajar Pancasila
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Fix: Render unique dimensions from targets object array */}
                  {Array.from(
                    new Set(project.targets?.map((t: any) => t.dimension)),
                  ).map((d: any) => (
                    <Badge
                      key={d}
                      className="bg-slate-100 text-school-navy hover:bg-slate-200 border-none"
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="font-semibold text-slate-500 mb-2">
                  Tim Fasilitator
                </p>
                <div className="flex flex-wrap gap-4">
                  {project.facilitators?.map((f: any) => (
                    <div
                      key={f._id}
                      className="flex items-center gap-2 bg-slate-50 p-2 rounded border"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">
                        {f.profile?.fullName || f.username}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Reporting */}
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Rapor & Evaluasi Akhir</CardTitle>
              <CardDescription>
                Hasil penilaian sumatif dari projek ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!report || report.scores.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded">
                  <Star className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p>Belum ada penilaian akhir.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                    <h4 className="font-bold text-green-800 mb-1">
                      Catatan Proses
                    </h4>
                    <p className="text-green-900">{report.finalNotes || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-school-navy">
                      Capaian Dimensi
                    </h4>
                    <div className="grid gap-2">
                      {report.scores.map((s: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 border rounded hover:bg-slate-50"
                        >
                          <span className="font-medium">
                            {s.dimension || `Dimensi ${idx + 1}`}
                          </span>
                          <Badge
                            className={
                              s.score === "SB"
                                ? "bg-school-gold text-school-navy"
                                : s.score === "BSH"
                                  ? "bg-green-600"
                                  : "bg-slate-400"
                            }
                          >
                            {s.score}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentP5DetailPage;
