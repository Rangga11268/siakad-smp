import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Xmark } from "iconoir-react";
import NavDropdown from "./NavDropdown";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Menu Configuration
  const menuItems = [
    { type: "link", label: "Beranda", href: "/" },
    {
      type: "dropdown",
      label: "Profil Sekolah",
      items: [
        { label: "Tentang Kami", href: "/about" },
        { label: "Fasilitas", href: "/facilities" },
        { label: "Kontak", href: "/contact" },
      ],
    },
    {
      type: "dropdown",
      label: "Informasi",
      items: [
        { label: "Berita & Artikel", href: "/news" },
        { label: "Program Akademik", href: "/academic" },
      ],
    },
  ];

  const getNavbarStyle = () => {
    if (isScrolled)
      return "bg-school-navy/90 backdrop-blur-md shadow-lg py-3 border-b border-white/10";
    if (!isHome) return "bg-school-navy py-4";
    return "bg-transparent py-6"; // Transparent on home top
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${getNavbarStyle()}`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/img/logoNoBg.webp"
              alt="Logo SMP Satya Cendekia"
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
            <div
              className={`flex flex-col ${isScrolled || !isHome ? "text-white" : "text-white"}`}
            >
              <span className="font-serif text-lg md:text-xl font-bold tracking-wide leading-none">
                SATYA CENDEKIA
              </span>
              <span className="text-[10px] md:text-xs tracking-[0.2em] font-medium opacity-80 uppercase">
                Sekolah Menengah Pertama
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item, idx) => {
              if (item.type === "dropdown") {
                return (
                  <NavDropdown
                    key={idx}
                    label={item.label}
                    items={item.items || []}
                    isActive={item.items?.some(
                      (sub) => location.pathname === sub.href,
                    )}
                  />
                );
              }
              return (
                <Link
                  key={idx}
                  to={item.href || "#"}
                  className={`text-sm font-medium tracking-wide uppercase transition-colors px-1 py-2 ${
                    location.pathname === item.href
                      ? "text-school-gold border-b-2 border-school-gold"
                      : "text-white/90 hover:text-school-gold border-b-2 border-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* PPDB Dropdown / CTA for Desktop */}
            <div className="hidden md:flex items-center">
              <NavDropdown
                label="PPDB"
                items={[
                  { label: "Info Pendaftaran", href: "/ppdb" },
                  { label: "Daftar Sekarang", href: "/ppdb/register" },
                  { label: "Cek Status", href: "/ppdb/status" },
                ]}
              />
              <Link to="/ppdb/register" className="ml-4">
                <Button className="bg-school-gold hover:bg-yellow-600 text-school-navy font-bold px-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  DAFTAR SEKARANG
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-school-navy text-white md:hidden flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-white/10">
              <span className="font-serif text-xl font-bold">MENU</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-white/80 hover:text-white"
              >
                <Xmark className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {menuItems.map((item, idx) => (
                <div key={idx} className="border-b border-white/5 pb-2">
                  {item.type === "link" ? (
                    <Link
                      to={item.href!}
                      className="block text-xl font-serif font-bold py-3 hover:text-school-gold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 mt-4 px-1">
                        {item.label}
                      </div>
                      {item.items?.map((sub) => (
                        <Link
                          key={sub.href}
                          to={sub.href}
                          className="block text-lg py-2 pl-4 text-white/80 hover:text-school-gold hover:translate-x-2 transition-all"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-8 border-t border-white/10 pt-8">
                <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                  PPDB Online
                </div>
                <Link
                  to="/ppdb/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-school-gold text-school-navy font-bold h-12 text-lg mb-3">
                    DAFTAR SEKARANG
                  </Button>
                </Link>
                <Link
                  to="/ppdb/status"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 h-12"
                  >
                    Cek Status Pendaftaran
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
