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
import { Plus, Calendar, User, SystemRestart } from "iconoir-react";
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

  // Form
  const [formData, setFormData] = useState({
    title: "",
    theme: "",
    description: "",
    level: "7",
    academicYear: "671234567890abcdef123456",
  });

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

  const { toast } = useToast();

  const handleCreate = async () => {
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

      await api.post("/p5", {
        ...formData,
        level: parseInt(formData.level),
        targets: defaultTargets,
        academicYear: "2024/2025",
      });
      setOpenDialog(false);
      setFormData({ ...formData, title: "", theme: "", description: "" });
      fetchProjects();
      toast({
        title: "Berhasil!",
        description: "Projek P5 berhasil dibuat.",
      });
    } catch (error) {
      console.error("Gagal buat project", error);
      toast({
        variant: "destructive",
        title: "Gagal Membuat Projek",
        description: "Terjadi kesalahan sistem. Cek koneksi server.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Projek Penguatan Profil Pelajar Pancasila (P5)
          </h2>
          <p className="text-muted-foreground">
            Kelola projek, tema, dan penilaian siswa.
          </p>
        </div>

        {user?.role !== "student" && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Buat Projek Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Buat Projek P5 Baru</DialogTitle>
                <DialogDescription>
                  Tentukan tema dan deskripsi projek untuk tahun ajaran ini.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Judul
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="Contoh: Suara Demokrasi"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="theme" className="text-right">
                    Tema
                  </Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(v) =>
                      setFormData({ ...formData, theme: v })
                    }
                  >
                    <SelectTrigger className="col-span-3">
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="level" className="text-right">
                    Fase/Kelas
                  </Label>
                  <Select
                    value={formData.level}
                    onValueChange={(v) =>
                      setFormData({ ...formData, level: v })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Kelas 7</SelectItem>
                      <SelectItem value="8">Kelas 8</SelectItem>
                      <SelectItem value="9">Kelas 9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="desc" className="text-right">
                    Deskripsi
                  </Label>
                  <Input
                    id="desc"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="Deskripsi singkat kegiatan..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={submitting}
                  onClick={handleCreate}
                >
                  {submitting && (
                    <SystemRestart className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <SystemRestart className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 && (
            <div className="col-span-3 text-center py-12 border border-dashed rounded-lg">
              <h3 className="text-lg font-medium text-muted-foreground">
                Belum ada projek aktif
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Silahkan buat projek baru untuk memulai.
              </p>
            </div>
          )}
          {projects.map((project) => (
            <Card
              key={project._id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/p5/${project._id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2">
                    {project.theme}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Aktif
                  </Badge>
                </div>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>Kelas {project.level}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="mr-1 h-3 w-3" />
                    <span>Tim Fasilitator</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default P5Dashboard;
