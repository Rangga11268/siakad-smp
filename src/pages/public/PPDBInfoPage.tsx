import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  CheckCircle,
  ArrowRight,
  UserPlus,
  PageSearch,
  CreditCard,
  GraduationCap,
} from "iconoir-react";

const PPDBInfoPage = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "1. Registrasi Akun",
      desc: "Buat akun calon siswa melalui formulir pendaftaran online.",
    },
    {
      icon: PageSearch,
      title: "2. Lengkapi Data",
      desc: "Isi biodata diri, orang tua, dan unggah dokumen persyaratan.",
    },
    {
      icon: CreditCard,
      title: "3. Pembayaran",
      desc: "Lakukan pembayaran biaya pendaftaran sesuai instruksi.",
    },
    {
      icon: GraduationCap,
      title: "4. Tes Seleksi",
      desc: "Ikuti tes akademik dan wawancara sesuai jadwal.",
    },
    {
      icon: CheckCircle,
      title: "5. Pengumuman",
      desc: "Cek hasil seleksi melalui portal PPDB secara berkala.",
    },
  ];

  const requirements = [
    "Scan Akta Kelahiran (Asli)",
    "Scan Kartu Keluarga (Asli)",
    "Pas Foto 3x4 (Latar Merah/Biru)",
    "Scan Rapor Kelas 4-6 SD",
    "Surat Keterangan Lulus / Ijazah (Jika ada)",
    "Sertifikat Prestasi (Opsional)",
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Hero Section */}
      <section className="bg-school-navy text-white py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/img/school-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-school-gold/20 text-school-gold border border-school-gold/30 text-sm font-bold tracking-wider mb-6">
            PENERIMAAN PESERTA DIDIK BARU 2026/2027
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Bergabunglah Menjadi Bagian dari <br />
            <span className="text-school-gold">Generasi Cendekia</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Siapkan masa depan gemilang dengan pendidikan berkualitas,
            berkarakter, dan berwawasan global di SMP Satya Cendekia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ppdb/register">
              <Button className="bg-school-gold hover:bg-yellow-600 text-school-navy font-bold h-12 px-8 text-lg rounded-full w-full sm:w-auto">
                Daftar Sekarang
              </Button>
            </Link>
            <Link to="/ppdb/status">
              <Button
                variant="outline"
                className="border-white/30 text-school-navy hover:bg-white/10 h-12 px-8 text-lg rounded-full w-full sm:w-auto backdrop-blur-sm"
              >
                Cek Status Pendaftaran
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Alur Pendaftaran */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-school-navy mb-4">
              Alur Pendaftaran
            </h2>
            <p className="text-slate-600">
              Ikuti langkah-langkah mudah berikut untuk mendaftar.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group text-center">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center text-school-navy mb-6 group-hover:bg-school-navy group-hover:text-school-gold transition-colors duration-300">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-school-navy mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
                {idx !== steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Persyaratan & Jadwal */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Persyaratan */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-school-navy mb-8">
                Syarat Pendaftaran
              </h2>
              <div className="grid gap-4">
                {requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                    <span className="font-medium text-slate-700">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jadwal Box */}
            <div className="bg-school-navy text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Calendar className="w-48 h-48" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-8 relative z-10">
                Jadwal Kegiatan
              </h3>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-white/70">Gelombang 1</span>
                  <span className="font-bold text-school-gold">
                    Jan - Mar 2026
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-white/70">Gelombang 2</span>
                  <span className="font-bold text-school-gold">
                    Apr - Mei 2026
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-white/70">Tes Seleksi</span>
                  <span className="font-bold text-school-gold">
                    Setiap Sabtu
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-white/70">Daftar Ulang</span>
                  <span className="font-bold text-school-gold">Jun 2026</span>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-white/10">
                <p className="text-sm text-white/60 mb-2">Butuh bantuan?</p>
                <p className="font-bold text-lg">
                  Hubungi Panitia: 0812-3456-7890
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 bg-slate-100 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="font-serif text-3xl font-bold text-school-navy mb-6">
            Siap Bergabung Bersama Kami?
          </h2>
          <p className="text-slate-600 mb-10 text-lg">
            Kuota terbatas. Segera daftarkan putra-putri Anda sebelum kuota
            terpenuhi.
          </p>
          <Link to="/ppdb/register">
            <Button
              size="lg"
              className="bg-school-navy hover:bg-school-navy/90 text-white font-bold px-10 h-14 rounded-full shadow-xl"
            >
              Daftar Sekarang <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PPDBInfoPage;
