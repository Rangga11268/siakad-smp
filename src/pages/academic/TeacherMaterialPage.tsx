import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import {
  Plus,
  Trash2,
  FileText,
  Loader2,
  Download,
  BookOpen,
  GraduationCap,
  FolderOpen,
} from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const TeacherMaterialPage = () => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    title: "",
    type: "Materi",
    description: "",
    subjectId: "",
    gradeLevel: "7",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMasterData();
    fetchMaterials();
  }, []);

  const fetchMasterData = async () => {
    try {
      const res = await api.get("/academic/subject");
      setSubjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get("/learning-material");
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal hapus materi",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File wajib diupload",
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
    data.append("file", file);

    try {
      await api.post("/learning-material", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({ title: "Berhasil", description: "Materi berhasil diupload" });
      setOpenDialog(false);
      setFormData({
        title: "",
        type: "Materi",
        description: "",
        subjectId: "",
        gradeLevel: "7",
      });
      setFile(null);
      fetchMaterials();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal upload materi",
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
            Manajemen Bahan Ajar
          </h2>
          <p className="text-slate-500">
            Repository modul, tugas, dan latihan soal untuk siswa.
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all">
              <Plus className="mr-2 h-4 w-4" /> Upload Materi Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-school-navy">
                Upload Materi Pembelajaran
              </DialogTitle>
              <DialogDescription>
                Bagikan modul atau tugas kepada siswa sesuai mata pelajaran.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Kategori
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Materi">Materi / Modul</SelectItem>
                      <SelectItem value="Tugas">Tugas / LKPD</SelectItem>
                      <SelectItem value="Latihan">Latihan Soal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Kelas Target
                  </Label>
                  <Select
                    value={formData.gradeLevel}
                    onValueChange={(v) =>
                      setFormData({ ...formData, gradeLevel: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Kelas 7</SelectItem>
                      <SelectItem value="8">Kelas 8</SelectItem>
                      <SelectItem value="9">Kelas 9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-school-navy">
                  Mata Pelajaran
                </Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, subjectId: v })
                  }
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Pilih Mapel" />
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

              <div className="space-y-2">
                <Label className="font-semibold text-school-navy">
                  Deskripsi Singkat
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Berikan instruksi atau keterangan tambahan..."
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-school-navy">
                  File Dokumen (PDF/Doc/Image)
                </Label>
                <Input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) setFile(e.target.files[0]);
                  }}
                  required
                  className="cursor-pointer file:bg-school-navy file:text-white file:border-0 file:rounded-md file:px-2 file:text-sm hover:file:bg-school-gold hover:file:text-school-navy transition-all"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md w-full sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Upload Sekarang
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-school-gold" />
            Daftar Bahan Ajar Tersedia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-school-navy">
              <TableRow className="hover:bg-school-navy">
                <TableHead className="text-white font-bold w-[30%]">
                  Judul & Deskripsi
                </TableHead>
                <TableHead className="text-white font-bold">Mapel</TableHead>
                <TableHead className="text-white font-bold">Kelas</TableHead>
                <TableHead className="text-white font-bold">Tipe</TableHead>
                <TableHead className="text-white font-bold">Guru</TableHead>
                <TableHead className="text-white font-bold text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center text-school-gold">
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                      <p className="text-sm text-slate-500">Memuat materi...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-32 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <BookOpen className="h-8 w-8 text-slate-200 mb-2" />
                      <p>Belum ada materi pembelajaran yang diupload.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((m) => (
                  <TableRow
                    key={m._id}
                    className="hover:bg-slate-50 border-b border-slate-100"
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="font-bold text-school-navy flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          {m.title}
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
                      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold border-blue-200 bg-blue-50 text-blue-700">
                        Kelas {m.gradeLevel}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold 
                            ${
                              m.type === "Materi"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : m.type === "Tugas"
                                  ? "border-orange-200 bg-orange-50 text-orange-700"
                                  : "border-purple-200 bg-purple-50 text-purple-700"
                            }`}
                      >
                        {m.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {m.teacher?.profile?.fullName || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`http://localhost:5000${m.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-school-navy text-school-navy hover:bg-school-navy hover:text-white"
                          >
                            <Download className="h-3 w-3 mr-1" /> Unduh
                          </Button>
                        </a>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(m._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherMaterialPage;
