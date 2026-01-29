import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  InfoCircle,
  Journal,
  Plus,
  Send,
  Star,
  User,
  Book,
  Printer,
} from "iconoir-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ProjectP5 {
  _id: string;
  title: string;
  theme: string;
  description: string;
  level: number;
  targets: any[];
  facilitators: any[];
  startDate?: string;
  endDate?: string;
}

const StudentP5DetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<ProjectP5 | null>(null);
  const [report, setReport] = useState<any>(null);
  const [logbooks, setLogbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const [logForm, setLogForm] = useState({ title: "", content: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (projectId && user) fetchData();
  }, [projectId, user]);

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
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal simpan jurnal" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReport = () => {
    if (!project || !user) return;

    const doc = new jsPDF();

    // HEADER
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RAPOR PROJEK PENGUATAN PROFIL PELAJAR PANCASILA", 105, 20, {
      align: "center",
    });

    // INFO
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Nama Siswa : ${(user as any).profile?.fullName || user.username}`,
      20,
      40,
    );
    doc.text(`NISN       : ${(user as any).profile?.nisn || "-"}`, 20, 45);
    doc.text(`Kelas      : ${project.level} (Fase D)`, 20, 50);
    doc.text(`Tahun Ajar : 2024/2025`, 20, 55);

    doc.setFont("helvetica", "bold");
    doc.text(`Judul Projek : ${project.title}`, 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`Tema         : ${project.theme}`, 20, 70);

    // Description
    const desc = doc.splitTextToSize(
      `Deskripsi: ${project.theme} - ${project.title}.`,
      170,
    );
    doc.text(desc, 20, 80);

    // TABLE
    const tableData = project.targets.map((t: any) => {
      const scoreItem = report?.scores?.find((s: any) => s.targetId === t._id);
      let scoreText = "-";
      if (scoreItem) {
        const sc = scoreItem.score;
        scoreText =
          sc === "BB"
            ? "Belum Berkembang"
            : sc === "MB"
              ? "Mulai Berkembang"
              : sc === "BSH"
                ? "Berkembang Sesuai Harapan"
                : sc === "SB"
                  ? "Sangat Berkembang"
                  : "-";
      }
      return [t.dimension, t.element, scoreText];
    });

    autoTable(doc, {
      startY: 95,
      head: [["Dimensi", "Elemen", "Capaian Akhir"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [22, 36, 71] },
    });

    // SIGNATURE
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.text("Bandung, ......................", 140, finalY);
    doc.text("Fasilitator Projek,", 140, finalY + 10);
    doc.text("( ................................. )", 140, finalY + 35);

    doc.save(`Rapor_P5_Saya.pdf`);
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
                          <div className="min-w-6 pt-1">
                            <InfoCircle className="text-school-gold" />
                          </div>
                          <div>
                            <span className="font-bold text-school-navy block mb-1">
                              Feedback Fasilitator:
                            </span>
                            <span className="text-slate-700 italic">
                              "{log.feedback}"
                            </span>
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

        {/* Tab: Info */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Projek</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Timeline Info */}
              {project.startDate && project.endDate && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-3 mb-4">
                  <Calendar className="text-blue-600 h-5 w-5" />
                  <div>
                    <h4 className="font-bold text-school-navy text-sm">
                      Durasi Pelaksanaan
                    </h4>
                    <p className="text-slate-700 text-sm">
                      {new Date(project.startDate).toLocaleDateString("id-ID", {
                        dateStyle: "long",
                      })}
                      <span className="mx-2 text-slate-400">s/d</span>
                      {new Date(project.endDate).toLocaleDateString("id-ID", {
                        dateStyle: "long",
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-school-navy mb-2">
                    Target Dimensi
                  </h4>
                  <ul className="space-y-2">
                    {project.targets.map((t: any, i: number) => (
                      <li
                        key={i}
                        className="bg-slate-50 p-3 rounded text-sm border-l-4 border-school-gold"
                      >
                        <span className="font-bold block text-school-navy">
                          {t.dimension}
                        </span>
                        <span className="text-slate-500">{t.element}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-school-navy mb-2">
                    Tim Fasilitator
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.facilitators.map((f: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-sm">
                          {f.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Report */}
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rapor Capaian Projek</CardTitle>
                  <CardDescription>
                    Evaluasi dimensi Profil Pelajar Pancasila.
                  </CardDescription>
                </div>
                <Button
                  onClick={handlePrintReport}
                  className="bg-school-navy text-white hover:bg-school-gold hover:text-school-navy"
                >
                  <Printer className="mr-2 h-4 w-4" /> Cetak PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-bold text-school-navy">
                        Dimensi
                      </th>
                      <th className="text-left p-3 font-bold text-school-navy">
                        Elemen
                      </th>
                      <th className="text-center p-3 font-bold text-school-navy">
                        Capaian Akhir
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.targets.map((t: any) => {
                      const score = report?.scores?.find(
                        (s: any) => s.targetId === t._id,
                      )?.score;
                      return (
                        <tr
                          key={t._id}
                          className="border-b last:border-0 hover:bg-slate-50"
                        >
                          <td className="p-3 text-slate-700 font-medium">
                            {t.dimension}
                          </td>
                          <td className="p-3 text-slate-500">
                            {t.element} - {t.subElement}
                          </td>
                          <td className="p-3 text-center">
                            {score ? (
                              <Badge
                                className={`
                                             ${score === "BB" ? "bg-red-100 text-red-700 hover:bg-red-200" : ""}
                                             ${score === "MB" ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : ""}
                                             ${score === "BSH" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : ""}
                                             ${score === "SB" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : ""}
                                          `}
                              >
                                {score}
                              </Badge>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {report?.finalNotes && (
                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-school-navy mb-1 flex items-center gap-2">
                    <InfoCircle className="w-4 h-4 text-school-gold" /> Catatan
                    Fasilitator
                  </h4>
                  <p className="text-slate-700 italic">{report.finalNotes}</p>
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
