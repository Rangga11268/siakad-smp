import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Xmark } from "iconoir-react";

const PublicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
    { name: "Beranda", path: "/" },
    { name: "Tentang Kami", path: "/about" },
    { name: "Akademik", path: "/academic" },
    { name: "Fasilitas", path: "/facilities" },
    { name: "Kontak", path: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* 1. Header/Navigation */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled || !isHome
            ? "bg-school-navy/95 backdrop-blur-md shadow-lg py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/img/logoNoBg.webp"
              alt="Logo SMP Satya Cendekia"
              className="w-12 h-12 object-contain"
            />
            <span
              className={`font-serif text-xl font-bold tracking-wide ${
                isScrolled || !isHome ? "text-white" : "text-white"
              } hidden sm:block`}
            >
              SMP SATYA CENDEKIA
            </span>
            <span
              className={`font-serif text-xl font-bold tracking-wide ${
                isScrolled || !isHome ? "text-white" : "text-white"
              } sm:hidden`}
            >
              SMP SC
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium tracking-wide uppercase transition-colors ${
                  location.pathname === item.path
                    ? "text-school-gold"
                    : "text-white/90 hover:text-school-gold"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link to="/ppdb/register">
              <Button className="bg-school-gold hover:bg-yellow-600 text-school-navy font-bold px-6 rounded-none">
                PENDAFTARAN
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <Xmark className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-school-navy border-t border-white/10 p-6 flex flex-col gap-4 shadow-xl">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-white/90 hover:text-school-gold font-medium py-2 border-b border-white/5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/ppdb/register"
              className="w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Button className="w-full bg-school-gold hover:bg-yellow-600 text-school-navy font-bold rounded-none">
                PENDAFTARAN
              </Button>
            </Link>
          </div>
        )}
      </nav>

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
