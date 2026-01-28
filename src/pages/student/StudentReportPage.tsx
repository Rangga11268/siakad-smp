import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
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
import { SystemRestart, Printer, Search, Reports } from "iconoir-react";
import { Label } from "@/components/ui/label";
import { ReportCardTemplate } from "@/components/reports/ReportCardTemplate";

const StudentReportPage = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  // Filter State
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("Ganjil");

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const res = await api.get("/academic/years");
      setAcademicYears(res.data);
      // Auto select active
      const active = res.data.find((y: any) => y.isActive);
      if (active) {
        setSelectedYear(active._id);
      } else if (res.data.length > 0) {
        setSelectedYear(res.data[0]._id);
      }
    } catch (error) {
      console.error("Error loading years", error);
    }
  };

  const generateReport = async () => {
    // Normalize: check both _id and id (Use user.id as per interface, handled by AuthContext)
    const studentId = user?.id;

    if (!studentId || !selectedYear) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/academic/report/full`, {
        params: {
          studentId: studentId,
          academicYear: selectedYear,
          semester: selectedSemester,
        },
      });
      setReportData(res.data);
    } catch (error) {
      console.error("Gagal generate rapor", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!user?.id || !selectedYear) return;

    // Open print page in new tab
    const url = `/print/report?studentId=${user.id}&year=${selectedYear}&semester=${selectedSemester}&yearName=${getYearName(selectedYear)}`;
    window.open(url, "_blank");
  };

  const getYearName = (id: string) => {
    const y = academicYears.find((y) => y._id === id);
    return y ? y.name : "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            E-Rapor Saya
          </h2>
          <p className="text-slate-500">
            Lihat dan cetak Laporan Hasil Belajar.
          </p>
        </div>
      </div>

      <Card className="border-t-4 border-t-school-gold shadow-md">
        <CardHeader>
          <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
            <Reports className="w-5 h-5 text-school-gold" /> Pilih Periode
          </CardTitle>
          <CardDescription>
            Pilih Tahun Ajaran dan Semester untuk melihat rapor.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 items-end">
          <div className="space-y-2">
            <Label className="font-semibold text-school-navy">
              Tahun Ajaran
            </Label>
            <Select onValueChange={setSelectedYear} value={selectedYear}>
              <SelectTrigger className="bg-slate-50 border-slate-300">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((y) => (
                  <SelectItem key={y._id} value={y._id}>
                    {y.name} {y.isActive && "(Aktif)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-school-navy">Semester</Label>
            <Select
              value={selectedSemester}
              onValueChange={setSelectedSemester}
            >
              <SelectTrigger className="bg-slate-50 border-slate-300">
                <SelectValue placeholder="Pilih Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ganjil">Ganjil</SelectItem>
                <SelectItem value="Genap">Genap</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={generateReport}
            disabled={loading || !selectedYear}
            className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md"
          >
            {loading ? (
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
          {/* Use Shared Template for Preview */}
          <div className="border shadow-lg rounded-lg overflow-hidden">
            <ReportCardTemplate
              data={reportData}
              yearName={getYearName(selectedYear)}
            />
          </div>

          <div className="mt-8 flex justify-end fixed bottom-8 right-8 z-50">
            <Button
              onClick={handlePrint}
              className="bg-school-navy hover:bg-school-gold hover:text-school-navy text-white font-bold shadow-xl rounded-full px-6 py-6 h-auto transition-transform hover:scale-105"
            >
              <Printer className="mr-2 h-5 w-5" /> Cetak PDF (Versi Cetak)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReportPage;
