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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import { Book, Eye, Calendar } from "iconoir-react";
import { Button } from "@/components/ui/button";

const StudentGradePage = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("Ganjil");
  const [activeSubject, setActiveSubject] = useState<any>(null);

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
      const active = res.data.find(
        (y: any) => y.status?.toLowerCase() === "active",
      );
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
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-3xl font-bold flex items-end gap-2 text-school-navy">
                      {g.average}
                      <span
                        className={`text-lg font-medium ${getPredicateColor(
                          g.average,
                        )}`}
                      >
                        {getGradePredicate(g.average)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rata-rata Total
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">
                      Tugas / PR
                    </p>
                    <p className="text-lg font-bold text-blue-700">
                      {g.assignmentAvg || "-"}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-md">
                    <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wide">
                      Ulangan
                    </p>
                    <p className="text-lg font-bold text-purple-700">
                      {g.examAvg || "-"}
                    </p>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full mt-4 text-xs text-slate-500 hover:text-school-navy flex items-center justify-center gap-1 border border-dashed border-slate-200"
                      onClick={() => setActiveSubject(g)}
                    >
                      <Eye className="w-3 h-3" /> Lihat Detail Nilai
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-xl border-b pb-2">
                        Rincian Nilai: {activeSubject?.subject}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {activeSubject?.details?.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">
                                Nama Asesmen
                              </TableHead>
                              <TableHead className="text-xs text-center w-[80px]">
                                Nilai
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activeSubject.details.map(
                              (detail: any, dIdx: number) => (
                                <TableRow key={dIdx}>
                                  <TableCell className="py-3">
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-sm">
                                        {detail.title}
                                      </span>
                                      {detail.tpCodes?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {detail.tpCodes.map(
                                            (code: string, cidx: number) => (
                                              <span
                                                key={cidx}
                                                className="bg-slate-100 text-[8px] px-1 rounded text-slate-500 font-mono"
                                              >
                                                {code}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          variant="outline"
                                          className="text-[9px] px-1 py-0 h-4 capitalize"
                                        >
                                          {detail.type === "exam"
                                            ? "Ulangan"
                                            : detail.type === "assignment"
                                              ? "Tugas"
                                              : detail.type}
                                        </Badge>
                                        <span className="text-[9px] text-slate-400 flex items-center gap-1">
                                          <Calendar className="w-2 h-2" />
                                          {new Date(
                                            detail.date,
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center font-bold text-lg text-school-navy">
                                    {detail.score}
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-center py-4 text-slate-500 italic">
                          Belum ada detail nilai.
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentGradePage;
