import { useEffect } from "react";
import { useLocation, Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/public/Navbar";

const PublicLayout = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* 1. Header/Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#001540] text-white pt-24 pb-12 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/img/logoNoBg.webp"
                  alt="Logo SMP Satya Cendekia"
                  className="w-12 h-12 object-contain brightness-0 invert"
                />
                <span className="font-serif text-xl font-bold">
                  SMP SATYA CENDEKIA
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Membangun generasi unggul yang berintegritas, cerdas, dan
                berwawasan global.
              </p>
            </div>

            <div className="md:col-span-1">
              <h4 className="font-serif text-lg font-bold mb-6 text-school-gold">
                Kontak Kami
              </h4>
              <ul className="space-y-4 text-sm text-white/80">
                <li className="flex gap-3">
                  <span className="font-bold text-school-gold">A.</span>
                  Jl. Pendidikan No. 123, Jakarta Selatan
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-school-gold">P.</span>
                  (021) 789-0123
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-school-gold">E.</span>
                  info@satyacendekia.sch.id
                </li>
              </ul>
            </div>

            <div className="md:col-span-1">
              <h4 className="font-serif text-lg font-bold mb-6 text-school-gold">
                Tautan Cepat
              </h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-school-gold transition-colors"
                  >
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link
                    to="/academic"
                    className="hover:text-school-gold transition-colors"
                  >
                    Akademik
                  </Link>
                </li>
                <li>
                  <Link
                    to="/ppdb/register"
                    className="hover:text-school-gold transition-colors"
                  >
                    Pendaftaran (PPDB)
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-school-gold transition-colors"
                  >
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-1">
              <h4 className="font-serif text-lg font-bold mb-6 text-school-gold">
                Portal Akademik
              </h4>
              <p className="text-white/60 text-sm mb-4">
                Akses sistem informasi akademik untuk siswa, guru, dan orang
                tua.
              </p>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full border-school-gold text-school-gold hover:bg-school-gold hover:text-school-navy rounded-none transition-colors"
                >
                  Login SIAKAD
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
            <p>
              &copy; {new Date().getFullYear()} SMP Satya Cendekia. All rights
              reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
