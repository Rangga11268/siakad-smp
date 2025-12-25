import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, School, ArrowRight } from "lucide-react";
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
    <div className="flex min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-indigo-950 text-white items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-[1000px] h-[1000px] rounded-[40%] bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-[800px] h-[800px] rounded-[45%] bg-gradient-to-bl from-blue-600/20 to-pink-600/20 blur-3xl"
        />

        <div className="relative z-10 p-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/20">
              <School className="w-8 h-8 text-indigo-300" />
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight leading-tight">
              Selamat Datang di <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                SIAKAD SMP Gak Ada Nama
              </span>
            </h1>
            <p className="text-lg text-indigo-200/80 leading-relaxed">
              Sistem Informasi Akademik Terintegrasi. Mengelola Akademik,
              Kesiswaan, Keuangan, dan Ekosistem Sekolah dalam satu platform
              modern.
            </p>

            <div className="mt-8 flex gap-4 text-sm font-medium text-indigo-300/60">
              <span>• Kurikulum Merdeka</span>
              <span>• Integrasi P5</span>
              <span>• Digital School</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Portal Masuk
            </h2>
            <p className="text-muted-foreground mt-2">
              Silahkan masuk menggunakan akun Sekolah Anda.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 border border-red-100"
              >
                <AlertCircle className="w-4 h-4" /> {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username / NISN</Label>
                <Input
                  id="username"
                  placeholder="admin / guru / siswa"
                  className="h-12 bg-white/50 backdrop-blur-sm focus:bg-white transition-all border-slate-200"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Lupa Password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="h-12 bg-white/50 backdrop-blur-sm focus:bg-white transition-all border-slate-200 font-l"
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
                className="data-[state=checked]:bg-indigo-600 border-slate-300"
              />
              <Label
                htmlFor="consent"
                className="text-sm text-muted-foreground font-normal"
              >
                Saya menyetujui{" "}
                <span className="text-indigo-600 underline cursor-pointer">
                  Kebijakan Privasi
                </span>{" "}
                sekolah.
              </Label>
            </div>

            <Button
              className="w-full h-12 text-base font-medium bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <span className="flex items-center gap-2">
                  Masuk ke Dashboard <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-6 text-center text-xs text-slate-400">
            &copy; 2025 SMP Gak Ada Nama. All rights reserved. <br />
            Powered by SiakadEngine v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
