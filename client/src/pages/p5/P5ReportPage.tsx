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
import { Loader2, Printer, Search } from "lucide-react";
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
        `/p5/report/${selectedProject}/${selectedStudent}`
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 noprint">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Cetak Rapor Projek (P5)
          </h2>
          <p className="text-muted-foreground">
            Generate rapor projek format Merdeka.
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            onValueChange={(v) => {
              setSelectedProject(v);
              fetchStudents(v);
            }}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Pilih Projek" />
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
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Pilih Siswa" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s: any) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.profile?.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={generateReport} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Search />}{" "}
            Generate
          </Button>
        </div>
      </div>

      {reportData && (
        <div className="flex flex-col items-center">
          <Button onClick={handlePrint} className="mb-4 noprint">
            <Printer className="mr-2 h-4 w-4" /> Cetak PDF
          </Button>

          {/* REPORT PREVIEW (A4 Styled) */}
          <div
            ref={componentRef}
            className="w-[210mm] min-h-[297mm] bg-white p-[20mm] shadow-lg text-black text-sm leading-relaxed"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="text-xl font-bold uppercase">
                Rapor Projek Penguatan Profil Pelajar Pancasila
              </h1>
              <h2 className="text-lg font-bold">SMP PUTRA BANGSA</h2>
              <p>Jl. Pendidikan No. 123, Kota Belajar. Telp: (021) 12345678</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="font-semibold w-32">Nama Peserta Didik</td>
                      <td>: {reportData.student.profile.fullName}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">NISN</td>
                      <td>: {reportData.student.profile.nisn}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Kelas</td>
                      <td>: {reportData.student.profile.class}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="font-semibold w-32">Fase</td>
                      <td>: D</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Tahun Ajaran</td>
                      <td>
                        : {reportData.project.academicYear || "2024/2025"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6 bg-gray-50 p-4 border rounded">
              <h3 className="font-bold mb-1">
                Projek: {reportData.project.title}
              </h3>
              <p className="mb-2">
                <strong>Tema:</strong> {reportData.project.theme}
              </p>
              <p className="text-justify italic">
                {reportData.project.description}
              </p>
            </div>

            <table className="w-full border-collapse border border-black mb-6 text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2 text-left w-1/3">
                    Dimensi / Elemen
                  </th>
                  <th className="border border-black p-2 text-left">
                    Sub-Elemen
                  </th>
                  <th className="border border-black p-2 text-center w-10">
                    BB
                  </th>
                  <th className="border border-black p-2 text-center w-10">
                    MB
                  </th>
                  <th className="border border-black p-2 text-center w-10">
                    BSH
                  </th>
                  <th className="border border-black p-2 text-center w-10">
                    SB
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.project.targets.map((target: any) => {
                  const score = reportData.assessment.scores?.find(
                    (s: any) => s.targetId === target._id
                  )?.score;
                  return (
                    <tr key={target._id}>
                      <td className="border border-black p-2">
                        <div className="font-bold mb-1">{target.dimension}</div>
                        <div className="pl-2">- {target.element}</div>
                      </td>
                      <td className="border border-black p-2">
                        {target.subElement}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {score === "BB" ? "✔" : ""}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {score === "MB" ? "✔" : ""}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {score === "BSH" ? "✔" : ""}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {score === "SB" ? "✔" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mb-6">
              <h4 className="font-bold mb-2">Catatan Proses:</h4>
              <div className="border border-black p-4 min-h-[100px]">
                {reportData.assessment.finalNotes || "-"}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-bold mb-2">Keterangan:</h4>
              <ul className="list-disc pl-5 text-xs">
                <li>
                  <strong>BB</strong>: Belum Berkembang (Siswa masih membutuhkan
                  bimbingan dalam mengembangkan kemampuan)
                </li>
                <li>
                  <strong>MB</strong>: Mulai Berkembang (Siswa mulai
                  mengembangkan kemampuan namun masih butuh bimbingan)
                </li>
                <li>
                  <strong>BSH</strong>: Berkembang Sesuai Harapan (Siswa telah
                  mengembangkan kemampuan hingga tahap ajeg)
                </li>
                <li>
                  <strong>SB</strong>: Sangat Berkembang (Siswa mengembangkan
                  kemampuan melampaui harapan)
                </li>
              </ul>
            </div>

            <div className="flex justify-between mt-16 px-8">
              <div className="text-center">
                <p>Mengetahui,</p>
                <p>Orang Tua/Wali</p>
                <br />
                <br />
                <br />
                <p className="border-t border-black w-40 mx-auto mt-8"></p>
              </div>
              <div className="text-center">
                <p>
                  Kota Belajar,{" "}
                  {new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p>Koordinator Projek</p>
                <br />
                <br />
                <br />
                <p className="font-bold border-t border-black w-40 mx-auto mt-8 underline">
                  Guru Fasilitator
                </p>
                <p>NIP. -</p>
              </div>
            </div>
            <div className="text-center mt-12">
              <p>Mengetahui,</p>
              <p>Kepala Sekolah</p>
              <br />
              <br />
              <br />
              <p className="font-bold border-t border-black w-40 mx-auto mt-8 underline">
                Kepala Sekolah, M.Pd.
              </p>
              <p>NIP. 19800101 200501 1 001</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default P5ReportPage;
