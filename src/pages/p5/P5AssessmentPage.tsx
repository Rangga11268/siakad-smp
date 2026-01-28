import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  FloppyDisk,
  SystemRestart,
  CheckCircle,
  Printer,
} from "iconoir-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ProjectP5 {
  _id: string;
  title: string;
  theme: string;
  level: number;
  targets: {
    dimension: string;
    element: string;
    subElement: string;
    _id: string;
  }[];
}

interface Student {
  _id: string;
  username: string;
  profile?: { fullName: string; nisn: string };
}

const P5AssessmentPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectP5 | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Assessment State
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  // Logbook Review State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const [feedbackInput, setFeedbackInput] = useState<Record<string, string>>(
    {},
  );

  const { toast } = useToast();

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const projectRes = await api.get(`/p5`);
      const foundProject = projectRes.data.find(
        (p: any) => p._id === projectId,
      );
      setProject(foundProject);

      if (foundProject) {
        const studentRes = await api.get(
          `/academic/students/level/${foundProject.level}`,
        );
        setStudents(studentRes.data);

        // Load existing assessments
        const assessRes = await api.get(`/p5/assess/${projectId}`);
        const existingAssessments = assessRes.data;

        const initialInputs: any = {};
        const status: any = {};

        existingAssessments.forEach((assess: any) => {
          const studentId = assess.student._id;
          status[studentId] = true;
          initialInputs[studentId] = {};
          assess.scores.forEach((s: any) => {
            initialInputs[studentId][s.targetId] = s.score;
          });
        });
        setInputs(initialInputs);
        setSavedStatus(status);
      }
    } catch (error) {
      console.error("Gagal load data assessment", error);
    } finally {
      setLoading(false);
    }
  };

  // Assessment Handlers
  const handleScoreChange = (
    studentId: string,
    targetId: string,
    value: string,
  ) => {
    setInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [targetId]: value,
      },
    }));
    setSavedStatus((prev) => ({ ...prev, [studentId]: false }));
  };

  const saveStudentAssessment = async (studentId: string) => {
    if (!project) return;

    const studentScores = inputs[studentId] || {};
    const scoresPayload = Object.keys(studentScores).map((targetId) => {
      const target = project.targets.find(
        (t) => t._id === targetId || t._id === undefined,
      );

      return {
        targetId,
        score: studentScores[targetId],
        dimension: target?.dimension,
        element: target?.element,
      };
    });

    try {
      await api.post("/p5/assess", {
        projectId: project._id,
        studentId,
        scores: scoresPayload,
        finalNotes: "Penilaian Formatif",
      });
      setSavedStatus((prev) => ({ ...prev, [studentId]: true }));
      toast({
        title: "Tersimpan",
        description: "Nilai berhasil disimpan.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal simpan nilai.",
      });
    }
  };

  // PDF REPORT GENERATOR
  const handlePrintReport = (studentId: string) => {
    const student = students.find((s) => s._id === studentId);
    const studentScores = inputs[studentId] || {};

    if (!student || !project) return;

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
      `Nama Siswa : ${student.profile?.fullName || student.username}`,
      20,
      40,
    );
    doc.text(`NISN       : ${student.profile?.nisn || "-"}`, 20, 45);
    doc.text(`Kelas      : ${project.level} (Fase D)`, 20, 50);
    doc.text(`Tahun Ajar : 2024/2025`, 20, 55);

    doc.setFont("helvetica", "bold");
    doc.text(`Judul Projek : ${project.title}`, 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`Tema         : ${project.theme}`, 20, 70);
    // Description (split text if long)
    const desc = doc.splitTextToSize(
      `Deskripsi: ${project.theme} - ${project.title}. Projek ini bertujuan untuk menguatkan karakter profil pelajar pancasila melalui kegiatan berbasis projek.`,
      170,
    );
    doc.text(desc, 20, 80);

    // TABLE
    const tableData = project.targets.map((t) => {
      const score = studentScores[t._id];
      const scoreText =
        score === "BB"
          ? "Belum Berkembang"
          : score === "MB"
            ? "Mulai Berkembang"
            : score === "BSH"
              ? "Berkembang Sesuai Harapan"
              : score === "SB"
                ? "Sangat Berkembang"
                : "Belum Dinilai";
      return [t.dimension, t.element, scoreText];
    });

    autoTable(doc, {
      startY: 95,
      head: [["Dimensi", "Elemen", "Capaian Akhir"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [22, 36, 71] }, // school-navy
    });

    // SIGNATURE
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.text("Bandung, ......................", 140, finalY);
    doc.text("Fasilitator Projek,", 140, finalY + 10);
    doc.text("( ................................. )", 140, finalY + 35);

    doc.save(`Rapor_P5_${student.profile?.fullName?.replace(/\s+/g, "_")}.pdf`);
  };

  // Logbook Handlers
  const openLogbookReview = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const res = await api.get(
        `/p5/logbook/${projectId}?studentId=${student._id}`,
      );
      setStudentLogs(res.data);
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal load logbook" });
    }
  };

  const handleSendFeedback = async (logId: string) => {
    const fb = feedbackInput[logId];
    if (!fb) return;
    try {
      await api.patch(`/p5/logbook/${logId}/feedback`, { feedback: fb });
      toast({ title: "Feedback terkirim" });
      setStudentLogs((prev) =>
        prev.map((log) => (log._id === logId ? { ...log, feedback: fb } : log)),
      );
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal kirim feedback" });
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <SystemRestart className="animate-spin" />
      </div>
    );
  if (!project) return <div>Project tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full border-2 border-school-navy text-school-navy hover:bg-school-navy hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
              Assessment: {project?.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 uppercase tracking-wider">
                {project?.theme}
              </span>
              <span className="text-sm text-slate-500 font-medium">
                Kelas {project?.level}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="assessment" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-lg border shadow-sm w-full md:w-auto grid grid-cols-2 md:inline-flex">
          <TabsTrigger
            value="assessment"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white"
          >
            Input Penilaian (Rapor)
          </TabsTrigger>
          <TabsTrigger
            value="logbook"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white"
          >
            Monitoring Jurnal (Logbook)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment">
          <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden bg-white">
            <CardHeader className="bg-white border-b border-slate-100 pb-6">
              <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-school-gold" />
                Input Penilaian Projek
              </CardTitle>
              <CardDescription className="text-slate-500">
                Masukan predikat (BB, MB, BSH, SB) untuk setiap dimensi profil
                pelajar Pancasila.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-school-navy">
                    <TableRow className="hover:bg-school-navy border-none">
                      <TableHead className="w-[200px] sticky left-0 bg-school-navy text-white font-bold z-20 border-r border-blue-900">
                        Nama Siswa
                      </TableHead>
                      {project?.targets.map((target, idx) => (
                        <TableHead
                          key={target._id || idx}
                          className="min-w-[180px] bg-school-navy text-white border-r border-blue-900 last:border-0"
                        >
                          <div className="flex flex-col h-full justify-center py-2 gap-1">
                            <div className="text-[10px] uppercase tracking-wider opacity-70 font-semibold text-blue-200">
                              {target.dimension}
                            </div>
                            <div
                              className="font-bold text-xs leading-tight line-clamp-2"
                              title={`${target.element} - ${target.subElement}`}
                            >
                              {target.element}
                            </div>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="w-[120px] text-center sticky right-0 bg-school-navy text-white font-bold z-20 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.3)]">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, idx) => (
                      <TableRow
                        key={student._id}
                        className={`hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                      >
                        <TableCell className="font-medium sticky left-0 bg-inherit z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <div className="flex flex-col">
                            <span className="text-school-navy font-bold text-sm">
                              {student.profile?.fullName || student.username}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {student.profile?.nisn || "No NISN"}
                            </span>
                          </div>
                        </TableCell>
                        {project?.targets.map((target, idx) => (
                          <TableCell
                            key={target._id || idx}
                            className="border-r border-slate-100 last:border-0 p-2"
                          >
                            <Select
                              value={inputs[student._id]?.[target._id] || ""}
                              onValueChange={(val) =>
                                handleScoreChange(student._id, target._id, val)
                              }
                            >
                              <SelectTrigger
                                className={`h-9 border-slate-200 focus:ring-school-gold ${
                                  inputs[student._id]?.[target._id]
                                    ? "bg-white font-bold text-school-navy"
                                    : "bg-slate-50 text-slate-400"
                                }`}
                              >
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BB">
                                  <span className="font-bold text-red-600">
                                    BB
                                  </span>{" "}
                                  - Belum Berkembang
                                </SelectItem>
                                <SelectItem value="MB">
                                  <span className="font-bold text-orange-600">
                                    MB
                                  </span>{" "}
                                  - Mulai Berkembang
                                </SelectItem>
                                <SelectItem value="BSH">
                                  <span className="font-bold text-blue-600">
                                    BSH
                                  </span>{" "}
                                  - Berkembang Sesuai Harapan
                                </SelectItem>
                                <SelectItem value="SB">
                                  <span className="font-bold text-green-600">
                                    SB
                                  </span>{" "}
                                  - Sangat Berkembang
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        ))}
                        <TableCell className="text-center sticky right-0 bg-inherit z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] p-2">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="icon"
                              variant={
                                savedStatus[student._id] ? "ghost" : "default"
                              }
                              className={`h-9 w-9 rounded-full transition-all duration-300 ${
                                savedStatus[student._id]
                                  ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                  : "bg-school-navy text-white hover:bg-school-gold hover:text-school-navy shadow-md"
                              }`}
                              onClick={() => saveStudentAssessment(student._id)}
                              title={
                                savedStatus[student._id]
                                  ? "Disimpan"
                                  : "Simpan Nilai"
                              }
                            >
                              {savedStatus[student._id] ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <FloppyDisk className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-9 w-9 rounded-full border-school-navy text-school-navy hover:bg-school-navy hover:text-white"
                              onClick={() => handlePrintReport(student._id)}
                              title="Cetak Rapor PDF"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logbook">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Jurnal Siswa</CardTitle>
              <CardDescription>
                Cek progres mingguan dan berikan umpan balik.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-all hover:border-school-navy"
                    onClick={() => openLogbookReview(student)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {student.profile?.fullName?.charAt(0) ||
                          student.username.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-school-navy">
                          {student.profile?.fullName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {student.profile?.nisn}
                        </p>
                        <p className="text-xs text-blue-600 mt-1 font-medium">
                          Klik untuk review
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Logbook Review Dialog */}
      <Dialog
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Jurnal: {selectedStudent?.profile?.fullName}
            </DialogTitle>
            <DialogDescription>Catatan proses siswa.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {studentLogs.length === 0 ? (
              <p className="text-center text-slate-500 italic bg-slate-50 p-8 rounded">
                Siswa belum mengisi jurnal.
              </p>
            ) : (
              studentLogs.map((log) => (
                <div
                  key={log._id}
                  className="border-l-4 border-school-navy pl-4 py-2 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-lg">{log.title}</h4>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded text-sm whitespace-pre-wrap border shadow-sm leading-relaxed">
                    {log.content}
                  </p>

                  {log.media && log.media.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {log.media.map((m: any, idx: number) => (
                        <a
                          key={idx}
                          href={`http://localhost:5000${m}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-50 px-3 py-1 rounded text-blue-600 hover:text-blue-800 flex items-center gap-1 border border-blue-100"
                        >
                          📄 Lihat Lampiran
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="pt-2">
                    <label className="text-xs font-bold text-school-gold uppercase tracking-wide mb-1 block">
                      Feedback Fasilitator
                    </label>
                    <div className="flex gap-2 items-start">
                      <Textarea
                        placeholder="Berikan umpan balik yang membangun..."
                        className="min-h-[80px] text-sm flex-1"
                        defaultValue={log.feedback}
                        onChange={(e) =>
                          setFeedbackInput({
                            ...feedbackInput,
                            [log._id]: e.target.value,
                          })
                        }
                      />
                      <Button
                        className="h-[80px] bg-school-navy hover:bg-school-gold hover:text-school-navy"
                        onClick={() => handleSendFeedback(log._id)}
                      >
                        <FloppyDisk className="w-4 h-4 mr-2" /> Kirim
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default P5AssessmentPage;
