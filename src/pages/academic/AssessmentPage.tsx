import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
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
  DialogFooter,
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
  Plus,
  Folder,
  Calendar,
  User,
  Eye,
  CheckCircle,
  Clock,
  ArrowRight,
  Book,
  Trash,
  EditPencil,
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
  type: "assignment" | "material" | "exam" | "quiz" | "project";
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
}

interface ClassData {
  _id: string;
  name: string;
  level: number;
}

const AssessmentPage = () => {
  const { user } = useAuth();
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
    type: "assignment" | "material" | "exam" | "quiz" | "project";
  }>({
    title: "",
    description: "",
    subject: "",
    classes: [],
    deadline: "",
    type: "assignment",
  });
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
                      item.type === "exam"
                        ? "bg-purple-600"
                        : item.type === "quiz"
                          ? "bg-orange-500"
                          : item.type === "project"
                            ? "bg-emerald-600"
                            : item.type === "material"
                              ? "bg-slate-500"
                              : "bg-school-navy"
                    } hover:opacity-90`}
                  >
                    {item.type === "exam"
                      ? "Ulangan"
                      : item.type === "quiz"
                        ? "Kuis"
                        : item.type === "project"
                          ? "Proyek"
                          : item.type === "material"
                            ? "Materi"
                            : "Tugas"}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{" "}
                    {item.deadline
                      ? new Date(item.deadline).toLocaleDateString()
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Tugas" : "Buat Tugas Baru"}
            </DialogTitle>
            <DialogDescription>Isi detail tugas akademik.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-bold">Judul</label>
              <Input
                className="col-span-3"
                value={newForm.title}
                onChange={(e) =>
                  setNewForm({ ...newForm, title: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-bold">
                Mata Pelajaran
              </label>
              <Select
                value={newForm.subject}
                onValueChange={(val) =>
                  setNewForm({ ...newForm, subject: val })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Mata Pelajaran" />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-bold">
                Tipe Asesmen
              </label>
              <Select
                value={newForm.type}
                onValueChange={(val: any) =>
                  setNewForm({ ...newForm, type: val })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">Tugas</SelectItem>
                  <SelectItem value="exam">Ulangan</SelectItem>
                  <SelectItem value="quiz">Kuis</SelectItem>
                  <SelectItem value="project">Proyek</SelectItem>
                  <SelectItem value="material">Materi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-sm font-bold mt-2">
                Target Kelas
              </label>
              <div className="col-span-3 border p-4 rounded-md h-40 overflow-y-auto space-y-2 bg-slate-50">
                {availableClasses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Belum ada data kelas.
                  </p>
                ) : (
                  availableClasses.map((cls) => (
                    <div key={cls._id} className="flex items-center space-x-2">
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
                        className="cursor-pointer text-sm font-medium"
                      >
                        {cls.name}{" "}
                        <span className="text-xs text-slate-500">
                          (Kls {cls.level})
                        </span>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-bold">
                Tenggat Waktu
              </label>
              <Input
                type="date"
                className="col-span-3"
                value={newForm.deadline}
                onChange={(e) =>
                  setNewForm({ ...newForm, deadline: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-bold">Deskripsi</label>
              <Textarea
                className="col-span-3"
                value={newForm.description}
                onChange={(e) =>
                  setNewForm({ ...newForm, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-bold">Lampiran</label>
              <Input
                type="file"
                className="col-span-3"
                onChange={(e) =>
                  setSelectedTxFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              className="bg-school-navy text-white"
            >
              {isEditMode ? "Update Tugas" : "Simpan Tugas"}
            </Button>
          </DialogFooter>
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
