import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  User,
  SystemRestart,
  Edit,
  Trash,
  MoreVert,
} from "iconoir-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// Interface for Project P5
interface ProjectP5 {
  _id: string;
  title: string;
  theme: string;
  description: string;
  level: number;
  status?: string;
  startDate?: string;
}

const P5Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectP5[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Form
  const [formData, setFormData] = useState({
    title: "",
    theme: "",
    description: "",
    level: "7",
    academicYear: "2024/2025",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/p5", {
        params: {
          academicYear: "2024/2025",
        },
      });
      setProjects(res.data);
    } catch (error) {
      console.error("Gagal load project P5", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      title: "",
      theme: "",
      description: "",
      level: "7",
      academicYear: "2024/2025",
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (project: ProjectP5) => {
    setIsEditing(true);
    setCurrentProjectId(project._id);
    setFormData({
      title: project.title,
      theme: project.theme,
      description: project.description,
      level: project.level.toString(),
      academicYear: "2024/2025",
    });
    setOpenDialog(true);
  };

  const handleDelete = async (projectId: string) => {
    if (
      !window.confirm(
        "Yakin ingin menghapus projek ini? Data tidak bisa dikembalikan.",
      )
    )
      return;
    try {
      await api.delete(`/p5/${projectId}`);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      toast({ title: "Projek Dihapus" });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal hapus projek" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.theme) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Judul dan Tema wajib diisi.",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && currentProjectId) {
        // Update
        const res = await api.put(`/p5/${currentProjectId}`, {
          ...formData,
          level: parseInt(formData.level),
        });
        setProjects((prev) =>
          prev.map((p) => (p._id === currentProjectId ? res.data : p)),
        );
        toast({ title: "Berhasil Diupdate" });
      } else {
        // Create
        const defaultTargets = [
          {
            dimension: "Beriman, Bertakwa",
            element: "Akhlak Pribadi",
            subElement: "Integritas",
          },
          {
            dimension: "Gotong Royong",
            element: "Kolaborasi",
            subElement: "Kerjasama",
          },
        ];
        const res = await api.post("/p5", {
          ...formData,
          level: parseInt(formData.level),
          targets: defaultTargets,
        });
        setProjects((prev) => [...prev, res.data]);
        toast({ title: "Berhasil Dibuat" });
      }
      setOpenDialog(false);
    } catch (error) {
      console.error("Gagal save project", error);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan sistem.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Projek Penguatan Profil Pelajar Pancasila (P5)
          </h2>
          <p className="text-slate-500">
            Kelola projek, tema, dan penilaian siswa untuk karakter Pancasila.
          </p>
        </div>

        {user?.role !== "student" && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={handleOpenCreate}
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all"
              >
                <Plus className="mr-2 h-4 w-4" /> Buat Projek Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-school-navy">
                  {isEditing ? "Edit Projek P5" : "Buat Projek P5 Baru"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Perbarui informasi projek."
                    : "Tentukan tema dan deskripsi projek."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="font-semibold text-school-navy"
                  >
                    Judul Projek
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-slate-50 focus:border-school-gold"
                    placeholder="Contoh: Suara Demokrasi - Pemilihan Ketua OSIS"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="theme"
                      className="font-semibold text-school-navy"
                    >
                      Tema
                    </Label>
                    <Select
                      value={formData.theme}
                      onValueChange={(v) =>
                        setFormData({ ...formData, theme: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Pilih Tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gaya Hidup Berkelanjutan">
                          Gaya Hidup Berkelanjutan
                        </SelectItem>
                        <SelectItem value="Kearifan Lokal">
                          Kearifan Lokal
                        </SelectItem>
                        <SelectItem value="Bhinneka Tunggal Ika">
                          Bhinneka Tunggal Ika
                        </SelectItem>
                        <SelectItem value="Bangunlah Jiwa dan Raganya">
                          Bangunlah Jiwa dan Raganya
                        </SelectItem>
                        <SelectItem value="Suara Demokrasi">
                          Suara Demokrasi
                        </SelectItem>
                        <SelectItem value="Rekayasa dan Teknologi">
                          Rekayasa dan Teknologi
                        </SelectItem>
                        <SelectItem value="Kewirausahaan">
                          Kewirausahaan
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="level"
                      className="font-semibold text-school-navy"
                    >
                      Fase/Kelas
                    </Label>
                    <Select
                      value={formData.level}
                      onValueChange={(v) =>
                        setFormData({ ...formData, level: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Kelas 7 (Fase D)</SelectItem>
                        <SelectItem value="8">Kelas 8 (Fase D)</SelectItem>
                        <SelectItem value="9">Kelas 9 (Fase D)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="desc"
                    className="font-semibold text-school-navy"
                  >
                    Deskripsi Singkat
                  </Label>
                  <Input
                    id="desc"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-slate-50"
                    placeholder="Deskripsi singkat kegiatan..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full font-bold"
                >
                  {submitting && (
                    <SystemRestart className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Simpan Perubahan" : "Simpan Projek"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <SystemRestart className="h-10 w-10 animate-spin text-school-gold" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 && (
            <div className="col-span-3 text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="flex justify-center mb-4">
                <Calendar className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-serif font-bold text-school-navy">
                Belum ada projek aktif
              </h3>
              <p className="text-slate-500 mt-2">
                Silahkan buat projek baru untuk memulai kegiatan P5.
              </p>
            </div>
          )}
          {projects.map((project) => (
            <Card
              key={project._id}
              className="hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden group border-t-4 border-t-school-gold bg-white relative flex flex-col justify-between"
            >
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/p5/${project._id}`)}
              >
                <CardHeader className="pb-3 bg-gradient-to-br from-white to-slate-50">
                  <div className="flex justify-between items-start mb-2 pr-2">
                    <Badge
                      variant="outline"
                      className="text-xs font-bold border-school-navy text-school-navy"
                    >
                      {project.theme}
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
                      Aktif
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-school-navy group-hover:text-school-gold transition-colors line-clamp-2 leading-tight">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-2 text-sm text-slate-500">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center bg-slate-100 px-2 py-1 rounded">
                      <Calendar className="mr-1.5 h-3.5 w-3.5 text-school-navy" />
                      <span className="font-medium">Kelas {project.level}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="mr-1.5 h-3.5 w-3.5 text-school-gold" />
                      <span>Tim Fasilitator</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {user?.role !== "student" && (
                <div className="bg-slate-50 p-2 border-t flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(project)}
                    className="border-school-navy text-school-navy hover:bg-school-navy hover:text-white h-8 text-xs"
                  >
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project._id)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 text-xs"
                  >
                    <Trash className="w-3 h-3 mr-1" /> Hapus
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default P5Dashboard;
