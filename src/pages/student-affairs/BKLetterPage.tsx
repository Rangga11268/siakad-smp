import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, SystemRestart } from "iconoir-react";

const BKLetterPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (studentId) fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/bk/letter/${studentId}`);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Surat_Panggilan_${data?.student?.profile?.fullName || ""}`,
  });

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <SystemRestart className="animate-spin" />
      </div>
    );

  if (!data) return <div>Data tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 noprint">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <h2 className="text-2xl font-bold">Cetak Surat Panggilan</h2>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Cetak PDF
        </Button>
      </div>

      {/* LETTER PREVIEW (A4) */}
      <div className="flex justify-center bg-gray-100 p-8">
        <div
          ref={componentRef}
          className="w-[210mm] min-h-[297mm] bg-white p-[25mm] shadow-lg text-black leading-relaxed"
          style={{ fontFamily: "Times New Roman, serif", fontSize: "12pt" }}
        >
          {/* KOP SURAT */}
          <div className="text-center border-b-4 border-black pb-4 mb-8">
            <h1 className="text-xl font-bold uppercase tracking-wider">
              SMP PUTRA BANGSA
            </h1>
            <p className="text-sm">
              Jl. Pendidikan No. 123, Kota Belajar, Indonesia
            </p>
            <p className="text-sm">
              Telp: (021) 12345678 | Email: admin@sekolah.id
            </p>
          </div>

          <div className="flex justify-between mb-8">
            <div>
              <p>Nomor : 421/BK/{new Date().getFullYear()}</p>
              <p>Lamp : -</p>
              <p>
                Hal : <strong>{data.letterType}</strong>
              </p>
            </div>
            <div>
              <p>
                Kota Belajar,{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <p className="mb-4">
            Yth. Orang Tua / Wali Murid dari:
            <br />
            <strong>{data.student.profile.fullName}</strong>
            <br />
            Kelas {data.student.profile.class}
            <br />
            di Tempat
          </p>

          <p className="mb-4 text-justify indent-8">Dengan hormat,</p>

          <p className="mb-4 text-justify indent-8">
            Berdasarkan catatan Bagian Kesiswaan & Bimbingan Konseling (BK),
            kami memberitahukan bahwa putra/putri Bapak/Ibu telah melakukan
            pelanggaran tata tertib sekolah dengan rincian akumulasi poin
            sebagai berikut:
          </p>

          <div className="mb-6 px-8 py-4 bg-gray-50 border border-gray-200">
            <p>
              <strong>
                Total Poin Pelanggaran:{" "}
                <span className="text-red-600">{data.totalPoints}</span>
              </strong>
            </p>
            <p className="mt-2 font-bold underline">
              Riwayat Pelanggaran Terakhir:
            </p>
            <ul className="list-disc pl-5 text-sm mt-1">
              {data.incidents.map((inc: any) => (
                <li key={inc._id}>
                  {new Date(inc.date).toLocaleDateString()} - {inc.type} (
                  {inc.point} Poin) <br />
                  <span className="italic text-gray-600">
                    "{inc.description}"
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mb-4 text-justify indent-8">
            Sehubungan dengan hal tersebut, kami mengharap kehadiran Bapak/Ibu
            Orang Tua/Wali Murid di sekolah pada:
          </p>

          <table className="mb-6 ml-8">
            <tbody>
              <tr>
                <td className="w-32">Hari / Tanggal</td>
                <td>: ___________________________</td>
              </tr>
              <tr>
                <td>Waktu</td>
                <td>: 08.00 - 10.00 WIB</td>
              </tr>
              <tr>
                <td>Tempat</td>
                <td>: Ruang BK SMP Putra Bangsa</td>
              </tr>
              <tr>
                <td>Agenda</td>
                <td>: Pembinaan & Konsultasi Siswa</td>
              </tr>
            </tbody>
          </table>

          <p className="mb-8 text-justify indent-8">
            Mengingat pentingnya hal ini demi masa depan putra/putri Bapak/Ibu,
            kami sangat mengharapkan kehadirannya tepat pada waktunya. Atas
            perhatian dan kerjasamanya kami ucapkan terima kasih.
          </p>

          <div className="flex justify-between mt-16 text-center">
            <div className="w-64">
              <p>Mengetahui,</p>
              <p>Kepala Sekolah</p>
              <br />
              <br />
              <br />
              <br />
              <p className="font-bold border-t border-black inline-block pt-1">
                Kepala Sekolah, M.Pd.
              </p>
              <p>NIP. 19800101 200501 1 001</p>
            </div>
            <div className="w-64">
              <p>Hormat Kami,</p>
              <p>Guru BK / Kesiswaan</p>
              <br />
              <br />
              <br />
              <br />
              <p className="font-bold border-t border-black inline-block pt-1">
                Koordinator BK
              </p>
              <p>NIP. -</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BKLetterPage;
