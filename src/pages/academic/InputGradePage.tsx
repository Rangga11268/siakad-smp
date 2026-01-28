import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // Import Auth
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
import { FloppyDisk, SystemRestart, BookStack, Page } from "iconoir-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface ClassData {
  _id: string;
  name: string;
  level: number; // Changed to number to match Model
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
  const { user } = useAuth(); // Get user
  const [activeAcademicYear, setActiveAcademicYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, number>>({});

  // Data for New Assessment Removed
  // const [availableTPs, setAvailableTPs] = useState<LearningGoal[]>([]); removed if only used for create logic?
  // Wait, fetchTPs is used? Line 124. Used for filtering? No, mainly for creating assessment.
  // Unless input grade displays TP? No, table just shows Score.
  // So availableTPs can be removed too?
  // Cek line 399: availableTPs rendered in Dialog.
  // Yes, remove availableTPs and create form states.

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, subjectRes, yearRes] = await Promise.all([
          api.get("/academic/class"),
          api.get("/academic/subjects"),
          api.get("/academic/years"), // Fetch years
        ]);
        setClasses(classRes.data);
        setSubjects(subjectRes.data);

        // Set Active Year
        const active = yearRes.data.find((y: any) => y.status === "active");
        if (active) setActiveAcademicYear(active._id);
        else if (yearRes.data.length > 0)
          setActiveAcademicYear(yearRes.data[0]._id); // Fallback
      } catch (error) {
        console.error("Gagal load filter", error);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchData();
  }, []);

  // Fetch Assessments
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchAssessments();
    }
  }, [selectedClass, selectedSubject]);

  const fetchAssessments = async () => {
    try {
      const res = await api.get(
        `/academic/assessment?classId=${selectedClass}&subjectId=${selectedSubject}`,
      );
      setAssessments(res.data);
    } catch (error) {
      console.error("Failed load assessments");
    }
  };

  // handleCreateAssessment removed

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

  // toggleTP removed

  if (loadingOptions) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <SystemRestart className="h-8 w-8 animate-spin text-school-gold" />
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

          <Button
            className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all sm:w-auto w-full"
            disabled={false} // Enabled
            onClick={() =>
              (window.location.href = "/dashboard/academic/assessment")
            }
          >
            <BookStack className="mr-2 h-4 w-4" /> Kelola / Tambah Asesmen
          </Button>
          {/* Dialog Removed */}
        </CardContent>
      </Card>

      {selectedAssessment && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t-4 border-t-school-gold shadow-lg border-none">
          <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
                <Page className="w-5 h-5 text-school-gold" /> Input Nilai Siswa
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
                <SystemRestart className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FloppyDisk className="mr-2 h-4 w-4" />
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
                          <SystemRestart className="h-6 w-6 animate-spin mb-2" />
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
