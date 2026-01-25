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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Printer, Search } from "lucide-react";
import { Label } from "@/components/ui/label";

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
    class: string; // text
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
  const activeYearId = "676bd6ef259300302c09ef7a"; // Dummy/Seeded ID needs to be dynamic ideally

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
      // Filter by class name text match (assuming seeded data uses text "7A")
      const filtered = res.data.filter(
        (s: any) => s.profile?.class === clsName
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
      // Need real academic year ID from somewhere, using query find or hardcoded for now
      // Assuming seed logic: activeYearId is hardcoded or fetched.
      // Better: Fetch active year first. For MVP, I rely on the seeded one.
      // But query requires ID. Let's fetch years again? Or allow `academicYear` string?
      // Controller uses `match: { ... academicYear }`. It expects ObjectId if schema ref.
      // I'll quickly fetch years to get the Active one's ID.
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            E-Rapor Akademik
          </h2>
          <p className="text-muted-foreground">
            Generate dan Cetak Laporan Hasil Belajar (Rapor).
          </p>
        </div>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Filter Data</CardTitle>
          <CardDescription>Pilih Siswa untuk melihat rapor.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 items-end">
          <div className="space-y-2">
            <Label>Kelas</Label>
            <Select onValueChange={loadStudents}>
              <SelectTrigger>
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
            <Label>Nama Siswa</Label>
            <Select
              onValueChange={setSelectedStudent}
              disabled={!selectedClass}
            >
              <SelectTrigger>
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
          >
            {loadingReport ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Tampilkan Rapor
          </Button>
        </CardContent>
      </Card>

      {/* REPORT PREVIEW */}
      {reportData && (
        <div className="bg-white p-8 shadow-lg border rounded-lg min-h-[800px] print:shadow-none print:border-none print:p-0">
          {/* Header Rapor */}
          <div className="text-center border-b-2 border-double border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold uppercase">
              Laporan Hasil Belajar
            </h1>
            <h2 className="text-xl font-semibold">SMP Gak Ada Nama</h2>
            <p className="text-sm">
              Jl. Contoh No. 123, Kota Coding, Indonesia
            </p>
          </div>

          {/* Identitas */}
          <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
            <div>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-32 py-1">Nama Peserta Didik</td>
                    <td className="font-semibold">
                      : {reportData.student.profile.fullName}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1">NISN</td>
                    <td>: {reportData.student.profile.nisn}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Kelas</td>
                    <td>: {reportData.student.profile.class}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-32 py-1">Tahun Pelajaran</td>
                    <td>: {activeYear}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Semester</td>
                    <td>: {activeSemester}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Fase</td>
                    <td>: D</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Nilai */}
          <div className="mb-8">
            <h3 className="font-bold mb-2">A. Nilai Akademik</h3>
            <div className="border rounded-none overflow-hidden">
              <table className="w-full text-sm border-collapse border border-slate-400">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-400 p-2 w-[50px]">No</th>
                    <th className="border border-slate-400 p-2 text-left">
                      Mata Pelajaran
                    </th>
                    <th className="border border-slate-400 p-2 w-[80px]">
                      Nilai Akhir
                    </th>
                    <th className="border border-slate-400 p-2 w-[400px]">
                      Capaian Kompetensi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.reports.map((item: ReportItem, idx: number) => (
                    <tr key={idx}>
                      <td className="border border-slate-400 p-2 text-center">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-400 p-2">
                        {item.subject.name}
                      </td>
                      <td className="border border-slate-400 p-2 text-center font-bold">
                        {item.score}
                      </td>
                      <td className="border border-slate-400 p-2 text-justify">
                        {item.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Absensi */}
          <div className="mb-8 break-inside-avoid">
            <h3 className="font-bold mb-2">B. Ketidakhadiran</h3>
            <div className="border border-slate-400 w-1/2">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="p-2 border-b border-slate-400 w-2/3">
                      Sakit
                    </td>
                    <td className="p-2 border-b border-slate-400 text-center font-bold px-4">
                      {reportData.attendance?.sakit || 0} Hari
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b border-slate-400">Izin</td>
                    <td className="p-2 border-b border-slate-400 text-center font-bold px-4">
                      {reportData.attendance?.izin || 0} Hari
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">Tanpa Keterangan</td>
                    <td className="p-2 text-center font-bold px-4">
                      {reportData.attendance?.alpha || 0} Hari
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-3 gap-4 mt-16 text-center text-sm break-inside-avoid">
            <div>
              <p>Mengetahui,</p>
              <p>Orang Tua/Wali</p>
              <br />
              <br />
              <br />
              <p className="border-t border-black w-32 mx-auto"></p>
            </div>
            <div>
              <p>Mengetahui,</p>
              <p>Kepala Sekolah</p>
              <br />
              <br />
              <br />
              <p className="font-bold underline">Dr. Developer, M.Kom</p>
              <p>NIP. 123456789</p>
            </div>
            <div>
              <p>
                Kota Coding,{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p>Wali Kelas</p>
              <br />
              <br />
              <br />
              <p className="font-bold underline">Budi Santoso, S.Pd</p>
              <p>NIP. 19850101...</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end print:hidden">
            <Button onClick={handlePrint} className="bg-blue-600">
              <Printer className="mr-2 h-4 w-4" /> Cetak / Simpan PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCardPage;
