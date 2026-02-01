import { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Download, Send, GoogleDrive } from "iconoir-react";

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

// Helper
const getFileUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path}`;
};

const StudentAssignmentPage = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<
    { assessment: Assessment; submission: Submission | null }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Detail / Submit State
  const [selectedTask, setSelectedTask] = useState<{
    assessment: Assessment;
    submission: Submission | null;
  } | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

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
      console.error(e);
      toast({ variant: "destructive", title: "Gagal memuat data tugas" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTask = (task: any) => {
    setSelectedTask(task);
    setAnswerText(task.submission?.text || "");
    setDriveLink(task.submission?.driveLink || "");
    setFilesToUpload([]);
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      // 1. Upload Files
      const uploadedUrls: string[] = [];
      for (const f of filesToUpload) {
        const fd = new FormData();
        fd.append("file", f);
        const up = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls.push(up.data.url);
      }

      // Combine with existing files if update logic needed in future Currently backend handles file replacement logic

      await api.post(`/assessment/${selectedTask.assessment._id}/submit`, {
        text: answerText,
        driveLink: driveLink,
        files: uploadedUrls,
      });

      toast({ title: "Tugas berhasil dikirim!" });
      setSelectedTask(null);
      setFilesToUpload([]);
      fetchTasks(); // Refresh list
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal kirim tugas" });
    } finally {
      setSubmitting(false);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.submission);
  const completedTasks = tasks.filter((t) => t.submission);

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">Memuat Tugas...</div>
    );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-school-navy text-white p-8 rounded-xl relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-serif font-bold mb-2">
            Tugas & Materi Saya
          </h1>
          <p className="text-blue-100">
            Selesaikan tugas tepat waktu untuk hasil maksimal.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      </div>

      <Tabs defaultValue="todo" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-lg border shadow-sm">
          <TabsTrigger
            value="todo"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white"
          >
            Perlu Dikerjakan{" "}
            <Badge className="ml-2 bg-red-500 hover:bg-red-600">
              {pendingTasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="done"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white"
          >
            Selesai / Dinilai{" "}
            <Badge className="ml-2 bg-green-500 hover:bg-green-600">
              {completedTasks.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="todo"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {pendingTasks.length === 0 ? (
            <div className="col-span-full p-12 text-center border-2 border-dashed rounded-lg text-slate-400">
              Hore! Tidak ada tugas yang harus dikerjakan.
            </div>
          ) : (
            pendingTasks.map((t) => (
              <Card
                key={t.assessment._id}
                className="hover:shadow-lg transition-all border-l-4 border-l-red-500 cursor-pointer"
                onClick={() => handleOpenTask(t)}
              >
                <CardHeader>
                  <div className="flex justify-between">
                    <Badge className="bg-school-navy">
                      {t.assessment.subject}
                    </Badge>
                    {t.assessment.deadline && (
                      <span className="text-xs text-red-500 font-bold flex items-center">
                        <Clock className="w-3 h-3 mr-1" />{" "}
                        {new Date(t.assessment.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-2 line-clamp-1">
                    {t.assessment.title}
                  </CardTitle>
                </CardHeader>
                <CardFooter>
                  <Button
                    size="sm"
                    className="w-full bg-school-navy hover:bg-school-gold hover:text-school-navy"
                  >
                    Kerjakan
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent
          value="done"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {completedTasks.map((t) => (
            <Card
              key={t.assessment._id}
              className={`hover:shadow-lg transition-all border-l-4 cursor-pointer ${t.submission?.status === "graded" ? "border-l-green-500" : "border-l-blue-500"}`}
              onClick={() => handleOpenTask(t)}
            >
              <CardHeader>
                <div className="flex justify-between">
                  <Badge variant="outline">{t.assessment.subject}</Badge>
                  <Badge
                    className={
                      t.submission?.status === "graded"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }
                  >
                    {t.submission?.status === "graded"
                      ? `Nilai: ${t.submission.grade}`
                      : "Menunggu Penilaian"}
                  </Badge>
                </div>
                <CardTitle className="mt-2 line-clamp-1">
                  {t.assessment.title}
                </CardTitle>
              </CardHeader>
              <CardFooter>
                <Button size="sm" variant="outline" className="w-full">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedTask}
        onOpenChange={(o) => !o && setSelectedTask(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-school-navy">
              {selectedTask?.assessment.title}
            </DialogTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">
                {selectedTask?.assessment.subject}
              </Badge>
              <div className="flex items-center text-xs text-slate-500">
                <Calendar className="w-3 h-3 mr-1" /> Deadline:{" "}
                {selectedTask?.assessment.deadline
                  ? new Date(
                      selectedTask.assessment.deadline,
                    ).toLocaleDateString()
                  : "-"}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Deskripsi */}
            <div className="bg-slate-50 p-4 rounded-lg border text-sm text-slate-700 whitespace-pre-wrap">
              {selectedTask?.assessment.description}
            </div>

            {/* Attachments Soal */}
            {selectedTask?.assessment.attachments &&
              selectedTask.assessment.attachments.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Lampiran Soal
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.assessment.attachments.map((url, i) => (
                      <a
                        key={i}
                        href={getFileUrl(url)}
                        target="_blank"
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded border border-blue-100 font-medium hover:underline"
                      >
                        📄 Lampiran {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {/* Submission Area */}
            <div className="border-t pt-4">
              <h3 className="font-bold text-lg mb-4 text-school-navy flex items-center gap-2">
                <Send className="w-5 h-5" /> Jawaban Anda
              </h3>

              {selectedTask?.submission?.status === "graded" ? (
                <div className="space-y-4 bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-green-600 mb-1">
                      {selectedTask.submission.grade}
                    </h1>
                    <p className="text-green-700 font-medium">Nilai Akhir</p>
                  </div>
                  <div className="border-t border-green-200 pt-4">
                    <p className="font-bold text-green-800 mb-1">
                      Feedback Guru:
                    </p>
                    <p className="italic text-green-700">
                      "{selectedTask.submission.feedback}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold block mb-1">
                      Jawaban Teks
                    </label>
                    <Textarea
                      placeholder="Tulis jawabanmu di sini..."
                      className="min-h-[120px]"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold flex items-center gap-2 mb-1">
                      <GoogleDrive className="w-4 h-4 text-green-600" /> Link
                      Tugas (Google Drive / Lainnya)
                    </label>
                    <Input
                      placeholder="https://drive.google.com/..."
                      className="border-blue-200 focus:border-blue-500"
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      disabled={submitting}
                    />
                    <p className="text-[10px] text-slate-400 mt-1 italic">
                      Pastikan link sudah diset "Anyone with the link can view".
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-bold block mb-1">
                      Alternatif: Upload File (Gambar/PDF)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files)
                            setFilesToUpload(Array.from(e.target.files));
                        }}
                        multiple
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-school-navy hover:bg-school-gold hover:text-school-navy h-12 text-lg font-bold shadow-lg"
                  >
                    {submitting
                      ? "Mengirim..."
                      : selectedTask?.submission
                        ? "Update Jawaban"
                        : "Kirim Jawaban"}{" "}
                    <Send className="ml-2 w-5 h-5" />
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

export default StudentAssignmentPage;
