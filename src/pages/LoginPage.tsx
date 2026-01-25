import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err: any) {
      setError("Login gagal. Periksa username/password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-slate-50 font-sans">
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-school-navy text-white items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/img/ImageSekolah1.webp"
            alt="School Building"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-school-navy/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-school-navy via-transparent to-school-gold/20"></div>
        </div>

        <div className="relative z-10 p-12 max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 border border-school-gold/30 mx-auto shadow-2xl">
              <img
                src="/img/logoNoBg.webp"
                alt="Logo"
                className="w-16 h-16 object-contain brightness-0 invert"
              />
            </div>
            <h1 className="font-serif text-4xl font-bold mb-6 tracking-wide leading-tight">
              SMP SATYA CENDEKIA
            </h1>
            <div className="w-20 h-1 bg-school-gold mx-auto mb-6"></div>
            <p className="text-lg text-white/80 leading-relaxed font-light mb-8">
              "Membangun generasi berkarakter luhur, berprestasi akademis, dan
              berwawasan global."
            </p>

            <div className="flex justify-center gap-6 text-xs font-medium tracking-widest text-school-gold uppercase">
              <span>Academic</span>
              <span>•</span>
              <span>Integrity</span>
              <span>•</span>
              <span>Leadership</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative bg-white">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center">
            <h2 className="font-serif text-4xl font-bold text-school-navy mb-2">
              Selamat Datang
            </h2>
            <p className="text-slate-500">
              Masuk ke Portal Sistem Informasi Akademik (SIAKAD)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-none bg-red-50 text-red-800 text-sm flex items-center gap-3 border-l-4 border-red-600"
              >
                <AlertCircle className="w-5 h-5" /> {error}
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="font-bold text-school-navy"
                >
                  Username / NISN
                </Label>
                <Input
                  id="username"
                  placeholder="Masukkan username Anda"
                  className="h-12 bg-slate-50 border-slate-200 focus:border-school-gold focus:ring-school-gold rounded-none transition-all"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="password"
                    className="font-bold text-school-navy"
                  >
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-xs text-school-gold hover:text-yellow-600 font-bold uppercase tracking-wider"
                  >
                    Lupa Password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 bg-slate-50 border-slate-200 focus:border-school-gold focus:ring-school-gold rounded-none transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                required
                className="data-[state=checked]:bg-school-gold border-slate-300 rounded-none"
              />
              <Label
                htmlFor="consent"
                className="text-sm text-slate-500 font-normal cursor-pointer select-none"
              >
                Saya menyetujui Ketentuan Pengguna.
              </Label>
            </div>

            <Button
              className="w-full h-14 text-lg font-bold bg-school-navy hover:bg-school-gold hover:text-school-navy text-white transition-all rounded-none duration-300 shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <span className="flex items-center gap-2">
                  MASUK PORTAL <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-8 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} SMP Satya Cendekia. <br />
              Sistem Terintegrasi untuk Masa Depan Pendidikan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
