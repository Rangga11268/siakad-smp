const FacilitiesPage = () => {
  const facilities = [
    {
      name: "Perpustakaan Digital",
      img: "/img/PerpusIMG.jpeg",
      desc: "Ribuan koleksi buku fisik dan e-book dengan area baca yang nyaman.",
    },
    {
      name: "Smart Classroom",
      img: "/img/RuangKelasIMG.png",
      desc: "Kelas ber-AC dengan proyektor interaktif, CCTV, dan WiFi berkecepatan tinggi.",
    },
    {
      name: "Laboratorium Sains",
      img: "/img/LaboratoriumIMG.jpeg",
      desc: "Peralatan lengkap untuk praktikum Fisika, Kimia, dan Biologi standar nasional.",
    },
    {
      name: "Gedung Olahraga (GOR)",
      img: "/img/GorFasilitas.jpeg",
      desc: "Lapangan indoor untuk Basket, Futsal, dan Badminton.",
    },
    {
      name: "Studio Seni & Musik",
      img: "/img/FasilitasSeni.jpeg",
      desc: "Ruang kedap suara dengan alat musik lengkap untuk pengembangan bakat seni.",
    },
    {
      name: "Ruang Kelas Modern",
      img: "/img/RuangKelasIMG2.jpeg",
      desc: "Desain ergonomis dengan pencahayaan natural untuk kenyamanan belajar.",
    },
    {
      name: "Lorong Inspirasi",
      img: "/img/lorongImg.jpeg",
      desc: "Area terbuka hijau dan galeri untuk pameran karya siswa.",
    },
  ];

  return (
    <div className="pt-24 bg-white min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <h1 className="font-serif text-5xl font-bold text-school-navy mb-8 text-center">
          Fasilitas Sekolah
        </h1>
        <div className="w-24 h-1 bg-school-gold mx-auto mb-16"></div>

        <p className="text-center text-slate-600 max-w-2xl mx-auto mb-16 text-lg">
          Kami menyediakan sarana dan prasarana terbaik untuk mendukung tumbuh
          kembang siswa, baik dalam bidang akademik maupun non-akademik.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((fac, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer h-80"
            >
              <img
                src={fac.img}
                alt={fac.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-school-navy via-school-navy/40 to-transparent opacity-80 transition-opacity duration-300"></div>

              <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="w-12 h-1 bg-school-gold mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-100"></div>
                <h3 className="font-serif text-xl font-bold text-white mb-2 group-hover:text-school-gold transition-colors">
                  {fac.name}
                </h3>
                <p className="text-white/90 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 leading-relaxed">
                  {fac.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacilitiesPage;
