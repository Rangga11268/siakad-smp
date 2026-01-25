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
  SystemRestart,
  Printer,
  Search,
  Reports,
  Building,
} from "iconoir-react";
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
        <div className="bg-white p-6 md:p-12 shadow-2xl border rounded-lg min-h-[1000px] print:shadow-none print:border-none print:p-0 print:min-h-0 relative">
          {/* WATERMARK / BACKGROUND DECORATION can go here if needed */}

          {/* Header Rapor (Kop Surat) */}
          <div className="flex items-center justify-between border-b-4 border-double border-school-navy pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-school-navy rounded-full flex items-center justify-center text-white print:text-black print:bg-transparent print:border-2 print:border-black">
                <Building className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-school-navy uppercase tracking-widest">
                  Pemerintah Kota Coding
                </h2>
                <h1 className="text-3xl font-serif font-black text-school-navy uppercase mb-1">
                  SMP Nusantara Cendekia
                </h1>
                <p className="text-sm font-semibold text-slate-600">
                  Terakreditasi A <span className="mx-2">|</span> NPSN: 12345678
                </p>
                <p className="text-sm text-slate-500">
                  Jl. Teknologi No. 42, Silicon Valley, Indonesia 10101
                </p>
                <p className="text-sm text-slate-500">
                  Website: www.smpnusantara.sch.id | Email:
                  info@smpnusantara.sch.id
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold uppercase underline underline-offset-4 decoration-2">
              Laporan Hasil Belajar (Rapor)
            </h2>
            <p className="font-semibold text-slate-600 mt-1">
              Kurikulum Merdeka
            </p>
          </div>

          {/* Identitas */}
          <div className="flex justify-between mb-8 text-sm pt-2">
            <div className="w-1/2 space-y-2">
              <div className="flex">
                <span className="w-40 font-semibold">Nama Peserta Didik</span>
                <span>: {reportData.student.profile.fullName}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-semibold">NISN</span>
                <span>: {reportData.student.profile.nisn}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-semibold">Kelas / Fase</span>
                <span>: {reportData.student.profile.class} / D</span>
              </div>
            </div>
            <div className="w-1/2 space-y-2 pl-12">
              <div className="flex">
                <span className="w-40 font-semibold">Tahun Pelajaran</span>
                <span>: {activeYear}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-semibold">Semester</span>
                <span>: {activeSemester}</span>
              </div>
            </div>
          </div>

          {/* Tabel Nilai */}
          <div className="mb-8">
            <h3 className="font-bold mb-2 text-school-navy text-lg border-b border-slate-200 pb-1 inline-block">
              A. Nilai Akademik
            </h3>
            <div className="w-full overflow-hidden rounded-sm border border-slate-800">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200">
                    <th className="border border-slate-800 p-3 w-[50px] text-center">
                      No
                    </th>
                    <th className="border border-slate-800 p-3 text-left">
                      Mata Pelajaran
                    </th>
                    <th className="border border-slate-800 p-3 w-[100px] text-center">
                      Nilai Akhir
                    </th>
                    <th className="border border-slate-800 p-3 w-[500px] text-left">
                      Capaian Kompetensi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.reports.map((item: ReportItem, idx: number) => (
                    <tr key={idx} className="print:break-inside-avoid">
                      <td className="border border-slate-800 p-2 text-center align-top py-3">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-800 p-2 align-top py-3 font-semibold">
                        {item.subject.name}
                      </td>
                      <td className="border border-slate-800 p-2 text-center align-top py-3 font-bold text-base">
                        {item.score}
                      </td>
                      <td className="border border-slate-800 p-2 text-justify align-top py-3 leading-relaxed">
                        {item.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Absensi & Ekstrakurikuler (Layout 2 Col) */}
          <div className="flex gap-8 mb-12 print:break-inside-avoid">
            <div className="w-1/2">
              <h3 className="font-bold mb-2 text-school-navy text-lg border-b border-slate-200 pb-1 inline-block">
                B. Ketidakhadiran
              </h3>
              <table className="w-full text-sm border border-slate-800">
                <thead className="bg-slate-100 print:bg-slate-200">
                  <tr>
                    <th className="border border-slate-800 p-2 text-left">
                      Keterangan
                    </th>
                    <th className="border border-slate-800 p-2 text-center">
                      Jumlah Hari
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-800">Sakit</td>
                    <td className="p-2 border border-slate-800 text-center font-bold">
                      {reportData.attendance?.sakit || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-800">Izin</td>
                    <td className="p-2 border border-slate-800 text-center font-bold">
                      {reportData.attendance?.izin || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-800">
                      Tanpa Keterangan
                    </td>
                    <td className="p-2 border border-slate-800 text-center font-bold text-red-600">
                      {reportData.attendance?.alpha || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="w-1/2">
              <h3 className="font-bold mb-2 text-school-navy text-lg border-b border-slate-200 pb-1 inline-block">
                C. Ekstrakurikuler
              </h3>
              <table className="w-full text-sm border border-slate-800">
                <thead className="bg-slate-100 print:bg-slate-200">
                  <tr>
                    <th className="border border-slate-800 p-2 text-left">
                      Kegiatan
                    </th>
                    <th className="border border-slate-800 p-2 text-center">
                      Predikat
                    </th>
                    <th className="border border-slate-800 p-2 text-left">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-800">-</td>
                    <td className="p-2 border border-slate-800 text-center">
                      -
                    </td>
                    <td className="p-2 border border-slate-800">-</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-800">-</td>
                    <td className="p-2 border border-slate-800 text-center">
                      -
                    </td>
                    <td className="p-2 border border-slate-800">-</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-800">-</td>
                    <td className="p-2 border border-slate-800 text-center">
                      -
                    </td>
                    <td className="p-2 border border-slate-800">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4 print:break-inside-avoid">
            <h3 className="font-bold mb-2 text-school-navy text-lg border-b border-slate-200 pb-1 inline-block">
              D. Catatan Wali Kelas
            </h3>
            <div className="border border-slate-800 p-4 min-h-[80px] text-sm leading-relaxed rounded-sm italic">
              "Pertahankan prestasimu dan teruslah belajar dengan giat."
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-3 gap-8 mt-16 text-center text-sm print:break-inside-avoid">
            <div>
              <p className="mb-20">
                Mengetahui,
                <br />
                Orang Tua/Wali
              </p>
              <p className="border-t border-black w-40 mx-auto"></p>
            </div>
            <div>
              <p className="mb-20">
                Mengetahui,
                <br />
                Kepala Sekolah
              </p>
              <p className="font-bold underline">Dr. Budi Santoso, M.Pd</p>
              <p>NIP. 19700101 199501 1 001</p>
            </div>
            <div>
              <p className="mb-20">
                Kota Coding,{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                <br />
                Wali Kelas
              </p>
              <p className="font-bold underline">Siti Aminah, S.Pd</p>
              <p>NIP. 19850505 201001 2 005</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end print:hidden fixed bottom-8 right-8 z-50">
            <Button
              onClick={handlePrint}
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
