import { Star, Trophy, Group, Heart } from "iconoir-react";

const AboutPage = () => {
  return (
    <div className="pt-20 md:pt-24 bg-white min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-school-navy mb-8 text-center">
          Tentang Kami
        </h1>
        <div className="w-24 h-1 bg-school-gold mx-auto mb-16"></div>

        {/* Vision & Mission Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
            <h2 className="font-serif text-3xl font-bold text-school-navy">
              Visi & Misi
            </h2>
            <p>
              <strong className="text-school-navy">Visi:</strong> Menjadi
              lembaga pendidikan unggulan yang mencetak generasi berkarakter
              luhur, berprestasi akademis, dan berwawasan global.
            </p>
            <div>
              <strong className="text-school-navy">Misi:</strong>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  Menyelenggarakan pendidikan berkualitas dengan standar
                  internasional.
                </li>
                <li>
                  Membangun lingkungan belajar yang kondusif, inovatif, dan
                  berpusat pada siswa.
                </li>
                <li>
                  Menanamkan nilai-nilai religius dan kedisiplinan dalam setiap
                  aktivitas sekolah.
                </li>
              </ul>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-4 -right-4 w-full h-full border-4 border-school-gold -z-10"></div>
            {/* Updated to Mentor Image for context about teaching/environment */}
            <img
              src="/img/MentorIMGAbout.webp"
              alt="Mentoring Session"
              className="w-full h-auto shadow-xl object-cover"
            />
          </div>
        </div>

        {/* New: Core Values (Nilai Inti) */}
        <div className="mt-24 mb-24">
          <div className="text-center mb-16">
            <span className="text-school-gold uppercase tracking-widest text-sm font-bold block mb-2">
              Nilai Inti
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-school-navy">
              Filosofi Pendidikan Kami
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-slate-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto bg-school-navy text-school-gold rounded-full flex items-center justify-center mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-school-navy mb-2">
                Excellence
              </h3>
              <p className="text-slate-600 text-sm">
                Berkomitmen pada standar kualitas tertinggi dalam akademik dan
                perilaku.
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto bg-school-navy text-school-gold rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-school-navy mb-2">
                Integrity
              </h3>
              <p className="text-slate-600 text-sm">
                Menjunjung tinggi kejujuran dan etika dalam setiap tindakan.
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto bg-school-navy text-school-gold rounded-full flex items-center justify-center mb-4">
                <Group className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-school-navy mb-2">
                Community
              </h3>
              <p className="text-slate-600 text-sm">
                Membangun kepedulian sosial dan kolaborasi yang harmonis.
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto bg-school-navy text-school-gold rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-school-navy mb-2">
                Innovation
              </h3>
              <p className="text-slate-600 text-sm">
                Terus beradaptasi dengan kemajuan teknologi dan metode
                pembelajaran.
              </p>
            </div>
          </div>
        </div>

        {/* New: History Timeline (Milestone) */}
        <section className="py-12 border-t border-slate-100">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-school-navy">
              Perjalanan Kami
            </h2>
          </div>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {/* Item 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-school-gold text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <div className="font-bold text-xs">2010</div>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow">
                <div className="font-bold text-school-navy mb-1">Berdiri</div>
                <p className="text-slate-600 text-sm">
                  SMP Satya Cendekia didirikan dengan angkatan pertama 50 siswa.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-school-gold text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <div className="font-bold text-xs">2015</div>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow">
                <div className="font-bold text-school-navy mb-1">
                  Akreditasi A
                </div>
                <p className="text-slate-600 text-sm">
                  Meraih akreditasi unggul dan menjadi sekolah percontohan.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-school-gold text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <div className="font-bold text-xs">2024</div>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow">
                <div className="font-bold text-school-navy mb-1">
                  Kampus Baru
                </div>
                <p className="text-slate-600 text-sm">
                  Peresmian gedung baru dengan fasilitas smart classroom dan
                  sport center modern.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Principal Message Section */}
        <div className="bg-school-navy text-white rounded-lg shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-12">
            <div className="md:col-span-4 relative h-96 md:h-auto">
              <img
                src="/img/KepalaSekolahAboutIMG.webp"
                alt="Kepala Sekolah"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-school-navy/20"></div>
            </div>
            <div className="md:col-span-8 p-12 flex flex-col justify-center space-y-6">
              <h2 className="font-serif text-3xl font-bold text-school-gold">
                Sambutan Kepala Sekolah
              </h2>
              <p className="text-lg font-light leading-relaxed italic">
                "Selamat datang di SMP Satya Cendekia. Kami percaya bahwa setiap
                anak memiliki potensi luar biasa yang perlu diasah dengan
                ketulusan dan dedikasi. Di sini, kami tidak hanya mengajar,
                tetapi mendidik dengan hati untuk masa depan yang gemilang."
              </p>
              <div>
                <div className="font-bold text-xl">Dr. Andi Wijaya, M.Pd.</div>
                <div className="text-school-gold text-sm uppercase tracking-widest">
                  Kepala Sekolah
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
