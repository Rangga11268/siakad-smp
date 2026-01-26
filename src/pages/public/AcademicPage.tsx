import {
  Medal,
  Book,
  Group,
  StatsReport,
  Code,
  MusicNote,
} from "iconoir-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AcademicPage = () => {
  return (
    <div className="pt-20 md:pt-24 bg-slate-50 min-h-screen">
      {/* Hero for Academic - Updated with Image */}
      <div className="relative bg-school-navy text-white py-20 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/img/AkademikIMG.webp"
            alt="Academic Header"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-school-navy via-school-navy/80 to-transparent"></div>
        </div>
        <div className="relative z-10 container mx-auto px-6">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">
            Akademik
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed">
            Kurikulum komprehensif yang dirancang untuk mempersiapkan siswa
            menghadapi tantangan global dengan landasan karakter yang kuat.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        {/* Curriculum Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mb-24 -mt-24 relative z-20">
          <Card className="border-t-8 border-t-school-gold shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <Book className="w-12 h-12 text-school-navy mb-4" />
              <CardTitle className="font-serif text-xl border-b pb-4">
                Kurikulum Nasional +
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed">
              Mengintegrasikan Kurikulum Merdeka dengan pengayaan materi
              internasional (Cambridge Checkpoint) untuk mata pelajaran Sains,
              Matematika, dan Bahasa Inggris.
            </CardContent>
          </Card>

          <Card className="border-t-8 border-t-school-gold shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <Group className="w-12 h-12 text-school-navy mb-4" />
              <CardTitle className="font-serif text-xl border-b pb-4">
                Character Building
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed">
              Program pembinaan karakter yang intensif melalui kegiatan
              mentoring, kepemimpinan, dan proyek sosial kemasyarakatan.
            </CardContent>
          </Card>

          <Card className="border-t-8 border-t-school-gold shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <Medal className="w-12 h-12 text-school-navy mb-4" />
              <CardTitle className="font-serif text-xl border-b pb-4">
                Ekstrakurikuler
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed">
              Beragam pilihan ekstrakurikuler (Robotics, Coding, Futsal, Basket,
              Tari Saman, dll) untuk mengembangkan bakat dan minat siswa.
            </CardContent>
          </Card>
        </div>

        {/* Feature Section with Image2 */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
            <img
              src="/img/AkademikIMG2.webp"
              alt="Activities"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-school-gold/10 mix-blend-overlay"></div>
          </div>
          <div className="space-y-6">
            <h2 className="font-serif text-4xl font-bold text-school-navy">
              Pembelajaran Interaktif
            </h2>
            <div className="w-20 h-1 bg-school-gold"></div>
            <p className="text-slate-600 text-lg leading-relaxed">
              Kami menerapkan metode pembelajaran yang berpusat pada siswa
              (*Student Centered Learning*). Guru berperan sebagai fasilitator
              yang mendorong siswa untuk berpikir kritis, berkolaborasi, dan
              memecahkan masalah nyata.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              Didukung dengan fasilitas teknologi digital dan laboratorium
              modern, pengalaman belajar menjadi lebih menyenangkan dan
              bermakna.
            </p>
          </div>
        </div>

        {/* New: Featured Extracurriculars */}
        <div className="bg-school-navy text-white rounded-3xl p-12 mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-school-gold rounded-full blur-[100px] opacity-20"></div>
          <div className="relative z-10 text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">
              Pengembangan Diri
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Lebih dari sekadar belajar, kami menyediakan wadah bagi siswa
              untuk mengeksplorasi bakat mereka.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: <Code className="w-8 h-8" />,
                name: "Coding & Robotics",
                desc: "Digital Skills",
              },
              {
                icon: <StatsReport className="w-8 h-8" />,
                name: "Science Club",
                desc: "Research & Experiments",
              },
              {
                icon: <MusicNote className="w-8 h-8" />,
                name: "Orchestra",
                desc: "Arts & Culture",
              },
              {
                icon: <Medal className="w-8 h-8" />,
                name: "Sports Team",
                desc: "Basketball & Futsal",
              },
            ].map((ex, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:bg-white/20 transition-all cursor-default"
              >
                <div className="text-school-gold mb-3">{ex.icon}</div>
                <h4 className="font-bold text-lg mb-1">{ex.name}</h4>
                <p className="text-xs text-white/60">{ex.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Preview Section (Placeholder) */}
        <div className="mb-20 bg-slate-100 p-12 rounded-3xl text-center">
          <h2 className="font-serif text-3xl font-bold text-school-navy mb-6">
            Jadwal & Kalender Akademik
          </h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Informasi detail mengenai jadwal pelajaran, ujian, dan libur
            akademik dapat diakses secara real-time melalui Portal Siswa
            (SIAKAD).
          </p>
          <button className="bg-school-navy text-white px-8 py-3 rounded-full font-bold hover:bg-school-gold hover:text-school-navy transition-colors">
            Login ke SIAKAD
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademicPage;
