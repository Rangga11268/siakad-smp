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
            <div className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full font-medium text-sm mb-6">
              🚀 New: Modul Keuangan & P5 Ready!
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-slate-900 mb-6">
              Sistem Informasi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Akademik Modern
              </span>{" "}
              <br />
              Berbasis Digital.
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              Platform terintegrasi untuk manajemen sekolah (ERP) yang mendukung
              Kurikulum Merdeka. Kelola Nilai, P5, Keuangan, hingga Kesehatan
              Siswa dalam satu dashboard.
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xl shadow-indigo-600/20"
                >
                  Akses Portal Guru & Siswa
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg rounded-xl border-slate-300"
              >
                Pelajari Fitur
              </Button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"
                alt="Dashboard Preview"
                className="rounded-xl w-full h-auto object-cover"
              />

              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <ShieldCheck />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status Sistem</p>
                  <p className="font-bold text-sm">Aman & Terenkripsi</p>
                </div>
              </div>
            </div>

            {/* Background Blobs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-30 -z-10" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-300 rounded-full blur-3xl opacity-30 -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Ekosistem Sekolah Lengkap
            </h2>
            <p className="text-slate-600">
              Satu aplikasi untuk seluruh kebutuhan operasional sekolah Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-6 h-6 text-blue-600" />}
              title="Akademik & E-Rapor"
              desc="Input nilai TP/CP, generate rapor otomatis sesuai standar Kurikulum Merdeka."
              color="bg-blue-50"
            />
            <FeatureCard
              icon={<Activity className="w-6 h-6 text-rose-600" />}
              title="Projek P5"
              desc="Manajemen projek penguatan profil pelajar pancasila dengan penilaian dimensi."
              color="bg-rose-50"
            />
            <FeatureCard
              icon={<Wallet className="w-6 h-6 text-emerald-600" />}
              title="Keuangan & SPP"
              desc="Monitoring pembayaran siswa, generate tagihan massal, dan laporan keuangan."
              color="bg-emerald-50"
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-indigo-600" />}
              title="Kesiswaan (BK)"
              desc="Catat pelanggaran disiplin siswa dan manajemen prestasi akademik/non-akademik."
              color="bg-indigo-50"
            />
            <FeatureCard
              icon={<LayoutDashboard className="w-6 h-6 text-orange-600" />}
              title="Sarana Prasarana"
              desc="Inventaris aset sekolah, tracking kondisi barang, dan lokasi penempatan."
              color="bg-orange-50"
            />
            <FeatureCard
              icon={<Library className="w-6 h-6 text-cyan-600" />}
              title="E-Library & UKS"
              desc="Katalog buku digital, sirkulasi peminjaman, dan screening kesehatan siswa."
              color="bg-cyan-50"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="text-white font-bold text-2xl mb-4 flex items-center gap-2">
              <GraduationCap /> SMP Gak Ada Nama
            </div>
            <p className="max-w-sm text-slate-400">
              Jalan Pendidikan No. 123, Kota Pelajar. <br />
              Mencerdaskan kehidupan bangsa melalui teknologi.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Modul</h4>
            <ul className="space-y-2 text-sm">
              <li>Akademik</li>
              <li>Kesiswaan</li>
              <li>Keuangan</li>
              <li>Perpustakaan</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-sm">
              <li>admin@sekolah.id</li>
              <li>(021) 123-4567</li>
              <li>Senin - Jumat, 07:00 - 16:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Siakad SMP. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }: any) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
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
