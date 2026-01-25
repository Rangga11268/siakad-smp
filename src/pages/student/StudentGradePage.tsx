import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import api from "@/services/api";
import { Book } from "iconoir-react";

const StudentGradePage = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("Ganjil");

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchGrades();
    }
  }, [selectedYear, selectedSemester]);

  const fetchAcademicYears = async () => {
    try {
      const res = await api.get("/academic/years");
      setAcademicYears(res.data);
      const active = res.data.find((y: any) => y.status === "Active");
      if (active) {
        setSelectedYear(active._id);
        setSelectedSemester(active.semester);
      } else if (res.data.length > 0) {
        setSelectedYear(res.data[0]._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await api.get("/academic/my-grades", {
        params: { academicYear: selectedYear, semester: selectedSemester },
      });
      setGrades(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getGradePredicate = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  };

  const getPredicateColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nilai Saya</h2>
        <p className="text-muted-foreground">
          Rekap nilai rata-rata per mata pelajaran.
        </p>
      </div>

      <div className="flex gap-4">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pilih Tahun Ajar" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((y) => (
              <SelectItem key={y._id} value={y._id}>
                {y.name} - {y.semester}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ganjil">Ganjil</SelectItem>
            <SelectItem value="Genap">Genap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Loading...</p>
        ) : grades.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
            Belum ada data nilai untuk semester ini.
          </div>
        ) : (
          grades.map((g, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {g.subject}
                </CardTitle>
                <Book className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-end gap-2">
                  {g.average}
                  <span
                    className={`text-sm font-medium ${getPredicateColor(
                      g.average,
                    )}`}
                  >
                    {getGradePredicate(g.average)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Rata-rata Nilai
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentGradePage;
