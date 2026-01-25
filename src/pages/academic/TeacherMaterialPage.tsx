import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { Plus, Trash2, FileText, Loader2, Download } from "lucide-react";
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

    // Optional: fetch active academic year to attach? Backend can assume active or we send it
    // For now let backend handle it or default to null if not strictly required by schema logic (Controller uses passed ID but Schema has it ref)
    // Controller expects academicYearId in body. Let's fetch active year or just send null if controller handles it.
    // Controller: const { ... academicYearId } = req.body;
    // Logic should probably be in backend to find active year if not sent.

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Bahan Ajar
          </h2>
          <p className="text-muted-foreground">
            Upload dan kelola materi pembelajaran.
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Upload Materi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Materi Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Judul Materi</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Contoh: Modul Bab 1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mata Pelajaran</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, subjectId: v })
                    }
                  >
                    <SelectTrigger>
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
                <div>
                  <Label>Kelas</Label>
                  <Select
                    value={formData.gradeLevel}
                    onValueChange={(v) =>
                      setFormData({ ...formData, gradeLevel: v })
                    }
                  >
                    <SelectTrigger>
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
              <div>
                <Label>Tipe</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Materi">Materi / Modul</SelectItem>
                    <SelectItem value="Tugas">Tugas / LKPD</SelectItem>
                    <SelectItem value="Latihan">Latihan Soal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Deskripsi</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Keterangan singkat..."
                />
              </div>
              <div>
                <Label>File (PDF/Doc/Image)</Label>
                <Input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) setFile(e.target.files[0]);
                  }}
                  required
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Upload
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Mapel</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Belum ada materi.
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((m) => (
                  <TableRow key={m._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        {m.title}
                      </div>
                    </TableCell>
                    <TableCell>{m.subject?.name}</TableCell>
                    <TableCell>Kelas {m.gradeLevel}</TableCell>
                    <TableCell>{m.type}</TableCell>
                    <TableCell>{m.teacher?.profile?.fullName || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`http://localhost:5000${m.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="icon" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
