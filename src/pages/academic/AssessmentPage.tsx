import { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Folder,
  EditPencil,
  Trash,
  Plus,
  Book,
  Eye,
  Calendar,
  GoogleDrive,
} from "iconoir-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Assessment {
  _id: string;
  title: string;
  description: string;
  subject: string | { _id: string; name: string };
  classes: string[];
  deadline: string;
  type: "assignment" | "material";
  teacher: { username: string; profile?: { fullName: string } };
  createdAt: string;
  attachments: string[];
}

interface Submission {
  _id: string;
  student: { _id: string; username: string; profile?: { fullName: string } };
  status: "submitted" | "graded" | "late";
  grade?: number;
  feedback?: string;
  submittedAt: string;
  text?: string;
  files?: string[];
  driveLink?: string;
}

interface ClassData {
  _id: string;
  name: string;
  level: number;
}

const AssessmentPage = () => {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState<{
    title: string;
    description: string;
    subject: string;
    classes: string[];
    deadline: string;
    type: "assignment" | "material";
    learningGoals: string[];
    status: "draft" | "published";
    difficulty: "easy" | "medium" | "hard" | "";
    allowRevision: boolean;
  }>({
    title: "",
    description: "",
    subject: "",
    classes: [],
    deadline: "",
    type: "assignment",
    learningGoals: [],
    status: "published",
    difficulty: "",
    allowRevision: false,
  });
  const [availableTPs, setAvailableTPs] = useState<any[]>([]);
  const [selectedTxFile, setSelectedTxFile] = useState<File | null>(null);

  // Grading State
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gradingId, setGradingId] = useState<string | null>(null); // Submission ID being graded
  const [gradeInput, setGradeInput] = useState<{
    grade: number;
    feedback: string;
  }>({ grade: 0, feedback: "" });

  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchAssessments();
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (newForm.subject && newForm.classes.length > 0) {
      fetchAvailableTPs();
    } else {
      setAvailableTPs([]);
    }
  }, [newForm.subject, newForm.classes]);

  const fetchAvailableTPs = async () => {
    try {
      // Find level from first selected class
      const firstClass = availableClasses.find((c) =>
        newForm.classes.includes(c.name),
      );
      if (!firstClass) return;

      const res = await api.get("/academic/tp", {
        params: {
          subjectId: newForm.subject,
          level: firstClass.level,
        },
      });
      setAvailableTPs(res.data);
    } catch (e) {
      console.error("Gagal load TP");
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/academic/subjects");
      setSubjects(res.data);
    } catch (error) {
      console.error("Gagal load mapel");
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get("/academic/class");
      setAvailableClasses(res.data);
    } catch (e) {
      console.error("Failed to load classes");
    }
  };

  const fetchAssessments = async () => {
    try {
      const res = await api.get("/assessment");
      setAssessments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setNewForm({
      title: "",
      description: "",
      subject: "",
      classes: [],
      deadline: "",
      type: "assignment",
      learningGoals: [],
      status: "published",
      difficulty: "",
      allowRevision: false,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: Assessment) => {
    setIsEditMode(true);
    setEditingId(item._id);
    setNewForm({
      title: item.title,
      description: item.description,
      subject:
        typeof item.subject === "object" ? item.subject._id : item.subject,
      classes: item.classes,
      deadline: item.deadline ? item.deadline.split("T")[0] : "",
      type: item.type as any,
      learningGoals:
        (item as any).learningGoals?.map((tg: any) =>
          typeof tg === "object" ? tg._id : tg,
        ) || [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!newForm.title || !newForm.subject) {
      toast({ variant: "destructive", title: "Judul dan Mapel wajib diisi" });
      return;
    }
    if (newForm.classes.length === 0) {
      toast({
        variant: "destructive",
        title: "Pilih minimal satu kelas target",
      });
      return;
    }

    try {
      let attachments: string[] = [];
      if (selectedTxFile) {
        const fd = new FormData();
        fd.append("file", selectedTxFile);
        const up = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        attachments.push(up.data.url);
      }

      const payload = {
        ...newForm,
        // classes is already an array in newForm
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      if (isEditMode && editingId) {
        // Update
        await api.put(`/assessment/${editingId}`, payload);
        toast({ title: "Tugas berhasil diupdate" });
      } else {
        // Create
        await api.post("/assessment", payload);
        toast({ title: "Tugas berhasil dibuat" });
      }

      setIsDialogOpen(false);
      setNewForm({
        title: "",
        description: "",
        subject: "",
        classes: [],
        deadline: "",
        type: "assignment",
        learningGoals: [],
        status: "published",
        difficulty: "",
        allowRevision: false,
      });
      setSelectedTxFile(null);
      fetchAssessments();
    } catch (e) {
      toast({
        variant: "destructive",
        title: isEditMode ? "Gagal update tugas" : "Gagal buat tugas",
      });
    }
  };

  const handleOpenGrading = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    try {
      const res = await api.get(`/assessment/${assessment._id}/submissions`);
      setSubmissions(res.data);
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal load pengumpulan" });
    }
  };

  const handleGrade = async (submissionId: string) => {
    try {
      await api.put(`/assessment/submission/${submissionId}`, {
        grade: gradeInput.grade,
        feedback: gradeInput.feedback,
      });
      toast({ title: "Nilai disimpan" });
      setGradingId(null);
      // Refresh submissions
      const res = await api.get(
        `/assessment/${selectedAssessment?._id}/submissions`,
      );
      setSubmissions(res.data);
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal simpan nilai" });
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Yakin ingin menghapus tugas ini? Data pengumpulan siswa juga akan terhapus.",
      )
    )
      return;
    try {
      await api.delete(`/assessment/${id}`);
      toast({ title: "Tugas dihapus" });
      fetchAssessments();
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal hapus tugas" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-school-navy">
            Manajemen Tugas
          </h2>
          <p className="text-slate-500">
            Kelola tugas kelas, tenggat waktu, dan penilaian.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-school-navy hover:bg-school-gold hover:text-school-navy"
        >
          <Plus className="mr-2 h-4 w-4" /> Buat Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : assessments.length === 0 ? (
          <div className="col-span-full p-12 text-center border-2 border-dashed rounded-lg text-slate-400">
            Belum ada tugas dibuat.
          </div>
        ) : (
          assessments.map((item) => (
            <Card
              key={item._id}
              className="hover:shadow-lg transition-all border-l-4 border-l-school-navy"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge
                    className={`${
                      item.type === "assignment"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    } border-none font-bold`}
                  >
                    {item.type === "assignment" ? "Penugasan" : "Materi"}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{" "}
                    {item.deadline
                      ? new Date(item.deadline).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "No deadline"}
                  </span>
                </div>
                <CardTitle className="mt-2 line-clamp-1" title={item.title}>
                  {item.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Book className="w-4 h-4" />{" "}
                    {typeof item.subject === "object"
                      ? item.subject.name
                      : item.subject}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Folder className="w-4 h-4" /> Kelas:{" "}
                    {item.classes.join(", ")}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleOpenGrading(item)}
                >
                  <Eye className="mr-2 h-4 w-4" /> Nilai
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => handleOpenEdit(item)}
                >
                  <EditPencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                  onClick={() => handleDelete(item._id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-school-navy p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                <Book className="w-6 h-6 text-school-gold" />
                {isEditMode ? "Modifikasi Tugas" : "Buat Penugasan Baru"}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Kelola detail instruksi, target kelas, dan tujuan pembelajaran.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Kolom Kiri: Informasi Utama */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-school-navy flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-school-gold" />
                    Judul Penugasan
                  </Label>
                  <Input
                    placeholder="Contoh: Ulangan Harian Bab 1"
                    className="border-slate-200 focus:border-school-gold focus:ring-school-gold transition-all"
                    value={newForm.title}
                    onChange={(e) =>
                      setNewForm({ ...newForm, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-school-navy">
                      Mata Pelajaran
                    </Label>
                    <Select
                      value={newForm.subject}
                      onValueChange={(val) =>
                        setNewForm({ ...newForm, subject: val })
                      }
                    >
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Pilih Mapel" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-school-navy">
                      Tipe Asesmen
                    </Label>
                    <Select
                      value={newForm.type}
                      onValueChange={(val: any) =>
                        setNewForm({ ...newForm, type: val })
                      }
                    >
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assignment">Penugasan</SelectItem>
                        <SelectItem value="material">Materi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-school-navy">
                    Deskripsi & Instruksi
                  </Label>
                  <Textarea
                    placeholder="Tuliskan petunjuk pengerjaan tugas di sini..."
                    className="min-h-[120px] border-slate-200 resize-none focus:border-school-gold transition-all"
                    value={newForm.description}
                    onChange={(e) =>
                      setNewForm({ ...newForm, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-school-navy">
                      Tenggat Waktu
                    </Label>
                    <Input
                      type="datetime-local"
                      className="border-slate-200"
                      value={newForm.deadline}
                      onChange={(e) =>
                        setNewForm({ ...newForm, deadline: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-school-navy">
                      Lampiran File
                    </Label>
                    <Input
                      type="file"
                      className="border-slate-200 file:bg-slate-100 file:border-0 file:text-xs file:font-bold h-10"
                      onChange={(e) =>
                        setSelectedTxFile(
                          e.target.files ? e.target.files[0] : null,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Target & Kompetensi */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-school-navy flex items-center justify-between">
                    Target Kelas
                    <Badge
                      variant="outline"
                      className="text-[10px] font-normal"
                    >
                      {newForm.classes.length} Terpilih
                    </Badge>
                  </Label>
                  <div className="border border-slate-100 p-3 rounded-lg h-32 overflow-y-auto space-y-1.5 bg-slate-50/50">
                    {availableClasses.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-2 text-center">
                        Data kelas kosong
                      </p>
                    ) : (
                      availableClasses.map((cls) => (
                        <div
                          key={cls._id}
                          className="flex items-center space-x-2 bg-white p-1.5 rounded border border-slate-50 hover:border-school-gold/30 transition-colors"
                        >
                          <Checkbox
                            id={`cls-${cls._id}`}
                            checked={newForm.classes.includes(cls.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewForm((prev) => ({
                                  ...prev,
                                  classes: [...prev.classes, cls.name],
                                }));
                              } else {
                                setNewForm((prev) => ({
                                  ...prev,
                                  classes: prev.classes.filter(
                                    (c) => c !== cls.name,
                                  ),
                                }));
                              }
                            }}
                          />
                          <Label
                            htmlFor={`cls-${cls._id}`}
                            className="cursor-pointer text-xs font-medium flex-1"
                          >
                            {cls.name}{" "}
                            <span className="text-[10px] text-slate-400 font-normal ml-1">
                              (Level {cls.level})
                            </span>
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-school-navy flex items-center justify-between">
                    Tujuan Pembelajaran (TP)
                    <Badge
                      variant="outline"
                      className="text-[10px] font-normal"
                    >
                      {newForm.learningGoals.length} Terpilih
                    </Badge>
                  </Label>
                  <div className="border border-slate-100 p-3 rounded-lg h-[260px] overflow-y-auto space-y-2 bg-slate-50/50">
                    {availableTPs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <p className="text-xs text-slate-400 italic">
                          {!newForm.subject || newForm.classes.length === 0
                            ? "Pilih Mapel & Kelas dulu untuk memunculkan daftar TP."
                            : "Belum ada TP untuk Mapel & Level ini."}
                        </p>
                      </div>
                    ) : (
                      availableTPs.map((tp) => (
                        <div
                          key={tp._id}
                          className="flex items-start space-x-2 bg-white p-2.5 rounded border border-slate-50 hover:border-school-gold/30 transition-colors"
                        >
                          <Checkbox
                            id={`tp-${tp._id}`}
                            className="mt-1"
                            checked={newForm.learningGoals.includes(tp._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewForm((prev) => ({
                                  ...prev,
                                  learningGoals: [
                                    ...prev.learningGoals,
                                    tp._id,
                                  ],
                                }));
                              } else {
                                setNewForm((prev) => ({
                                  ...prev,
                                  learningGoals: prev.learningGoals.filter(
                                    (id) => id !== tp._id,
                                  ),
                                }));
                              }
                            }}
                          />
                          <Label
                            htmlFor={`tp-${tp._id}`}
                            className="cursor-pointer text-xs font-medium leading-relaxed flex-1"
                          >
                            <span className="font-bold text-school-navy block mb-0.5 text-[10px]">
                              {tp.code}
                            </span>
                            {tp.description}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 border-t flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Checkbox
                id="allowRevision"
                checked={newForm.allowRevision}
                onCheckedChange={(checked) =>
                  setNewForm({ ...newForm, allowRevision: !!checked })
                }
              />
              <Label
                htmlFor="allowRevision"
                className="text-xs text-slate-600 cursor-pointer"
              >
                Izinkan Revisi
              </Label>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-300"
              >
                Batal
              </Button>
              {!isEditMode && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewForm({ ...newForm, status: "draft" });
                    setTimeout(() => handleSubmit(), 0);
                  }}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Simpan Draf
                </Button>
              )}
              <Button
                onClick={() => {
                  setNewForm({ ...newForm, status: "published" });
                  setTimeout(() => handleSubmit(), 0);
                }}
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy text-white px-8 font-bold shadow-lg"
              >
                {isEditMode ? "Simpan Perubahan" : "Publikasikan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grading Dialog */}
      <Dialog
        open={!!selectedAssessment}
        onOpenChange={(o) => !o && setSelectedAssessment(null)}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grading: {selectedAssessment?.title}</DialogTitle>
            <DialogDescription>Daftar pengumpulan siswa.</DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Jawaban</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center italic text-slate-500"
                  >
                    Belum ada pengumpulan.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell className="font-bold">
                      {sub.student.profile?.fullName || sub.student.username}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === "late"
                            ? "destructive"
                            : sub.status === "graded"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {sub.status === "late"
                          ? "Terlambat"
                          : sub.status === "graded"
                            ? "Dinilai"
                            : "Diserahkan"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {sub.driveLink && (
                        <a
                          href={sub.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-green-50 text-green-700 px-2 py-1.5 rounded border border-green-200 font-bold flex items-center gap-1.5 hover:bg-green-100 transition-colors mb-2"
                        >
                          <GoogleDrive className="w-3.5 h-3.5" /> Buka Link
                          Tugas
                        </a>
                      )}
                      {sub.text && (
                        <p className="text-xs italic bg-slate-50 p-1 mb-1 border truncated max-w-[200px]">
                          {sub.text}
                        </p>
                      )}
                      {sub.files?.map((f, i) => (
                        <a
                          key={i}
                          href={`http://localhost:5000${f}`}
                          target="_blank"
                          className="text-xs text-blue-600 underline block"
                        >
                          File {i + 1}
                        </a>
                      ))}
                    </TableCell>
                    <TableCell>
                      {gradingId === sub._id ? (
                        <Input
                          type="number"
                          value={gradeInput.grade}
                          onChange={(e) =>
                            setGradeInput({
                              ...gradeInput,
                              grade: Number(e.target.value),
                            })
                          }
                          className="w-16 h-8"
                        />
                      ) : (
                        <span className="font-bold text-lg">
                          {sub.grade ?? "-"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {gradingId === sub._id ? (
                        <Input
                          placeholder="Masukkan feedback..."
                          value={gradeInput.feedback}
                          onChange={(e) =>
                            setGradeInput({
                              ...gradeInput,
                              feedback: e.target.value,
                            })
                          }
                          className="w-full min-w-[150px] h-8 text-xs"
                        />
                      ) : (
                        <span className="text-xs text-slate-500 italic max-w-[200px] block truncate">
                          {sub.feedback || "Tidak ada feedback"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {gradingId === sub._id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleGrade(sub._id)}
                            className="h-8 bg-green-600 hover:bg-green-700 block"
                          >
                            Simpan
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setGradingId(null)}
                            className="h-8 text-red-500"
                          >
                            Batal
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setGradingId(sub._id);
                            setGradeInput({
                              grade: sub.grade || 0,
                              feedback: sub.feedback || "",
                            });
                          }}
                        >
                          Nilai
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssessmentPage;
