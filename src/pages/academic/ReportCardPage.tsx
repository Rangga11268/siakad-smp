import { useState, useEffect } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Reports, SystemRestart, Printer } from "iconoir-react";
import { Label } from "@/components/ui/label";
import { ReportCardTemplate } from "@/components/reports/ReportCardTemplate";

interface ClassData {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  username: string;
  profile: {
    fullName: string;
    nisn: string;
    class: string;
  };
}

interface ReportItem {
  subject: {
    name: string;
    kkm: number;
    code: string;
  };
  score: number;
  predikat: string;
  description: string;
}

const ReportCardPage = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  // Active Year info (Mock or Fetch)
  const activeYear = "2024/2025";
  const activeSemester = "Ganjil";

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await api.get("/academic/class");
      setClasses(res.data);
    } catch (error) {
      console.error("Error loading classes", error);
    }
  };

  const loadStudents = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedStudent("");
    setReportData(null);
    setLoading(true);
    try {
      const clsName = classes.find((c) => c._id === classId)?.name;
      const res = await api.get("/academic/students");
      const filtered = res.data.filter(
        (s: any) => s.profile?.class === clsName,
      );
      setStudents(filtered);
    } catch (error) {
      console.error("Error loading students", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedStudent) return;
    setLoadingReport(true);
    try {
      const yearRes = await api.get("/academic/years");
      const active = yearRes.data.find((y: any) => y.status === "active");
      const aId = active ? active._id : "";

      const res = await api.get(`/academic/report/full`, {
        params: {
          studentId: selectedStudent,
          academicYear: aId,
          semester: activeSemester,
        },
      });
      setReportData(res.data);
    } catch (error) {
      console.error("Gagal generate rapor", error);
    } finally {
      setLoadingReport(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getYearName = (y: string) => y;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            E-Rapor Akademik
          </h2>
          <p className="text-slate-500">
            Cetak Laporan Hasil Belajar (Rapor) Kurikulum Merdeka.
          </p>
        </div>
      </div>

      <Card className="print:hidden border-t-4 border-t-school-gold shadow-md">
        <CardHeader>
          <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
            <Reports className="w-5 h-5 text-school-gold" /> Filter Rapor
          </CardTitle>
          <CardDescription>
            Pilih Kelas dan Siswa untuk menampilkan preview rapor.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 items-end">
          <div className="space-y-2">
            <Label className="font-semibold text-school-navy">Kelas</Label>
            <Select onValueChange={loadStudents}>
              <SelectTrigger className="bg-slate-50 border-slate-300">
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
            <Label className="font-semibold text-school-navy">Nama Siswa</Label>
            <Select
              onValueChange={setSelectedStudent}
              disabled={!selectedClass}
            >
              <SelectTrigger className="bg-slate-50 border-slate-300">
                <SelectValue placeholder="Pilih Siswa" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.profile?.fullName || s.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={generateReport}
            disabled={!selectedStudent || loadingReport}
            className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md"
          >
            {loadingReport ? (
              <SystemRestart className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Tampilkan Rapor
          </Button>
        </CardContent>
      </Card>

      {/* REPORT PREVIEW CONTAINER */}
      {reportData && (
        <div className="relative">
          <div className="border shadow-lg rounded-lg overflow-hidden">
            <ReportCardTemplate data={reportData} yearName={activeYear} />
          </div>

          <div className="mt-8 flex justify-end fixed bottom-8 right-8 z-50">
            <Button
              onClick={() => {
                // Open dedicated print page
                const url = `/print/report?studentId=${selectedStudent}&year=${activeYear}&semester=${activeSemester}&yearName=${activeYear}`;
                window.open(url, "_blank");
              }}
              className="bg-school-navy hover:bg-school-gold hover:text-school-navy text-white font-bold shadow-xl rounded-full px-6 py-6 h-auto transition-transform hover:scale-105"
            >
              <Printer className="mr-2 h-5 w-5" /> Cetak Rapor (PDF)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCardPage;
