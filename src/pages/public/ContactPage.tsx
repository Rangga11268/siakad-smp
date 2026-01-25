import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="relative min-h-screen pt-24 bg-slate-50">
      {/* Background with Overlay */}
      <div className="absolute top-0 w-full h-[50vh] bg-school-navy overflow-hidden">
        <img
          src="/img/KontakIMG2.jpeg"
          alt="Contact Banner"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-school-navy/80 to-slate-50"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 py-12">
        <h1 className="font-serif text-5xl font-bold text-school-gold mb-16 text-center drop-shadow-md">
          Hubungi Kami
        </h1>

        <div className="grid md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
          {/* Contact Info Side with Image Background */}
          <div className="relative bg-school-navy text-white p-12 flex flex-col justify-center min-h-[500px]">
            <img
              src="/img/KontakIMG.jpeg"
              alt="Reception"
              className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
            />
            <div className="relative z-10 space-y-8">
              <h3 className="font-serif text-3xl font-bold text-school-gold">
                Informasi Kontak
              </h3>
              <p className="text-white/80 text-lg">
                Kami siap membantu menjawab pertanyaan Anda seputar pendaftaran
                siswa baru, informasi akademik, dan lainnya.
              </p>

              <div className="space-y-8 mt-8">
                <div className="flex items-start gap-6">
                  <div className="p-3 bg-school-gold/20 rounded-lg">
                    <MapPin className="text-school-gold w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Alamat</h4>
                    <p className="text-white/80 leading-relaxed">
                      Jl. Pendidikan No. 123, Kebayoran Baru
                      <br />
                      Jakarta Selatan, DKI Jakarta 12345
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="p-3 bg-school-gold/20 rounded-lg">
                    <Phone className="text-school-gold w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Telepon</h4>
                    <p className="text-white/80">(021) 789-0123</p>
                    <p className="text-white/60 text-sm">
                      Mon - Fri, 08:00 - 16:00
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="p-3 bg-school-gold/20 rounded-lg">
                    <Mail className="text-school-gold w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Email</h4>
                    <p className="text-white/80">info@satyacendekia.sch.id</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-12 md:p-14 bg-white">
            <h3 className="font-serif text-2xl font-bold text-school-navy mb-8">
              Kirim Pesan
            </h3>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Nama Lengkap
                  </label>
                  <Input
                    placeholder="John Doe"
                    className="bg-slate-50 border-slate-200 focus:border-school-gold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    No. Telepon
                  </label>
                  <Input
                    placeholder="08..."
                    className="bg-slate-50 border-slate-200 focus:border-school-gold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  className="bg-slate-50 border-slate-200 focus:border-school-gold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Pesan Anda
                </label>
                <Textarea
                  placeholder="Tuliskan pertanyaan atau pesan Anda di sini..."
                  className="bg-slate-50 border-slate-200 min-h-[150px] focus:border-school-gold"
                />
              </div>
              <Button className="w-full bg-school-navy hover:bg-school-gold hover:text-school-navy text-white font-bold py-6 transition-all duration-300">
                Kirim Pesan
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
