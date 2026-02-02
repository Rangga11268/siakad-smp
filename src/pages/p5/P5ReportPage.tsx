import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SystemRestart, Printer, Search } from "iconoir-react";
import { useReactToPrint } from "react-to-print";

const P5ReportPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/p5");
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudents = async (projectId: string) => {
    try {
      const project: any = projects.find((p: any) => p._id === projectId);
      if (project) {
        const res = await api.get(`/academic/students/level/${project.level}`);
        setStudents(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const generateReport = async () => {
    if (!selectedProject || !selectedStudent) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/p5/report/${selectedProject}/${selectedStudent}`,
      );
      setReportData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Rapor_P5_${reportData?.student?.profile?.fullName || ""}`,
  });

  return (
    <div className="space-y-8">
      <div className="noprint items-end justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy flex items-center gap-2">
            <Printer className="w-8 h-8 text-school-gold" />
            Cetak Rapor Projek (P5)
          </h2>
          <p className="text-slate-500 mt-1 max-w-xl">
            Generate dan cetak rapor projek penguatan profil pelajar Pancasila
            (P5) sesuai format Kurikulum Merdeka.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select
            onValueChange={(v) => {
              setSelectedProject(v);
              fetchStudents(v);
            }}
          >
            <SelectTrigger className="w-full sm:w-[250px] bg-slate-50 border-slate-300 focus:ring-school-gold">
              <SelectValue placeholder="Pilih Projek..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p: any) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-full sm:w-[250px] bg-slate-50 border-slate-300 focus:ring-school-gold">
              <SelectValue placeholder="Pilih Siswa..." />
            </SelectTrigger>
            <SelectContent>
              {students.map((s: any) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.profile?.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={generateReport}
            disabled={loading}
            className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold transition-all shadow-md"
          >
            {loading ? (
              <SystemRestart className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Generate Rapor
          </Button>
        </div>
      </div>

      {reportData && (
        <div className="flex flex-col items-center">
          <style>
            {`
              @media print {
                @page {
                  size: A4;
                  margin: 0;
                }
                body {
                  -webkit-print-color-adjust: exact;
                }
                .print-container {
                  width: 100% !important;
                  height: auto !important;
                  min-height: 0 !important;
                  margin: 0 !important;
                  padding: 15mm !important; /* Increased padding for better look */
                  box-shadow: none !important;
                  border: none !important;
                }
              }
            `}
          </style>

          <Button
            onClick={handlePrint}
            className="mb-8 noprint bg-school-gold text-school-navy hover:bg-yellow-500 font-bold px-8 shadow-lg transform hover:-translate-y-1 transition-all"
          >
            <Printer className="mr-2 h-5 w-5" /> Cetak PDF Rapor
          </Button>

          {/* REPORT PREVIEW (A4 Styled) - Polished & Balanced */}
          <div
            ref={componentRef}
            className="print-container w-[210mm] min-h-[297mm] bg-white px-[15mm] py-[10mm] shadow-lg text-black text-sm leading-tight mx-auto"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            {/* Header */}
            <div className="text-center mb-4 relative">
              <div className="border-b-[3px] border-black pb-1 mb-0.5" />
              <div className="border-b border-black mb-2" />
              <h1 className="text-xl font-bold uppercase tracking-wider">
                Rapor Projek Penguatan Profil Pelajar Pancasila
              </h1>
              <h2 className="text-lg font-bold">SMP PUTRA BANGSA</h2>
              <p className="text-xs italic">
                Jl. Pendidikan No. 123, Kota Belajar. Telp: (021) 12345678
              </p>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-6 mb-4 text-xs">
              <div>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="font-bold w-28">Nama Siswa</td>
                      <td>: {reportData.student.profile.fullName}</td>
                    </tr>
                    <tr>
                      <td className="font-bold">NISN</td>
                      <td>: {reportData.student.profile.nisn}</td>
                    </tr>
                    <tr>
                      <td className="font-bold">Kelas</td>
                      <td>: {reportData.student.profile.class}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="font-bold w-24">Fase</td>
                      <td>: D</td>
                    </tr>
                    <tr>
                      <td className="font-bold">Tahun Ajaran</td>
                      <td>
                        : {reportData.project.academicYear || "2024/2025"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Project Info */}
            <div className="mb-4 bg-gray-50 p-3 border border-gray-300 rounded-sm">
              <h3 className="font-bold mb-1 text-sm uppercase">
                {reportData.project.title}
              </h3>
              <p className="mb-2 text-xs">
                <strong>Tema:</strong> {reportData.project.theme}
              </p>
              <p className="text-justify text-xs leading-relaxed">
                {reportData.project.description}
              </p>
            </div>

            {/* Assessment Table */}
            <table className="w-full border-collapse border border-black mb-4 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left w-[40%]">
                    Dimensi / Elemen
                  </th>
                  <th className="border border-black p-2 text-left">
                    Sub-Elemen
                  </th>
                  <th className="border border-black p-1 text-center w-8">
                    BB
                  </th>
                  <th className="border border-black p-1 text-center w-8">
                    MB
                  </th>
                  <th className="border border-black p-1 text-center w-8">
                    BSH
                  </th>
                  <th className="border border-black p-1 text-center w-8">
                    SB
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.project.targets.map((target: any) => {
                  const score = reportData.assessment.scores?.find(
                    (s: any) => s.targetId === target._id,
                  )?.score;
                  return (
                    <tr key={target._id}>
                      <td className="border border-black p-2 align-top">
                        <div className="font-bold mb-1">{target.dimension}</div>
                        <div className="pl-3 text-[11px] text-gray-700 italic">
                          - {target.element}
                        </div>
                      </td>
                      <td className="border border-black p-2 align-top text-[11px]">
                        {target.subElement}
                      </td>
                      <td className="border border-black p-1 text-center align-middle font-bold text-lg">
                        {score === "BB" ? "✔" : ""}
                      </td>
                      <td className="border border-black p-1 text-center align-middle font-bold text-lg">
                        {score === "MB" ? "✔" : ""}
                      </td>
                      <td className="border border-black p-1 text-center align-middle font-bold text-lg">
                        {score === "BSH" ? "✔" : ""}
                      </td>
                      <td className="border border-black p-1 text-center align-middle font-bold text-lg">
                        {score === "SB" ? "✔" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Notes */}
            <div className="mb-4">
              <h4 className="font-bold mb-1 text-sm">Catatan Proses:</h4>
              <div className="border border-black p-2 min-h-[40px] text-xs leading-relaxed">
                {reportData.assessment.finalNotes || "-"}
              </div>
            </div>

            {/* Legend */}
            <div className="mb-6">
              <h4 className="font-bold mb-1 text-xs uppercase text-gray-600">
                Keterangan:
              </h4>
              <ul className="list-disc pl-5 text-[10px] grid grid-cols-2 gap-x-4 text-gray-700">
                <li>
                  <strong>BB (Belum Berkembang)</strong>: Siswa masih
                  membutuhkan bimbingan dalam mengembangkan kemampuan.
                </li>
                <li>
                  <strong>MB (Mulai Berkembang)</strong>: Siswa mulai
                  menunjukkan kemampuan sesuai tujuan projek.
                </li>
                <li>
                  <strong>BSH (Berkembang Sesuai Harapan)</strong>: Siswa telah
                  mengembangkan kemampuan hingga tahap ajeg.
                </li>
                <li>
                  <strong>SB (Sangat Berkembang)</strong>: Siswa mengembangkan
                  kemampuan melampaui harapan.
                </li>
              </ul>
            </div>

            {/* Signatures - Balanced Layout */}
            <div className="grid grid-cols-3 gap-4 mt-auto px-2 text-xs">
              {/* Left: Parent */}
              <div className="text-center">
                <p className="mb-16">
                  Mengetahui,
                  <br />
                  Orang Tua/Wali
                </p>
                <p className="border-b border-black w-32 mx-auto"></p>
              </div>

              {/* Center: Facilitator */}
              <div className="text-center">
                <p className="mb-1">
                  Kota Belajar,{" "}
                  {new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="mb-16">Guru Fasilitator</p>
                <p className="font-bold border-b border-black w-32 mx-auto">
                  ( ........................... )
                </p>
                <p className="mt-1">NIP. -</p>
              </div>

              {/* Right: Principal */}
              <div className="text-center">
                <p className="mb-16">
                  Mengetahui,
                  <br />
                  Kepala Sekolah
                </p>
                <p className="font-bold border-b border-black w-32 mx-auto">
                  Kepala Sekolah, M.Pd.
                </p>
                <p className="mt-1">NIP. 19800101 200501 1 001</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default P5ReportPage;
