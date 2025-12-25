import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Trash2, Loader2 } from "lucide-react";
import api from "@/services/api";

interface Subject {
  _id: string;
  code: string;
  name: string;
  level: number;
  kktpType: string;
}

const MasterSubjectPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    level: "7",
    kktpType: "Interval",
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/academic/subject");
      setSubjects(res.data);
    } catch (error) {
      console.error("Gagal ambil mapel", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await api.post("/academic/subject", {
        ...formData,
        level: parseInt(formData.level),
      });
      setOpenDialog(false);
      setFormData({ code: "", name: "", level: "7", kktpType: "Interval" }); // Reset
      fetchSubjects(); // Refresh
    } catch (error) {
      console.error("Gagal simpan mapel", error);
      alert("Gagal menyimpan data mata pelajaran");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Master Data Mata Pelajaran
          </h2>
          <p className="text-muted-foreground">
            Kelola mata pelajaran dan Tujuan Pembelajaran (TP).
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Tambah Mapel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Mata Pelajaran</DialogTitle>
              <DialogDescription>
                Masukan detail mata pelajaran baru untuk kurikulum merdeka.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Kode
                </Label>
                <Input
                  id="code"
                  placeholder="Contoh: MAT"
                  className="col-span-3"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: Matematika"
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="level" className="text-right">
                  Kelas
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(val) =>
                    setFormData({ ...formData, level: val })
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
                <Label htmlFor="kktp" className="text-right">
                  KKTP
                </Label>
                <Select
                  value={formData.kktpType}
                  onValueChange={(val) =>
                    setFormData({ ...formData, kktpType: val })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Jenis KKTP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interval">Interval Nilai</SelectItem>
                    <SelectItem value="Rubrik">Rubrik (Deskripsi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={submitting}
                onClick={handleCreate}
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Mata Pelajaran</CardTitle>
            <div className="w-1/3 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari mapel..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Mapel</TableHead>
                  <TableHead>Tingkat</TableHead>
                  <TableHead>Jenis Asesmen</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Belum ada data mata pelajaran.
                    </TableCell>
                  </TableRow>
                )}
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell className="font-medium">
                      {subject.code}
                    </TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>Kelas {subject.level}</TableCell>
                    <TableCell>{subject.kktpType}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterSubjectPage;
