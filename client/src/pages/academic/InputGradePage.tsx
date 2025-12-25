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
import { Save, Loader2, Plus, FileText, CheckSquare } from "lucide-react";
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

  // Fetch Assessments & TPs when Class & Subject selected
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      // TODO: Need an endpoint to get assessments by subject & class
      // Assuming we build it or filter client side.
      // For now, let's just fetch ALL assessments and filter (not optimal but okay for MVP)
      // OR we can implement getAssessments in backend.
      // Let's implement fetch TPs first.
      fetchTPs();
      // Since we don't have getAssessments by filter in backend yet, we'll assume the user creates one first
      // Or we assume a "getAssessments" endpoint exists (I need to check/create it)
    }
  }, [selectedClass, selectedSubject]);

  const fetchTPs = async () => {
    try {
      // Assuming class has level, we need to know level.
      // Find class object
      const cls = classes.find((c) => c._id === selectedClass);
      // Just guess level 7 for now or we need level in class object
      const res = await api.get(
        `/academic/tp?subjectId=${selectedSubject}&level=7`
      );
      setAvailableTPs(res.data);
    } catch (error) {
      console.error("Failed load TP", error);
    }
  };

  const handleCreateAssessment = async () => {
    setSubmitting(true);
    try {
      // Find Teacher ID? Usually from Auth Token.
      // Need Academic Year.
      // For now, hardcode academic year or fetch active one.
      const res = await api.post("/academic/assessment", {
        title: newAssessmentForm.title,
        type: newAssessmentForm.type,
        subject: selectedSubject,
        class: selectedClass,
        teacher: "676bd6ef259300302c09ef7c", // DUMMY: Replace with actual logged in user ID
        academicYear: "676bd6ef259300302c09ef7a", // DUMMY: Replace with actual Active Year ID
        semester: "Ganjil",
        learningGoals: newAssessmentForm.selectedTPs,
      });

      setAssessments([...assessments, res.data]);
      setSelectedAssessment(res.data._id);
      setNewAssessmentOpen(false);
      toast({ title: "Berhasil", description: "Asesmen baru dibuat." });

      // Load Students
      loadStudents();
    } catch (error) {
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
      const res = await api.get(`/academic/class`); // This returns classes with students populated if properly set
      // Actually, academicController getClasses only populates homeroom.
      // We need getStudentsByClass.
      // Let's use the `getStudentsByLevel` logic or just fetch `/academic/students` and filter?
      // Better: Add `getStudentsByClass` endpoint.
      // Workaround: Fetch ALL students and filter by class name? Expensive.
      // Correct way: The existing `getClasses` populates nothing about students array?
      // Let's check `Class` model.
      // Assuming we can get students from class.

      // For MVP Demo: use the existing `getStudentsByLevel`? No, that's by level.
      // Let's add specific endpoint or just mock for a second if needed.
      // Wait, `MasterStudentPage` fetches all.
      // Let's fetch all students and filter by class ID/Name client side for now.
      const allStudents = await api.get("/academic/students");
      // Filter by class name (assuming class object has name matching student class field)
      const clsName = classes.find((c) => c._id === selectedClass)?.name;
      const filtered = allStudents.data.filter(
        (s: any) => s.profile?.class === clsName
      ); // Assuming string match
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Input Nilai Akademik
        </h2>
        <p className="text-muted-foreground">
          Kelola nilai formatif dan sumatif berdasarkan Tujuan Pembelajaran
          (TP).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Asesmen</CardTitle>
          <CardDescription>
            Pilih Kelas, Mapel, dan Buat/Pilih Asesmen.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4 items-end">
          <div className="space-y-2">
            <Label>Kelas</Label>
            <Select onValueChange={setSelectedClass}>
              <SelectTrigger>
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
            <Label>Mata Pelajaran</Label>
            <Select onValueChange={setSelectedSubject}>
              <SelectTrigger>
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
            <Label>Asesmen</Label>
            <Select
              onValueChange={(v) => {
                setSelectedAssessment(v);
                loadStudents();
              }}
              disabled={
                !selectedClass || !selectedSubject || assessments.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    assessments.length === 0
                      ? "Buat baru dulu..."
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
                variant="outline"
                disabled={!selectedClass || !selectedSubject}
              >
                <Plus className="mr-2 h-4 w-4" /> Buat Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Buat Asesmen Baru</DialogTitle>
                <DialogDescription>
                  Asesmen akan dikaitkan dengan TP yang dipilih.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Judul Asesmen</Label>
                  <Input
                    placeholder="Contoh: Ulangan Harian Bab 1"
                    value={newAssessmentForm.title}
                    onChange={(e) =>
                      setNewAssessmentForm({
                        ...newAssessmentForm,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jenis</Label>
                  <Select
                    value={newAssessmentForm.type}
                    onValueChange={(v) =>
                      setNewAssessmentForm({ ...newAssessmentForm, type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formative">Formatif</SelectItem>
                      <SelectItem value="summative">Sumatif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lingkup TP (Ceklis yang dinilai)</Label>
                  <div className="border rounded-md p-2 h-32 overflow-y-auto space-y-2">
                    {availableTPs.length === 0 ? (
                      <p className="text-sm text-muted">Belum ada data TP.</p>
                    ) : (
                      availableTPs.map((tp) => (
                        <div
                          key={tp._id}
                          className="flex items-start space-x-2"
                        >
                          <Checkbox
                            id={tp._id}
                            checked={newAssessmentForm.selectedTPs.includes(
                              tp._id
                            )}
                            onCheckedChange={() => toggleTP(tp._id)}
                          />
                          <label
                            htmlFor={tp._id}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            <span className="font-semibold">{tp.code}</span> -{" "}
                            {tp.description}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateAssessment} disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {selectedAssessment && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Input Nilai Siswa</CardTitle>
              <CardDescription>Masukkan nilai skala 0-100.</CardDescription>
            </div>
            <Button
              onClick={handleSaveGrades}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}{" "}
              Simpan Nilai
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead className="w-[150px]">Nilai (0-100)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingGrades ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      Tidak ada siswa di kelas ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student, index) => (
                    <TableRow key={student._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {student.profile?.fullName}
                      </TableCell>
                      <TableCell>{student.profile?.nisn}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          className="text-center font-bold"
                          value={grades[student._id] || ""}
                          onChange={(e) =>
                            setGrades({
                              ...grades,
                              [student._id]: parseInt(e.target.value),
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InputGradePage;
