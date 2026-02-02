import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Menu, GraduationCap } from "iconoir-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import api from "@/services/api";

const DashboardLayout = () => {
  const { user } = useAuth();
  const [academicYear, setAcademicYear] = useState("2024/2025 (Ganjil)");

  useEffect(() => {
    const fetchActiveYear = async () => {
      try {
        const res = await api.get("/academic/years");
        const activeYear = res.data.find((y: any) => y.status === "active");
        if (activeYear) {
          setAcademicYear(`${activeYear.name} (${activeYear.semester})`);
        }
      } catch (error) {
        console.error("Failed to fetch academic year:", error);
      }
    };
    fetchActiveYear();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm z-30">
          {/* Mobile Sidebar Trigger */}
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-school-navy"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-r-0 w-72">
                  <Sidebar />
                </SheetContent>
              </Sheet>
            </div>

            {/* Academic Year Badge */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-school-navy/5 rounded-full border border-school-navy/10">
              <GraduationCap className="w-4 h-4 text-school-navy" />
              <span className="text-xs font-bold text-school-navy uppercase tracking-wider">
                Tahun Ajaran: {academicYear}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-500 hover:text-school-navy hover:bg-school-navy/5"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
            </Button>

            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-school-navy">
                  {user?.profile?.fullName || user?.username || "Pengguna"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                  {user?.role || "Guest"}
                </p>
              </div>

              <ProfileDropdown
                user={user}
                refreshUser={() => window.location.reload()}
              />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Profile Dropdown & Edit Component ---
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  LogOut,
  EditPencil,
  Camera,
  Key,
  Mail,
  Home,
  Group,
} from "iconoir-react";

const ProfileDropdown = ({
  user,
  refreshUser,
}: {
  user: any;
  refreshUser: () => void;
}) => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper to get full avatar URL
  const getAvatarUrl = (path: string | undefined) => {
    if (!path) return "https://github.com/shadcn.png";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`; // TODO: Use env var in production
  };

  // Form State
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    bio: "",
    birthPlace: "",
    birthDate: "",
    fatherName: "",
    motherName: "",
    phoneParent: "",
    avatar: "",
    email: "",
    // Password
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Load initial data when dialog opens
  useEffect(() => {
    if (isEditOpen && user) {
      setFormData({
        address: user.profile?.address || "",
        phone: user.profile?.phone || "",
        bio: user.profile?.bio || "",
        birthPlace: user.profile?.birthPlace || "",
        birthDate: user.profile?.birthDate
          ? new Date(user.profile.birthDate).toISOString().split("T")[0]
          : "",
        fatherName: user.profile?.family?.fatherName || "",
        motherName: user.profile?.family?.motherName || "",
        phoneParent: user.profile?.family?.phone || "",
        avatar: user.profile?.avatar || "",
        email: user.email || "",
        newPassword: "",
        confirmPassword: "",
      });
      setAvatarPreview(null);
    }
  }, [isEditOpen, user]);

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Show Local Preview Immediately
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      setLoading(true);
      // 2. Upload in Background
      const res = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 3. Update Real Data & Clear Preview (Switch to Remote URL)
      setFormData((prev) => ({ ...prev, avatar: res.data.url }));
      // Optional: Give a slight delay or just switch.. Keeping preview until save is also an option, but we want to ensure URL is valid.. Let's keep preview for smooth transition or switch?. Switching is safer to ensure users see what is actually saved.. But clearing it causes a flicker if the image isn't cached yet.. Let's leave avatarPreview active? No, `formData.avatar` should be the truth.. Actually, if we keep avatarPreview, we don't know if upload failed later?. We handle error below.

      toast({
        title: "Foto Terupload",
        description: "Jangan lupa simpan perubahan.",
      });
    } catch (error) {
      // Revert on error
      setAvatarPreview(null);
      toast({
        variant: "destructive",
        title: "Gagal Upload",
        description: "Pastikan format gambar valid.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      toast({
        variant: "destructive",
        title: "Password Tidak Cocok",
        description: "Konfirmasi password baru tidak sesuai.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        email: formData.email,
        profile: {
          address: formData.address,
          phone: formData.phone,
          bio: formData.bio,
          birthPlace: formData.birthPlace,
          birthDate: formData.birthDate,
          avatar: formData.avatar,
          family: {
            fatherName: formData.fatherName,
            motherName: formData.motherName,
            phone: formData.phoneParent,
          },
        },
      };

      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }

      await api.put("/auth/profile", payload);
      toast({
        title: "Berhasil",
        description: "Profil Anda telah diperbarui.",
      });
      setIsEditOpen(false);
      refreshUser();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Simpan",
        description: error.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="h-10 w-10 border-2 border-school-gold/20 shadow-sm hover:ring-2 hover:ring-school-gold transition-all cursor-pointer">
            <AvatarImage src={getAvatarUrl(user?.profile?.avatar)} />
            <AvatarFallback className="bg-school-navy text-school-gold font-bold">
              {user?.username?.substring(0, 2).toUpperCase() || "SC"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 rounded-xl shadow-lg border-slate-100"
        >
          <DropdownMenuLabel className="font-serif text-school-navy">
            Akun Saya
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsEditOpen(true)}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" /> Edit Profil
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 cursor-pointer focus:text-red-600"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl bg-white rounded-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="p-6 bg-school-navy text-white shrink-0">
            <DialogTitle className="text-xl font-serif flex items-center gap-2">
              <EditPencil className="w-5 h-5 text-school-gold" /> Pengaturan
              Profil
            </DialogTitle>
            <p className="text-xs text-blue-200">
              Kelola data diri, keluarga, dan keamanan akun Anda.
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="personal" className="w-full">
              <div className="px-6 pt-4 bg-slate-50 border-b border-slate-200">
                <TabsList className="bg-transparent w-full justify-start h-auto p-0 space-x-6">
                  <TabsTrigger
                    value="personal"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-school-navy data-[state=active]:text-school-navy rounded-none pb-3 px-0 font-bold text-slate-400"
                  >
                    Data Diri
                  </TabsTrigger>
                  {user?.role === "student" && (
                    <TabsTrigger
                      value="family"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-school-navy data-[state=active]:text-school-navy rounded-none pb-3 px-0 font-bold text-slate-400"
                    >
                      Data Keluarga
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="security"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-school-navy data-[state=active]:text-school-navy rounded-none pb-3 px-0 font-bold text-slate-400"
                  >
                    Akun & Keamanan
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* --- TAB: PERSONAL --- */}
              <TabsContent value="personal" className="p-6 space-y-6 m-0">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar Column */}
                  <div className="flex flex-col items-center gap-4 min-w-[150px]">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                        <AvatarImage
                          src={avatarPreview || getAvatarUrl(formData.avatar)}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-3xl bg-slate-200 text-slate-400">
                          {user?.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 bg-school-navy text-white p-2.5 rounded-full cursor-pointer hover:bg-school-gold hover:text-school-navy transition-all shadow-lg ring-4 ring-white">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleUploadAvatar}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-center text-slate-400 px-4">
                      Format JPG/PNG. Maks 2MB.
                    </p>
                  </div>

                  {/* Fields Column */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nama Lengkap (Tidak Dapat Diubah)</Label>
                        <Input
                          value={user?.profile?.fullName}
                          disabled
                          className="bg-slate-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bio / Motto</Label>
                        <Input
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                          }
                          placeholder="Contoh: Belajar terus tanpa henti!"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Alamat Lengkap</Label>
                      <Textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Nama Jalan, RT/RW, Kelurahan, Kecamatan..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tempat Lahir</Label>
                        <Input
                          value={formData.birthPlace}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              birthPlace: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal Lahir</Label>
                        <Input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              birthDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* --- TAB: KELUARGA --- */}
              <TabsContent value="family" className="p-6 space-y-6 m-0">
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 text-orange-700 mb-4">
                  <Group className="w-5 h-5 shrink-0" />
                  <p className="text-sm">
                    Data keluarga ini digunakan untuk keperluan data sekolah dan
                    kontak darurat. Mohon isi dengan benar.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Nama Ayah Kandung</Label>
                    <Input
                      value={formData.fatherName}
                      onChange={(e) =>
                        setFormData({ ...formData, fatherName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Ibu Kandung</Label>
                    <Input
                      value={formData.motherName}
                      onChange={(e) =>
                        setFormData({ ...formData, motherName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>No. WhatsApp Orang Tua / Wali</Label>
                    <Input
                      value={formData.phoneParent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneParent: e.target.value,
                        })
                      }
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* --- TAB: SECURITY --- */}
              <TabsContent value="security" className="p-6 space-y-6 m-0">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Email Akun</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="pl-10"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-school-navy mb-4 flex items-center gap-2">
                      <Key className="w-4 h-4" /> Ganti Password
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Password Baru</Label>
                        <Input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Kosongkan jika tidak diganti"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Konfirmasi Password Baru</Label>
                        <Input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Ulangi password baru"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="p-4 border-t bg-slate-50 flex justify-between items-center shrink-0">
            <div className="text-xs text-slate-400 italic hidden md:block">
              Terakhir login: {new Date().toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-school-navy text-white hover:bg-school-gold hover:text-school-navy font-bold min-w-[120px]"
              >
                {loading ? "Menyimpan..." : "Simpan Berkas"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardLayout;
