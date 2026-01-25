import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Activity,
  Wallet,
  Library,
  ShieldCheck,
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 scroll-smooth">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-900">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            SMP Gak Ada Nama
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
                Login Portal <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50 to-transparent -z-10" />

        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full font-medium text-sm mb-6 border border-indigo-100">
              🚀 PPDB 2024/2025 Telah Dibuka!
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900 mb-6">
              Sekolah Masa Depan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Putra Bangsa
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              Platform pendidikan digital terintegrasi. Memadukan kurikulum
              merdeka dengan teknologi manajemen sekolah modern.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/ppdb/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xl shadow-indigo-600/20"
                >
                  Daftar PPDB Online
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl border-slate-300 hover:bg-slate-50"
                >
                  Masuk Portal
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 text-slate-500">
              <div>
                <p className="text-2xl font-bold text-slate-900">1.2k+</p>
                <p className="text-sm">Siswa Aktif</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">50+</p>
                <p className="text-sm">Guru Profesional</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">100%</p>
                <p className="text-sm">Digital</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opactiy-0 group-hover:opacity-100 transition-opacity" />
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
                alt="School Activity"
                className="rounded-xl w-full h-auto object-cover"
              />

              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow z-20">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <ShieldCheck />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Terakreditasi A
                  </p>
                  <p className="font-bold text-sm">Unggul & Berprestasi</p>
                </div>
              </div>
            </div>

            {/* Background Blobs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-30 -z-10 animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-300 rounded-full blur-3xl opacity-30 -z-10 animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900">
              Ekosistem Digital Sekolah
            </h2>
            <p className="text-slate-600 text-lg">
              Satu aplikasi untuk seluruh kebutuhan operasional pendidikan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-6 h-6 text-indigo-600" />}
              title="LMS & E-Rapor"
              desc="Manajemen pembelajaran (LMS) terpadu dengan rapor kurikulum merdeka otomatis."
              color="bg-indigo-50"
            />
            <FeatureCard
              icon={<Activity className="w-6 h-6 text-rose-600" />}
              title="Projek P5"
              desc="Monitoring perkembangan projek penguatan profil pelajar pancasila secara realtime."
              color="bg-rose-50"
            />
            <FeatureCard
              icon={<Wallet className="w-6 h-6 text-emerald-600" />}
              title="E-SPP & Keuangan"
              desc="Sistem pembayaran digital, tagihan otomatis, dan transparansi laporan keuangan."
              color="bg-emerald-50"
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
              title="Bimbingan Konseling"
              desc="Pencatatan pelanggaran, prestasi, dan konseling siswa yang rapi dan aman."
              color="bg-blue-50"
            />
            <FeatureCard
              icon={<LayoutDashboard className="w-6 h-6 text-orange-600" />}
              title="Inventaris Sarpras"
              desc="Manajemen aset sekolah berbasis QR Code untuk kemudahan inventarisasi."
              color="bg-orange-50"
            />
            <FeatureCard
              icon={<Library className="w-6 h-6 text-cyan-600" />}
              title="Perpustakaan Digital"
              desc="Katalog buku online, sirkulasi peminjaman, dan kunjungan pustaka digital."
              color="bg-cyan-50"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Bergabung Bersama Kami?
          </h2>
          <p className="text-indigo-200 mb-8 max-w-2xl mx-auto text-lg">
            Daftarkan putra-putri Anda sekarang untuk tahun ajaran baru. Kuota
            terbatas.
          </p>
          <Link to="/ppdb/register">
            <Button
              size="lg"
              className="h-14 px-10 text-lg bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl font-bold"
            >
              Daftar Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 py-12 border-t border-slate-900">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="text-white font-bold text-2xl mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              SMP Putra Bangsa
            </div>
            <p className="max-w-sm text-slate-400 leading-relaxed">
              Jalan Pendidikan No. 123, Kota Pelajar. <br />
              Mewujudkan generasi emas yang berkarakter, cerdas, dan berdaya
              saing global melalui teknologi.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">
              Akses Cepat
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/ppdb/register"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Pendaftaran PPDB
                </Link>
              </li>
              <li>
                <Link
                  to="/ppdb/status"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Cek Status PPDB
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Login Guru & Siswa
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">
              Hubungi Kami
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>{" "}
                admin@smp-putrabangsa.sch.id
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>{" "}
                (021) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>{" "}
                Senin - Jumat, 07:00 - 16:00
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-900 mt-12 pt-8 text-center text-sm text-slate-600">
          &copy; {new Date().getFullYear()} Siakad SMP Putra Bangsa. Powered by
          AntiGravity.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }: any) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div
      className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-6`}
    >
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
