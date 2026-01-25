const AboutPage = () => {
  return (
    <div className="pt-24 bg-white min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <h1 className="font-serif text-5xl font-bold text-school-navy mb-8 text-center">
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
            <p>
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
            </p>
          </div>
          <div className="relative">
            <div className="absolute -top-4 -right-4 w-full h-full border-4 border-school-gold -z-10"></div>
            {/* Updated to Mentor Image for context about teaching/environment */}
            <img
              src="/img/MentorIMGAbout.jpeg"
              alt="Mentoring Session"
              className="w-full h-auto shadow-xl object-cover"
            />
          </div>
        </div>

        {/* Principal Message Section */}
        <div className="bg-school-navy text-white rounded-lg shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-12">
            <div className="md:col-span-4 relative h-96 md:h-auto">
              <img
                src="/img/KepalaSekolahAboutIMG.jpeg"
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
