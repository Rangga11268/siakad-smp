import React from "react";

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

interface ReportData {
  student: {
    profile: {
      fullName: string;
      nisn: string;
      class: string;
    };
  };
  academicYear: string;
  semester: string;
  reports: ReportItem[];
  attendance: {
    sakit: number;
    izin: number;
    alpha: number;
  };
}

interface ReportCardTemplateProps {
  data: ReportData;
  yearName: string;
}

export const ReportCardTemplate: React.FC<ReportCardTemplateProps> = ({
  data,
  yearName,
}) => {
  if (!data) return null;

  return (
    <div className="bg-white p-[15mm] print:p-[10mm] w-[210mm] min-h-[297mm] mx-auto text-slate-900 leading-tight box-border shadow-2xl print:shadow-none">
      {/* Header Rapor (Kop Surat) */}
      <div className="flex items-center justify-between border-b-2 border-double border-slate-950 pb-2 mb-4">
        <div className="flex items-center gap-4 w-full justify-center">
          <div className="w-16 h-16 flex items-center justify-center">
            <img
              src="/img/logoNoBg.webp"
              alt="Logo Sekolah"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold uppercase tracking-tight">
              YAYASAN PENDIDIKAN SATYA
            </h2>
            <h1 className="text-2xl font-serif font-black uppercase mb-0 text-slate-950">
              SMP SATYA CENDEKIA
            </h1>
            <p className="text-[10px] font-semibold text-slate-700">
              Terakreditasi A <span className="mx-2">|</span> NPSN: 69880460
            </p>
            <p className="text-[10px] text-slate-600">
              Jl. Raya Karanglo No. 12, Singosari, Malang, Jawa Timur 65153
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-base font-bold uppercase underline underline-offset-2 decoration-1">
          Laporan Hasil Belajar (Rapor)
        </h2>
        <p className="text-xs font-semibold text-slate-700">
          Kurikulum Merdeka
        </p>
      </div>

      {/* Identitas */}
      <div className="flex justify-between mb-4 text-[11px]">
        <div className="space-y-1">
          <table className="border-none text-[11px]">
            <tbody>
              <tr>
                <td className="w-32 font-semibold py-0.5 text-slate-700">
                  Nama Peserta Didik
                </td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5">{data.student.profile.fullName}</td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5 text-slate-700">NISN</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.student.profile.nisn}</td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5 text-slate-700">
                  Kelas / Fase
                </td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.student.profile.class} / D</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="space-y-1">
          <table className="border-none text-[11px]">
            <tbody>
              <tr>
                <td className="w-28 font-semibold py-0.5 text-slate-700">
                  Tahun Pelajaran
                </td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5">{yearName}</td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5 text-slate-700">
                  Semester
                </td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.semester || "Ganjil"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel Nilai */}
      <div className="mb-4">
        <h3 className="font-bold mb-1 text-sm border-b border-slate-200 pb-0 shadow-none inline-block">
          A. Nilai Akademik
        </h3>
        <div className="w-full overflow-hidden border border-slate-950">
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-950 p-1 w-[30px] text-center">
                  No
                </th>
                <th className="border border-slate-950 p-1 text-left">
                  Mata Pelajaran
                </th>
                <th className="border border-slate-950 p-1 w-[60px] text-center">
                  Nilai Akhir
                </th>
                <th className="border border-slate-950 p-1 text-left">
                  Capaian Kompetensi
                </th>
              </tr>
            </thead>
            <tbody>
              {data.reports.map((item, idx) => (
                <tr key={idx} className="print:break-inside-avoid">
                  <td className="border border-slate-950 p-1 text-center align-top">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-950 p-1 align-top font-semibold">
                    {item.subject.name}
                  </td>
                  <td className="border border-slate-950 p-1 text-center align-top font-bold text-sm">
                    {item.score}
                  </td>
                  <td className="border border-slate-950 p-1 text-justify align-top leading-[1.2]">
                    {item.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel Absensi & Ekstrakurikuler (Layout 2 Col) */}
      <div className="grid grid-cols-2 gap-4 mb-4 print:break-inside-avoid">
        <div>
          <h3 className="font-bold mb-1 text-sm border-b border-slate-200 pb-0 inline-block">
            B. Ketidakhadiran
          </h3>
          <table className="w-full text-[10px] border border-slate-950">
            <thead className="bg-slate-50">
              <tr>
                <th className="border border-slate-950 p-1 text-left">
                  Keterangan
                </th>
                <th className="border border-slate-950 p-1 text-center">
                  Jumlah Hari
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 border border-slate-950">Sakit</td>
                <td className="p-1 border border-slate-950 text-center font-bold">
                  {data.attendance?.sakit || 0}
                </td>
              </tr>
              <tr>
                <td className="p-1 border border-slate-950">Izin</td>
                <td className="p-1 border border-slate-950 text-center font-bold">
                  {data.attendance?.izin || 0}
                </td>
              </tr>
              <tr>
                <td className="p-1 border border-slate-950">
                  Tanpa Keterangan
                </td>
                <td className="p-1 border border-slate-950 text-center font-bold text-red-600">
                  {data.attendance?.alpha || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-sm border-b border-slate-200 pb-0 inline-block">
            C. Ekstrakurikuler
          </h3>
          <table className="w-full text-[10px] border border-slate-950">
            <thead className="bg-slate-50">
              <tr>
                <th className="border border-slate-950 p-1 text-left">
                  Kegiatan
                </th>
                <th className="border border-slate-950 p-1 text-center">
                  Predikat
                </th>
                <th className="border border-slate-950 p-1 text-left">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 border border-slate-950">-</td>
                <td className="p-1 border border-slate-950 text-center">-</td>
                <td className="p-1 border border-slate-950">-</td>
              </tr>
              <tr>
                <td className="p-1 border border-slate-950">-</td>
                <td className="p-1 border border-slate-950 text-center">-</td>
                <td className="p-1 border border-slate-950">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-4 print:break-inside-avoid">
        <h3 className="font-bold mb-1 text-sm border-b border-slate-200 pb-0 inline-block">
          D. Catatan Wali Kelas
        </h3>
        <div className="border border-slate-950 p-2 min-h-[40px] text-[10px] leading-tight rounded-sm italic">
          "Pertahankan prestasimu dan teruslah belajar dengan giat."
        </div>
      </div>

      {/* Tanda Tangan */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-[10px] print:break-inside-avoid">
        <div>
          <p className="mb-12">
            Mengetahui,
            <br />
            Orang Tua/Wali
          </p>
          <div className="border-t border-black w-24 mx-auto"></div>
        </div>
        <div>
          <p className="mb-12">
            Mengetahui,
            <br />
            Kepala Sekolah
          </p>
          <p className="font-bold underline">Dr. Budi Santoso, M.Pd</p>
          <p>NIP. 19700101 199501 1 001</p>
        </div>
        <div>
          <p className="mb-12">
            Malang,{" "}
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
    </div>
  );
};
