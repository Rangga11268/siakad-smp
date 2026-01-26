import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  FloppyDisk,
  SystemRestart,
  CheckCircle,
} from "iconoir-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

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

  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>(
    {},
  );

  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

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

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <SystemRestart className="animate-spin" />
      </div>
    );
  if (!project) return <div>Project tidak ditemukan</div>;

  return (
    <div className="space-y-8">
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
              {project?.title}
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
                        <div className="text-[10px] font-normal italic text-blue-100 opacity-80 truncate">
                          ({target.subElement})
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-[80px] text-center sticky right-0 bg-school-navy text-white font-bold z-20 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.3)]">
                    Simpan
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
                              <span className="font-bold text-red-600">BB</span>{" "}
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
                      <Button
                        size="icon"
                        variant={savedStatus[student._id] ? "ghost" : "default"}
                        className={`h-9 w-9 rounded-full transition-all duration-300 ${
                          savedStatus[student._id]
                            ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                            : "bg-school-navy text-white hover:bg-school-gold hover:text-school-navy shadow-md"
                        }`}
                        onClick={() => saveStudentAssessment(student._id)}
                        title={
                          savedStatus[student._id] ? "Disimpan" : "Simpan Nilai"
                        }
                      >
                        {savedStatus[student._id] ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <FloppyDisk className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default P5AssessmentPage;
