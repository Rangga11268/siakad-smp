import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash,
  Page,
  SystemRestart,
  Download,
  Book,
  Folder,
  EditPencil,
  Search,
  Link as LinkIcon,
  MediaVideo,
  AppWindow,
  List,
  ViewGrid,
  BookStack,
  ClipboardCheck,
  Play, // Fixed: PlayCircle -> Play
  Eye,
  Xmark,
} from "iconoir-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Material {
  _id: string;
  title: string;
  type: string;
  description: string;
  fileUrl?: string;
  externalUrl?: string;
  sourceType: string;
  subject: { _id: string; name: string };
  gradeLevel: string;
  teacher: { profile: { fullName: string } };
  createdAt: string;
}

interface Stats {
  total: number;
  Materi: number;
  Tugas: number;
  Latihan: number;
  Video: number;
  Lainnya: number;
}

const API_BASE = "http://localhost:5000";

const TeacherMaterialPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    Materi: 0,
    Tugas: 0,
    Latihan: 0,
    Video: 0,
    Lainnya: 0,
  });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [onlyMine, setOnlyMine] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Form
  const [formData, setFormData] = useState({
    title: "",
    type: "Materi",
    description: "",
    subjectId: "",
    gradeLevel: "7",
    sourceType: "file",
    externalUrl: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMasterData();
    fetchMaterials();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [search, filterSubject, filterGrade, filterType, onlyMine]);

  const fetchMasterData = async () => {
    try {
      const res = await api.get("/academic/subjects");
      setSubjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/learning-material/stats");
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterSubject !== "all") params.append("subjectId", filterSubject);
      if (filterGrade !== "all") params.append("gradeLevel", filterGrade);
      if (filterType !== "all") params.append("type", filterType);
      if (onlyMine && user?.id) params.append("teacherId", user.id);

      const res = await api.get(`/learning-material?${params.toString()}`);
      setMaterials(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus materi ini?")) return;
    try {
      await api.delete(`/learning-material/${id}`);
      toast({ title: "Berhasil", description: "Materi dihapus" });
      fetchMaterials();
      fetchStats();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal hapus materi",
      });
    }
  };

  const handleEdit = (material: Material) => {
    setEditingId(material._id);
    setFormData({
      title: material.title,
      type: material.type,
      description: material.description || "",
      subjectId: material.subject._id,
      gradeLevel: material.gradeLevel,
      sourceType: material.sourceType,
      externalUrl: material.externalUrl || "",
    });
    setFile(null);
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (formData.sourceType === "file" && !file && !editingId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File wajib diupload",
      });
      return;
    }
    if (
      (formData.sourceType === "link" || formData.sourceType === "youtube") &&
      !formData.externalUrl
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Link eksternal wajib diisi",
      });
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("type", formData.type);
    data.append("description", formData.description);
    data.append("subjectId", formData.subjectId);
    data.append("gradeLevel", formData.gradeLevel);
    data.append("sourceType", formData.sourceType);
    if (formData.externalUrl) data.append("externalUrl", formData.externalUrl);
    if (file) data.append("file", file);

    try {
      if (editingId) {
        await api.put(`/learning-material/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Berhasil", description: "Materi berhasil diupdate" });
      } else {
        await api.post("/learning-material", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Berhasil", description: "Materi berhasil diupload" });
      }

      setOpenDialog(false);
      resetForm();
      fetchMaterials();
      fetchStats();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menyimpan materi",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      type: "Materi",
      description: "",
      subjectId: "",
      gradeLevel: "7",
      sourceType: "file",
      externalUrl: "",
    });
    setFile(null);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const statCards = [
    {
      label: "Total Materi",
      value: stats.total,
      icon: Folder,
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "Modul",
      value: stats.Materi,
      icon: Book,
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "Tugas",
      value: stats.Tugas,
      icon: ClipboardCheck,
      color: "from-orange-500 to-amber-600",
    },
    {
      label: "Latihan",
      value: stats.Latihan,
      icon: BookStack,
      color: "from-purple-500 to-violet-600",
    },
    {
      label: "Video",
      value: stats.Video,
      icon: MediaVideo,
      color: "from-rose-500 to-pink-600",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Materi":
        return <Book className="w-4 h-4" />;
      case "Tugas":
        return <ClipboardCheck className="w-4 h-4" />;
      case "Latihan":
        return <BookStack className="w-4 h-4" />;
      case "Video":
        return <MediaVideo className="w-4 h-4" />;
      default:
        return <Page className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      Materi: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Tugas: "bg-orange-100 text-orange-700 border-orange-200",
      Latihan: "bg-purple-100 text-purple-700 border-purple-200",
      Video: "bg-rose-100 text-rose-700 border-rose-200",
      Lainnya: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return styles[type] || styles.Lainnya;
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "youtube":
        return <Play className="w-4 h-4 text-red-500" />;
      case "link":
        return <LinkIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <Page className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-school-navy via-blue-900 to-indigo-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('/img/pattern-grid.svg')] opacity-10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-school-gold/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur">
                  <BookStack className="w-8 h-8 text-school-gold" />
                </div>
                Manajemen Bahan Ajar
              </h1>
              <p className="text-white/70 text-lg">
                Repository modul, tugas, latihan, dan video pembelajaran untuk
                siswa.
              </p>
            </div>
            <Dialog
              open={openDialog}
              onOpenChange={(open) => {
                setOpenDialog(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-school-gold text-school-navy hover:bg-yellow-400 font-bold shadow-lg px-6 py-6 text-base">
                  <Plus className="mr-2 h-5 w-5" /> Upload Materi Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-school-navy">
                    {editingId ? "Edit Materi" : "Upload Materi Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    Bagikan konten pembelajaran kepada siswa sesuai mata
                    pelajaran.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Judul Materi
                    </Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      placeholder="Contoh: Modul Bab 1 - Bilangan Bulat"
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Kategori
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(v) =>
                          setFormData({ ...formData, type: v })
                        }
                      >
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Materi">
                            📘 Materi / Modul
                          </SelectItem>
                          <SelectItem value="Tugas">📝 Tugas / LKPD</SelectItem>
                          <SelectItem value="Latihan">
                            📋 Latihan Soal
                          </SelectItem>
                          <SelectItem value="Video">🎬 Video</SelectItem>
                          <SelectItem value="Lainnya">📁 Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Kelas
                      </Label>
                      <Select
                        value={formData.gradeLevel}
                        onValueChange={(v) =>
                          setFormData({ ...formData, gradeLevel: v })
                        }
                      >
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Kelas 7</SelectItem>
                          <SelectItem value="8">Kelas 8</SelectItem>
                          <SelectItem value="9">Kelas 9</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Mapel
                      </Label>
                      <Select
                        value={formData.subjectId}
                        onValueChange={(v) =>
                          setFormData({ ...formData, subjectId: v })
                        }
                      >
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s._id} value={s._id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Deskripsi
                    </Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Berikan instruksi atau keterangan tambahan..."
                      className="bg-slate-50 border-slate-200"
                      rows={3}
                    />
                  </div>

                  {/* Source Type Tabs */}
                  <div className="space-y-3">
                    <Label className="font-semibold text-school-navy">
                      Sumber Konten
                    </Label>
                    <Tabs
                      value={formData.sourceType}
                      onValueChange={(v) =>
                        setFormData({ ...formData, sourceType: v })
                      }
                    >
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger
                          value="file"
                          className="flex items-center gap-1"
                        >
                          <Page className="w-4 h-4" /> File
                        </TabsTrigger>
                        <TabsTrigger
                          value="link"
                          className="flex items-center gap-1"
                        >
                          <LinkIcon className="w-4 h-4" /> Link
                        </TabsTrigger>
                        <TabsTrigger
                          value="youtube"
                          className="flex items-center gap-1"
                        >
                          <Play className="w-4 h-4" /> YouTube
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {formData.sourceType === "file" && (
                      <Input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files) setFile(e.target.files[0]);
                        }}
                        className="cursor-pointer file:bg-school-navy file:text-white file:border-0 file:rounded-md file:px-3 file:text-sm hover:file:bg-school-gold hover:file:text-school-navy"
                      />
                    )}
                    {(formData.sourceType === "link" ||
                      formData.sourceType === "youtube") && (
                      <Input
                        value={formData.externalUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            externalUrl: e.target.value,
                          })
                        }
                        placeholder={
                          formData.sourceType === "youtube"
                            ? "https://youtube.com/watch?v=..."
                            : "https://drive.google.com/..."
                        }
                        className="bg-slate-50 border-slate-200"
                      />
                    )}
                  </div>

                  <DialogFooter className="pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold w-full"
                    >
                      {submitting ? (
                        <>
                          <SystemRestart className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          {editingId ? (
                            <EditPencil className="mr-2 h-4 w-4" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}{" "}
                          {editingId ? "Simpan Perubahan" : "Upload Sekarang"}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat, idx) => (
          <Card
            key={idx}
            className={`relative overflow-hidden border-none shadow-lg bg-gradient-to-br ${stat.color} text-white`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="w-10 h-10 text-white/30" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul materi..."
                className="pl-10 bg-slate-50"
              />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-40 bg-slate-50">
                <SelectValue placeholder="Mapel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mapel</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-32 bg-slate-50">
                <SelectValue placeholder="Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                <SelectItem value="7">Kelas 7</SelectItem>
                <SelectItem value="8">Kelas 8</SelectItem>
                <SelectItem value="9">Kelas 9</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 bg-slate-50">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="Materi">Materi</SelectItem>
                <SelectItem value="Tugas">Tugas</SelectItem>
                <SelectItem value="Latihan">Latihan</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-md">
              <Switch checked={onlyMine} onCheckedChange={setOnlyMine} />
              <span className="text-sm text-slate-600 whitespace-nowrap">
                Materi Saya
              </span>
            </div>
            <div className="flex gap-1 border rounded-md p-1 bg-slate-50">
              <Button
                size="icon"
                variant={viewMode === "table" ? "default" : "ghost"}
                className="h-8 w-8"
                onClick={() => setViewMode("table")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === "grid" ? "default" : "ghost"}
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <ViewGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <SystemRestart className="w-8 h-8 animate-spin text-school-gold" />
        </div>
      ) : materials.length === 0 ? (
        <Card className="border-none shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Book className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium">
              Belum ada materi pembelajaran.
            </p>
            <p className="text-sm">Klik "Upload Materi Baru" untuk memulai.</p>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="border-none shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-school-navy">
              <TableRow className="hover:bg-school-navy">
                <TableHead className="text-white font-bold w-[35%]">
                  Judul & Deskripsi
                </TableHead>
                <TableHead className="text-white font-bold">Mapel</TableHead>
                <TableHead className="text-white font-bold">Kelas</TableHead>
                <TableHead className="text-white font-bold">Tipe</TableHead>
                <TableHead className="text-white font-bold">Sumber</TableHead>
                <TableHead className="text-white font-bold">Guru</TableHead>
                <TableHead className="text-white font-bold text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((m) => (
                <TableRow key={m._id} className="hover:bg-slate-50 border-b">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-school-navy flex items-center gap-2">
                        {getTypeIcon(m.type)} {m.title}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {m.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {m.subject?.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700"
                    >
                      Kelas {m.gradeLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeBadge(m.type)}>
                      {m.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{getSourceIcon(m.sourceType)}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {m.teacher?.profile?.fullName || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-blue-600"
                        onClick={() => setPreviewMaterial(m)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-600"
                        onClick={() => handleEdit(m)}
                      >
                        <EditPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500"
                        onClick={() => handleDelete(m._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((m) => (
            <Card
              key={m._id}
              className="border-none shadow-lg hover:shadow-xl transition-all group overflow-hidden"
            >
              <div
                className={`h-2 bg-gradient-to-r ${m.type === "Materi" ? "from-emerald-500 to-teal-500" : m.type === "Tugas" ? "from-orange-500 to-amber-500" : m.type === "Video" ? "from-rose-500 to-pink-500" : "from-purple-500 to-violet-500"}`}
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className={getTypeBadge(m.type)}>
                    {m.type}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setPreviewMaterial(m)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleEdit(m)}
                    >
                      <EditPencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-500"
                      onClick={() => handleDelete(m._id)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg text-school-navy line-clamp-2 mt-2">
                  {m.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {m.description || "Tidak ada deskripsi."}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">{m.subject?.name}</Badge>
                  <Badge variant="secondary">Kelas {m.gradeLevel}</Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {getSourceIcon(m.sourceType)} {m.sourceType}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Oleh: {m.teacher?.profile?.fullName}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Dialog
        open={!!previewMaterial}
        onOpenChange={() => setPreviewMaterial(null)}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
              {previewMaterial && getTypeIcon(previewMaterial.type)}{" "}
              {previewMaterial?.title}
            </DialogTitle>
            <DialogDescription>
              {previewMaterial?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {previewMaterial?.sourceType === "youtube" &&
            previewMaterial?.externalUrl ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(previewMaterial.externalUrl) || ""}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : previewMaterial?.sourceType === "link" &&
              previewMaterial?.externalUrl ? (
              <div className="text-center py-8">
                <LinkIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">
                  Materi ini merupakan tautan eksternal.
                </p>
                <a
                  href={previewMaterial.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <AppWindow className="mr-2 h-4 w-4" /> Buka Link
                  </Button>
                </a>
              </div>
            ) : previewMaterial?.fileUrl ? (
              <div className="text-center py-8">
                <Page className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">
                  File: {previewMaterial.fileUrl.split("/").pop()}
                </p>
                <a
                  href={`${API_BASE}${previewMaterial.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy">
                    <Download className="mr-2 h-4 w-4" /> Unduh File
                  </Button>
                </a>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherMaterialPage;
