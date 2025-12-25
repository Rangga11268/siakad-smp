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
import { ArrowLeft, Save, Loader2, CheckCircle } from "lucide-react";
import api from "@/services/api";

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

  // State to hold temporary scores for all students: { [studentId]: { [targetId]: score } }
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>(
    {}
  );

  // State to track which students have been saved/synced
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      // 1. Get Project
      const projectRes = await api.get(`/p5`); // Currently fetches all, need detail endpoint?
      // Wait, p5Controller only has getProjects (plural). I need getProject (detail).
      // For now I filter client side or just use the list.
      // Ideally I should add getProjectById. But let's filter for MVP.
      const foundProject = projectRes.data.find(
        (p: any) => p._id === projectId
      );
      setProject(foundProject);

      if (foundProject) {
        // 2. Get Students by Level
        const studentRes = await api.get(
          `/academic/students/level/${foundProject.level}`
        );
        setStudents(studentRes.data);

        // 3. Get Existing Assessments
        const assessRes = await api.get(`/p5/assess/${projectId}`);
        const existingAssessments = assessRes.data;

        // Map existing to state
        const initialInputs: any = {};
        const status: any = {};

        existingAssessments.forEach((assess: any) => {
          const studentId = assess.student._id; // populate returns object
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
    value: string
  ) => {
    setInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [targetId]: value,
      },
    }));
    // Mark as unsaved
    setSavedStatus((prev) => ({ ...prev, [studentId]: false }));
  };

  const saveStudentAssessment = async (studentId: string) => {
    if (!project) return;

    const studentScores = inputs[studentId] || {};
    const scoresPayload = Object.keys(studentScores).map((targetId) => {
      const target = project.targets.find(
        (t) =>
          t._id === targetId || t._id === undefined /* handle missing id case */
      );
      // Note: if backend project targets dont have id, we need to rely on index or something.
      // But mongoose subdocs usually have _id.

      return {
        targetId,
        score: studentScores[targetId],
        dimension: target?.dimension, // Optional, backend might need it or just targetId
        element: target?.element,
      };
    });

    try {
      // setSaving(true); // Maybe localized loading?
      await api.post("/p5/assess", {
        projectId: project._id,
        studentId,
        scores: scoresPayload,
        finalNotes: "Penilaian Formatif", // Placeholder
      });
      setSavedStatus((prev) => ({ ...prev, [studentId]: true }));
    } catch (error) {
      console.error("Gagal simpan", error);
      alert("Gagal simpan nilai");
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!project) return <div>Project tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{project.title}</h2>
          <p className="text-muted-foreground">
            {project.theme} - Kelas {project.level}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Penilaian Projek</CardTitle>
          <CardDescription>
            Masukan predikat (BB, MB, BSH, SB) untuk setiap dimensi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] sticky left-0 bg-background z-10">
                    Nama Siswa
                  </TableHead>
                  {project.targets.map((target, idx) => (
                    <TableHead
                      key={target._id || idx}
                      className="min-w-[150px]"
                    >
                      <div className="text-xs font-normal text-muted-foreground">
                        {target.dimension}
                      </div>
                      <div
                        className="font-medium truncate pt-1"
                        title={target.subElement}
                      >
                        {target.element}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-[100px] text-right sticky right-0 bg-background z-10">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      {student.profile?.fullName || student.username}
                      <div className="text-xs text-muted-foreground">
                        {student.profile?.nisn}
                      </div>
                    </TableCell>
                    {project.targets.map((target, idx) => (
                      <TableCell key={target._id || idx}>
                        <Select
                          value={inputs[student._id]?.[target._id] || ""}
                          onValueChange={(val) =>
                            handleScoreChange(student._id, target._id, val)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Pilih..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BB">BB</SelectItem>
                            <SelectItem value="MB">MB</SelectItem>
                            <SelectItem value="BSH">BSH</SelectItem>
                            <SelectItem value="SB">SB</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    ))}
                    <TableCell className="text-right sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <Button
                        size="sm"
                        variant={savedStatus[student._id] ? "ghost" : "default"}
                        className={
                          savedStatus[student._id] ? "text-green-600" : ""
                        }
                        onClick={() => saveStudentAssessment(student._id)}
                      >
                        {savedStatus[student._id] ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Save className="h-4 w-4" />
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
