import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Save,
  Loader2,
  Plus,
  FileText,
  CheckSquare,
  Target,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface ClassData {
  _id: string;
  name: string;
}

interface SubjectData {
  _id: string;
  name: string;
}

interface Assessment {
  _id: string;
  title: string;
  type: string;
  learningGoals?: { code: string; description: string }[];
}

interface LearningGoal {
  _id: string;
  code: string;
  description: string;
}

interface Student {
  _id: string;
  profile: {
    fullName: string;
    nisn: string;
  };
}

const InputGradePage = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, number>>({});

  // Data for New Assessment
  const [availableTPs, setAvailableTPs] = useState<LearningGoal[]>([]);
  const [newAssessmentOpen, setNewAssessmentOpen] = useState(false);
  const [newAssessmentForm, setNewAssessmentForm] = useState({
    title: "",
    type: "formative",
    selectedTPs: [] as string[],
  });

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, subjectRes] = await Promise.all([
          api.get("/academic/class"),
          api.get("/academic/subject"),
        ]);
        setClasses(classRes.data);
        setSubjects(subjectRes.data);
      } catch (error) {
        console.error("Gagal load filter", error);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchData();
  }, []);

  // Fetch Assessments & TPs
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchTPs();
      // In a real app we should also fetch existing assessments for this combo
      // Since the API is limited, we might not have a direct filter yet,
      // but assuming we added it or fetching all. For now let's just create new ones or assume some exist.
      // We'll reset assessments to empty to force creation or fetch real ones if endpoint existed
      setAssessments([]);
    }
  }, [selectedClass, selectedSubject]);

  const fetchTPs = async () => {
    try {
      const res = await api.get(
        `/academic/tp?subjectId=${selectedSubject}&level=7`, // Hardcoded level 7 for demo, effectively dynamic based on class
      );
      setAvailableTPs(res.data);
    } catch (error) {
      console.error("Failed load TP", error);
    }
  };

  const handleCreateAssessment = async () => {
    setSubmitting(true);
    try {
      const res = await api.post("/academic/assessment", {
        title: newAssessmentForm.title,
        type: newAssessmentForm.type,
        subject: selectedSubject,
        class: selectedClass,
        teacher: "676bd6ef259300302c09ef7c", // Use dynamic user ID in real implementation
        academicYear: "676bd6ef259300302c09ef7a", // Use dynamic year ID
        semester: "Ganjil",
        learningGoals: newAssessmentForm.selectedTPs,
      });

      setAssessments([...assessments, res.data]);
      setSelectedAssessment(res.data._id);
      setNewAssessmentOpen(false);
      toast({ title: "Berhasil", description: "Asesmen baru dibuat." });
      loadStudents();
    } catch (error) {
      console.error(error); // debug
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal membuat asesmen.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loadStudents = async () => {
    setLoadingGrades(true);
    try {
      const allStudents = await api.get("/academic/students");
      const clsName = classes.find((c) => c._id === selectedClass)?.name;
      const filtered = allStudents.data.filter(
        (s: any) => s.profile?.class === clsName,
      );
      setStudents(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleSaveGrades = async () => {
    setSubmitting(true);
    try {
      const payload = students.map((s) => ({
        studentId: s._id,
        score: grades[s._id] || 0,
        feedback: "",
      }));

      await api.post("/academic/grades", {
        assessmentId: selectedAssessment,
        grades: payload,
      });
      toast({ title: "Tersimpan", description: "Nilai berhasil disimpan." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal simpan nilai.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTP = (tpId: string) => {
    setNewAssessmentForm((prev) => {
      const exists = prev.selectedTPs.includes(tpId);
      if (exists)
        return {
          ...prev,
          selectedTPs: prev.selectedTPs.filter((id) => id !== tpId),
        };
      return { ...prev, selectedTPs: [...prev.selectedTPs, tpId] };
    });
  };

  if (loadingOptions) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-school-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
          Input Nilai Akademik
        </h2>
        <p className="text-slate-500">
          Kelola nilai formatif dan sumatif berdasarkan Tujuan Pembelajaran
          (TP).
        </p>
      </div>

      <Card className="border-none shadow-md bg-slate-50">
        <CardHeader>
          <CardTitle className="font-serif text-xl text-school-navy">
            Konfigurasi Penilaian
          </CardTitle>
          <CardDescription>
            Pilih kelas dan mata pelajaran untuk memulai input nilai.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-4 items-end">
          <div className="space-y-2">
            <Label className="font-semibold text-school-navy">Kelas</Label>
            <Select onValueChange={setSelectedClass}>
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-school-navy">
              Mata Pelajaran
            </Label>
            <Select onValueChange={setSelectedSubject}>
              <SelectTrigger className="bg-white border-slate-300">
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
            <Label className="font-semibold text-school-navy">
              Pilih Asesmen
            </Label>
            <Select
              onValueChange={(v) => {
                setSelectedAssessment(v);
                loadStudents();
              }}
              disabled={
                !selectedClass || !selectedSubject || assessments.length === 0
              }
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue
                  placeholder={
                    assessments.length === 0
                      ? "Belum ada asesmen..."
                      : "Pilih Asesmen"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((a) => (
                  <SelectItem key={a._id} value={a._id}>
                    {a.title} ({a.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={newAssessmentOpen} onOpenChange={setNewAssessmentOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all"
                disabled={!selectedClass || !selectedSubject}
              >
                <Plus className="mr-2 h-4 w-4" /> Buat Asesmen Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-school-navy">
                  Buat Asesmen Baru
                </DialogTitle>
                <DialogDescription>
                  Tentukan judul, jenis, dan lingkup materi (TP) yang dinilai.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="bg-blue-50 p-3 rounded border border-blue-100 text-sm text-blue-800">
                  <p>
                    Mapel:{" "}
                    <strong>
                      {subjects.find((s) => s._id === selectedSubject)?.name}
                    </strong>
                  </p>
                  <p>
                    Kelas:{" "}
                    <strong>
                      {classes.find((c) => c._id === selectedClass)?.name}
                    </strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Judul Asesmen
                    </Label>
                    <Input
                      placeholder="Contoh: UH Bab 1 - Aljabar"
                      value={newAssessmentForm.title}
                      onChange={(e) =>
                        setNewAssessmentForm({
                          ...newAssessmentForm,
                          title: e.target.value,
                        })
                      }
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Jenis Penilaian
                    </Label>
                    <Select
                      value={newAssessmentForm.type}
                      onValueChange={(v) =>
                        setNewAssessmentForm({ ...newAssessmentForm, type: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formative">
                          Formatif (Proses)
                        </SelectItem>
                        <SelectItem value="summative">
                          Sumatif (Akhir)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Lingkup Tujuan Pembelajaran (TP)
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Pilih TP yang menjadi dasar penilaian ini untuk analisis
                    rapor.
                  </p>
                  <div className="border rounded-md p-3 h-[200px] overflow-y-auto space-y-2 bg-white">
                    {availableTPs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Target className="w-8 h-8 mb-2 opacity-50" />
                        <p>Belum ada data TP untuk mapel ini.</p>
                      </div>
                    ) : (
                      availableTPs.map((tp) => (
                        <div
                          key={tp._id}
                          className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded transition-colors"
                        >
                          <Checkbox
                            id={tp._id}
                            checked={newAssessmentForm.selectedTPs.includes(
                              tp._id,
                            )}
                            onCheckedChange={() => toggleTP(tp._id)}
                            className="mt-1 data-[state=checked]:bg-school-navy data-[state=checked]:border-school-navy"
                          />
                          <label
                            htmlFor={tp._id}
                            className="text-sm leading-snug cursor-pointer select-none"
                          >
                            <span className="font-bold text-school-navy block mb-0.5">
                              {tp.code}
                            </span>
                            <span className="text-slate-600">
                              {tp.description}
                            </span>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateAssessment}
                  disabled={submitting}
                  className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full font-bold"
                >
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan & Lanjut Input Nilai
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {selectedAssessment && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t-4 border-t-school-gold shadow-lg border-none">
          <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
                <FileText className="w-5 h-5 text-school-gold" /> Input Nilai
                Siswa
              </CardTitle>
              <CardDescription>
                Masukkan nilai skala 0-100. Nilai akan otomatis tersimpan saat
                Anda menekan tombol Simpan.
              </CardDescription>
            </div>
            <Button
              onClick={handleSaveGrades}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-sm"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}{" "}
              Simpan Semua Nilai
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-school-navy sticky top-0 z-10">
                  <TableRow className="hover:bg-school-navy">
                    <TableHead className="text-white font-bold w-[60px] text-center">
                      No
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Nama Siswa
                    </TableHead>
                    <TableHead className="text-white font-bold w-[150px]">
                      NISN
                    </TableHead>
                    <TableHead className="text-white font-bold w-[200px] text-center">
                      Nilai (0-100)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingGrades ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-32">
                        <div className="flex flex-col items-center justify-center text-school-gold">
                          <Loader2 className="h-6 w-6 animate-spin mb-2" />
                          <p className="text-sm text-slate-500">
                            Memuat daftar siswa...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : students.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center h-32 text-slate-500"
                      >
                        Tidak ada siswa di kelas ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student, index) => (
                      <TableRow
                        key={student._id}
                        className="hover:bg-slate-50 border-b border-slate-100"
                      >
                        <TableCell className="text-center text-slate-500 font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-school-navy text-base">
                          {student.profile?.fullName}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {student.profile?.nisn}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              className="text-center font-bold text-lg w-24 border-slate-300 focus:border-school-gold focus:ring-school-gold bg-white"
                              placeholder="0"
                              value={grades[student._id] ?? ""}
                              onChange={(e) =>
                                setGrades({
                                  ...grades,
                                  [student._id]: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InputGradePage;
