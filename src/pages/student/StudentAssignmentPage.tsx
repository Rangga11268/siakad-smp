import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, CheckCircle, Clock } from "iconoir-react";
import api from "@/services/api";

const StudentAssignmentPage = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.profile?.class) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // 1. Get Class ID from Name
      const classRes = await api.get("/academic/class");
      const myClass = classRes.data.find(
        (c: any) => c.name === user?.profile?.class,
      );

      if (!myClass) {
        setLoading(false);
        return;
      }

      // 2. Fetch Assessments for this class
      const asmRes = await api.get(
        `/academic/assessment?classId=${myClass._id}`,
      );

      // 3. Keep raw data for now, fetch grades
      const gradeRes = await api.get("/academic/my-grades");
      // Note: my-grades endpoint in controller returns Aggregated Average per subject (step 3838 line 753)
      // This is NOT what we want. We want individual grades for each assessment.

      // We need a way to check if an assessment has been graded.
      // Let's settle for listing Assessments first. Score integration might need new endpoint or logic tweak.
      // Actually, InputGrade saves grades to `Grade` collection.
      // But `getMyGrades` aggregates them.
      // Let's try to display the list first. Detailed score might come later or we fix endpoint.

      setAssessments(asmRes.data);
      // setMyGrades(gradeRes.data); // Values are averages, not useful for per-assessment status.
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-school-navy">
          Daftar Tugas & Ujian
        </h2>
        <p className="text-slate-500">
          Kelas:{" "}
          <span className="font-bold">{user?.profile?.class || "-"}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-3 text-center text-slate-400">
            Memuat data...
          </p>
        ) : assessments.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-slate-50 rounded-lg">
            <Book className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500">
              Belum ada tugas atau ujian untuk kelas ini.
            </p>
          </div>
        ) : (
          assessments.map((asm) => (
            <Card
              key={asm._id}
              className="hover:shadow-md transition-shadow border-l-4 border-l-school-gold"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="mb-2">
                    {asm.subject?.name}
                  </Badge>
                  <Badge
                    className={
                      asm.type === "summative" ? "bg-orange-500" : "bg-blue-500"
                    }
                  >
                    {asm.type === "summative" ? "Sumatif" : "Formatif"}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-school-navy">
                  {asm.title}
                </CardTitle>
                <CardDescription>
                  {asm.learningGoals?.length || 0} topik dinilai
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                  <Clock className="w-4 h-4" />
                  <span>Status: Ditugaskan</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentPage;
