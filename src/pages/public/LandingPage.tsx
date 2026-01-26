import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Book,
  GraduationCap,
  StatsReport,
  User,
  Medal,
  Calendar,
  QuoteSolid,
  HelpCircle,
} from "iconoir-react";

const LandingPage = () => {
  return (
    <>
      {/* 2. Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/img/ImageSekolah1.webp"
            alt="School Atrium"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-school-navy/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-school-navy via-transparent to-transparent opacity-90"></div>
        </div>

        {/* Content */}
        <div className="container relative z-10 px-6 text-center text-white max-w-4xl mx-auto mt-20">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            Membangun Karakter,
            <br />
            <span className="text-school-gold italic">Meraih Prestasi.</span>
          </h1>
          <p className="text-lg md:text-2xl font-light text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            SMP Satya Cendekia: Where Integrity Meets Intellect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/about" className="w-full sm:w-auto">
              <Button className="bg-school-gold hover:bg-yellow-600 text-school-navy text-lg font-bold px-8 py-6 h-auto rounded-none w-full transition-transform hover:scale-105 duration-300">
                Jelajahi Sekolah Kami
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="text-school-navy border-white/30 hover:bg-white/10 text-lg px-8 py-6 h-auto rounded-none w-full backdrop-blur-sm"
              >
                Portal Login <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Introduction Section */}
      <section className="py-12 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-school-gold"></div>
                <h2 className="font-serif text-5xl md:text-6xl font-bold text-school-navy leading-tight mb-8 relative z-10">
                  Satya & <br />
                  <span className="text-school-gold">Cendekia.</span>
                </h2>
                <div className="w-20 h-1 bg-school-navy mb-8"></div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-8 text-lg text-slate-600 leading-relaxed font-light">
              <p>
                <span className="text-school-navy font-semibold text-xl">
                  SMP Satya Cendekia
                </span>{" "}
                berkomitmen untuk mencetak generasi pemimpin masa depan yang
                tidak hanya unggul secara akademis, tetapi juga memiliki
                integritas moral yang kokoh.
              </p>
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="flex gap-4">
                  <div className="p-3 bg-school-navy/5 h-fit text-school-gold">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold text-school-navy mb-2">
                      Academic Excellence
                    </h4>
                    <p className="text-sm">
                      Kurikulum berstandar internasional yang dirancang untuk
                      menantang dan mengembangkan potensi intelektual siswa.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-3 bg-school-navy/5 h-fit text-school-gold">
                    <Book className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold text-school-navy mb-2">
                      Character Building
                    </h4>
                    <p className="text-sm">
                      Penanaman nilai-nilai luhur, kedisiplinan, dan tanggung
                      jawab sosial sebagai fondasi utama pendidikan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.1. Statistics Banner (New) */}
      <section className="bg-school-navy text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-school-gold/30">
            <div className="hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <User className="w-10 h-10 text-school-gold" />
              </div>
              <h3 className="text-4xl md:text-5xl font-bold font-serif mb-2">
                1250+
              </h3>
              <p className="uppercasetracking-widest text-sm text-school-gold">
                Siswa Aktif
              </p>
            </div>
            <div className="hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <GraduationCap className="w-10 h-10 text-school-gold" />
              </div>
              <h3 className="text-4xl md:text-5xl font-bold font-serif mb-2">
                98%
              </h3>
              <p className="uppercasetracking-widest text-sm text-school-gold">
                Lulusan PTN/Fav
              </p>
            </div>
            <div className="hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <Medal className="w-10 h-10 text-school-gold" />
              </div>
              <h3 className="text-4xl md:text-5xl font-bold font-serif mb-2">
                150+
              </h3>
              <p className="uppercasetracking-widest text-sm text-school-gold">
                Prestasi Tahunan
              </p>
            </div>
            <div className="hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <StatsReport className="w-10 h-10 text-school-gold" />
              </div>
              <h3 className="text-4xl md:text-5xl font-bold font-serif mb-2">
                30
              </h3>
              <p className="uppercasetracking-widest text-sm text-school-gold">
                Ekstrakurikuler
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Facilities Showcase Grid */}
      <section className="py-12 md:py-24 bg-school-navy text-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-school-gold uppercase tracking-widest text-sm font-bold mb-2 block">
              Lingkungan Belajar
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold">
              Fasilitas Berstandar Internasional
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-1">
            {/* Library */}
            <div className="group relative h-96 overflow-hidden cursor-pointer">
              <img
                src="/img/PerpusIMG.webp"
                alt="Modern Library"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-school-navy via-transparent to-transparent opacity-90"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="w-12 h-1 bg-school-gold mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                <h3 className="font-serif text-2xl font-bold mb-2">
                  Modern Library
                </h3>
                <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                  Pusat sumber belajar dengan koleksi digital dan fisik yang
                  komprehensif.
                </p>
              </div>
            </div>

            {/* Smart Classroom */}
            <div className="group relative h-96 overflow-hidden cursor-pointer md:-mt-8 md:mb-8 border-4 border-school-gold z-10 shadow-2xl">
              <img
                src="/img/RuangKelasIMG.webp"
                alt="Smart Classroom"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-school-navy via-transparent to-transparent opacity-80"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="font-serif text-2xl font-bold mb-2 text-school-gold">
                  Smart Classroom
                </h3>
                <p className="text-white/90 text-sm">
                  Ruang kelas interaktif dilengkapi teknologi pembelajaran
                  terkini.
                </p>
              </div>
            </div>

            {/* Lab */}
            <div className="group relative h-96 overflow-hidden cursor-pointer">
              <img
                src="/img/LaboratoriumIMG.webp"
                alt="Science Lab"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-school-navy via-transparent to-transparent opacity-90"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="w-12 h-1 bg-school-gold mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                <h3 className="font-serif text-2xl font-bold mb-2">
                  Science Laboratory
                </h3>
                <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                  Laboratorium sains modern untuk eksperimen dan penelitian
                  siswa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Latest News (New) */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-school-navy font-bold tracking-widest uppercase text-sm">
                Berita Terkini
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-school-navy mt-2">
                Kabar Sekolah
              </h2>
            </div>
            <Link
              to="#"
              className="hidden md:flex items-center text-school-gold hover:text-school-navy font-bold transition-colors"
            >
              Lihat Semua Berita <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={`/img/AkademikIMG${i === 1 ? "" : "2"}.webp`} // Placeholder logic
                    alt="News Thumbnail"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-school-gold text-school-navy font-bold text-xs px-3 py-1 rounded-full flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> 12 Jan 2026
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-school-navy/60 uppercase tracking-wider mb-2 block">
                    Prestasi
                  </span>
                  <h3 className="font-serif text-xl font-bold text-school-navy mb-3 group-hover:text-school-gold transition-colors">
                    Siswa Satya Cendekia Raih Emas di Olimpiade Sains
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                  <Link
                    to="#"
                    className="text-school-navy font-bold text-sm flex items-center hover:underline"
                  >
                    Baca Selengkapnya
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials (New) */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <QuoteSolid className="w-12 h-12 text-school-gold mx-auto mb-4 opacity-50" />
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-school-navy mb-4">
              Kata Mereka
            </h2>
            <p className="text-slate-500">
              Apa kata orang tua dan alumni tentang Satya Cendekia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl relative">
              <div className="flex gap-1 text-school-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-slate-700 italic text-lg mb-6 leading-relaxed">
                "Sekolah ini tidak hanya fokus pada nilai akademis, tetapi juga
                pembentukan karakter anak saya sangat terasa. Guru-gurunya
                sangat perhatian dan fasilitasnya luar biasa."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-school-navy rounded-full flex items-center justify-center text-white font-bold font-serif">
                  BP
                </div>
                <div>
                  <h4 className="font-bold text-school-navy">Budi Pratama</h4>
                  <p className="text-xs text-slate-500">Orang Tua Siswa</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl relative">
              <div className="flex gap-1 text-school-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-slate-700 italic text-lg mb-6 leading-relaxed">
                "Masuk ke universitas impian jadi lebih mudah berkat bimbingan
                intensif di sini. Lingkungan belajarnya kompetitif tapi tetap
                mendukung satu sama lain."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-school-gold rounded-full flex items-center justify-center text-school-navy font-bold font-serif">
                  AD
                </div>
                <div>
                  <h4 className="font-bold text-school-navy">Adinda Putri</h4>
                  <p className="text-xs text-slate-500">Alumni 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section (New) */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-school-navy font-bold tracking-widest uppercase text-sm">
              Tanya Jawab
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-school-navy mt-2">
              Sering Ditanyakan (FAQ)
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Kapan pendaftaran siswa baru (PPDB) dibuka?",
                a: "Pendaftaran gelombang pertama dibuka mulai bulan November hingga Januari setiap tahunnya.",
              },
              {
                q: "Apakah ada beasiswa untuk siswa berprestasi?",
                a: "Ya, kami menyediakan beasiswa penuh dan parsial untuk siswa dengan prestasi akademik maupun non-akademik tingkat nasional.",
              },
              {
                q: "Bagaimana sistem kurikulum yang diterapkan?",
                a: "Kami menggunakan Kurikulum Merdeka yang diperkaya dengan program Cambridge Checkpoint untuk mata pelajaran sains, matematika, dan bahasa Inggris.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-slate-100 hover:border-school-gold/50 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-school-navy text-lg group-hover:text-school-gold transition-colors">
                    {faq.q}
                  </h4>
                  <HelpCircle className="w-6 h-6 text-slate-300 group-hover:text-school-gold" />
                </div>
                <p className="text-slate-600 mt-2 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Call to Action (New) */}
      <section className="relative py-24 bg-school-navy overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-school-gold/10 mix-blend-overlay"></div>
          <div className="w-96 h-96 bg-school-gold/20 rounded-full blur-3xl absolute -top-24 -left-24"></div>
          <div className="w-96 h-96 bg-blue-500/20 rounded-full blur-3xl absolute bottom-0 right-0"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            Siap Bergabung Bersama Kami?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 font-light">
            Jadilah bagian dari komunitas pembelajar masa depan di SMP Satya
            Cendekia. Pendaftaran Tahun Ajaran 2026/2027 telah dibuka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ppdb/register">
              <Button className="bg-school-gold hover:bg-yellow-500 text-school-navy font-bold text-lg px-8 py-6 h-auto w-full sm:w-auto">
                Daftar Sekarang
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline"
                className="border-white/30 text-school-navy hover:bg-white/10 text-lg px-8 py-6 h-auto w-full sm:w-auto font-bold"
              >
                Hubungi Kami
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
