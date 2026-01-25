import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Book, GraduationCap } from "iconoir-react";

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
    </>
  );
};

export default LandingPage;
