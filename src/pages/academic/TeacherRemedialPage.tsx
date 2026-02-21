import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RefreshDouble, CheckCircle, EditPencil } from "iconoir-react";
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

interface RemedialStudent {
  _id: string; // Grade ID
  studentId: string;
  studentName: string;
  className: string;
  assessmentId: string;
  assessmentTitle: string;
  subjectId: string;
  subjectName: string;
  originalScore: number;
  kkm: number;
  remedialStatus: string; // not_assigned, assigned, completed
  remedialId: string | null;
}

const TeacherRemedialPage = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [eligibleList, setEligibleList] = useState<RemedialStudent[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog States
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<RemedialStudent | null>(null);

  // Form States
  const [taskDescription, setTaskDescription] = useState("");
  const [remedialScore, setRemedialScore] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchEligibleStudents();
  }, [selectedClass, selectedSubject]);

  const fetchFilters = async () => {
    try {
      const [classRes, subjectRes] = await Promise.all([
        api.get("/academic/class"),
        api.get("/academic/subjects"),
      ]);
      setClasses(classRes.data);
      setSubjects(subjectRes.data);
    } catch (error) {
      console.error("Gagal load filter", error);
    }
  };

  const fetchEligibleStudents = async () => {
    setLoading(true);
    try {
      let url = "/remedial/eligible?kkm=75"; // Default KKM 75, can be dynamic later
      if (selectedClass) url += `&classId=${selectedClass}`;
      if (selectedSubject) url += `&subjectId=${selectedSubject}`;

      const res = await api.get(url);
      setEligibleList(res.data);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal mengambil data remedial" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (student: RemedialStudent) => {
    setSelectedStudent(student);
    setTaskDescription("");
    setShowAssignDialog(true);
  };

  const handleOpenScore = (student: RemedialStudent) => {
    setSelectedStudent(student);
    setRemedialScore("");
    setFeedback("");
    setShowScoreDialog(true);
  };

  const submitAssign = async () => {
    if (!selectedStudent || !taskDescription) return;
    setSubmitting(true);
    try {
      await api.post("/remedial/assign", {
        studentId: selectedStudent.studentId,
        assessmentId: selectedStudent.assessmentId,
        subjectId: selectedStudent.subjectId,
        originalScore: selectedStudent.originalScore,
        taskDescription,
      });
      toast({ title: "Berhasil", description: "Tugas remedial diberikan." });
      setShowAssignDialog(false);
      fetchEligibleStudents(); // Refresh data
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal memberikan tugas" });
    } finally {
      setSubmitting(false);
    }
  };

  const submitScore = async () => {
    if (!selectedStudent || !selectedStudent.remedialId || remedialScore === "")
      return;
    setSubmitting(true);
    try {
      await api.put(`/remedial/${selectedStudent.remedialId}/score`, {
        remedialScore: Number(remedialScore),
        feedback,
        kkm: selectedStudent.kkm,
      });
      toast({ title: "Berhasil", description: "Nilai remedial tersimpan." });
      setShowScoreDialog(false);
      fetchEligibleStudents(); // Refresh data
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal menyimpan nilai" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-school-navy flex items-center gap-2">
            <RefreshDouble className="w-6 h-6 text-school-gold" /> Tindak Lanjut
            Remedial
          </h2>
          <p className="text-slate-500 text-sm">
            Daftar siswa dengan nilai di bawah KKM beserta tindak lanjut
            perbaikannya.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-sm font-bold text-slate-700">
            Filter Data
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="bg-white">
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
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Tugas/Ujian</TableHead>
                <TableHead>Mapel</TableHead>
                <TableHead className="text-center">Nilai Asli</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-slate-500"
                  >
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : eligibleList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-slate-500"
                  >
                    Tidak ada siswa yang butuh remedial (semua tuntas). 🎉
                  </TableCell>
                </TableRow>
              ) : (
                eligibleList.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium text-school-navy">
                      {student.studentName}
                    </TableCell>
                    <TableCell>{student.className}</TableCell>
                    <TableCell>
                      {student.assessmentTitle}
                      <p className="text-xs text-slate-400">
                        KKM: {student.kkm}
                      </p>
                    </TableCell>
                    <TableCell>{student.subjectName}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-red-600 font-bold">
                        {student.originalScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      {student.remedialStatus === "not_assigned" && (
                        <Badge
                          variant="outline"
                          className="text-slate-500 border-slate-200 bg-slate-50"
                        >
                          Belum Ditugaskan
                        </Badge>
                      )}
                      {student.remedialStatus === "assigned" && (
                        <Badge
                          variant="outline"
                          className="text-amber-600 border-amber-200 bg-amber-50"
                        >
                          Sedang Dikerjakan
                        </Badge>
                      )}
                      {student.remedialStatus === "completed" && (
                        <Badge
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 bg-emerald-50"
                        >
                          Tuntas
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {student.remedialStatus === "not_assigned" && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenAssign(student)}
                          className="bg-school-navy hover:bg-school-gold hover:text-school-navy"
                        >
                          <EditPencil className="w-4 h-4 mr-1" /> Beri Tugas
                        </Button>
                      )}
                      {student.remedialStatus === "assigned" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenScore(student)}
                          className="border-school-navy text-school-navy hover:bg-school-navy hover:text-white"
                        >
                          Input Nilai
                        </Button>
                      )}
                      {student.remedialStatus === "completed" && (
                        <Button size="sm" variant="ghost" disabled>
                          <CheckCircle className="w-4 h-4 text-emerald-500 mr-1" />{" "}
                          Selesai
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Berikan Tugas Remedial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
              <p>
                <span className="font-bold">Siswa:</span>{" "}
                {selectedStudent?.studentName}
              </p>
              <p>
                <span className="font-bold">Evaluasi:</span>{" "}
                {selectedStudent?.assessmentTitle}
              </p>
              <p>
                <span className="font-bold text-red-600">Nilai:</span>{" "}
                {selectedStudent?.originalScore} (KKM: {selectedStudent?.kkm})
              </p>
            </div>
            <div className="space-y-2">
              <Label>Instruksi Tugas Remedial</Label>
              <Textarea
                placeholder="Contoh: Rangkum Bab 3 sebanyak 2 halaman tulisan tangan."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
            >
              Batal
            </Button>
            <Button
              onClick={submitAssign}
              disabled={!taskDescription || submitting}
              className="bg-school-navy text-white hover:bg-school-gold hover:text-school-navy"
            >
              Simpan Penugasan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Input Score Dialog */}
      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Input Nilai Remedial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
              <p>
                <span className="font-bold">Siswa:</span>{" "}
                {selectedStudent?.studentName}
              </p>
              <p>
                <span className="font-bold">Evaluasi:</span>{" "}
                {selectedStudent?.assessmentTitle}
              </p>
              <p className="text-xs text-slate-500 mt-1 italic">
                Catatan: Nilai maksimal yang masuk adalah KKM (
                {selectedStudent?.kkm}).
              </p>
            </div>

            <div className="space-y-2">
              <Label>Input Nilai</Label>
              <Input
                type="number"
                placeholder="0 - 100"
                value={remedialScore}
                onChange={(e) =>
                  setRemedialScore(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label>Feedback (Opsional)</Label>
              <Textarea
                placeholder="Catatan pengerjaan remedial..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScoreDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={submitScore}
              disabled={remedialScore === "" || submitting}
              className="bg-school-navy text-white hover:bg-school-gold hover:text-school-navy"
            >
              Simpan Nilai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherRemedialPage;
