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
import { Plus, Search, Trash, SystemRestart, Book } from "iconoir-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    kktpType: "interval",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/academic/subjects");
      setSubjects(res.data);
    } catch (error) {
      console.error("Gagal ambil mapel", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data mata pelajaran.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.code || !formData.name) {
      toast({
        variant: "destructive",
        title: "Validasi Gagal",
        description: "Kode dan Nama Mapel wajib diisi.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/academic/subject", {
        ...formData,
        level: parseInt(formData.level),
      });
      setOpenDialog(false);
      setFormData({ code: "", name: "", level: "7", kktpType: "interval" }); // Reset
      fetchSubjects(); // Refresh
      toast({
        title: "Berhasil!",
        description: "Mata pelajaran berhasil ditambahkan.",
      });
    } catch (error) {
      console.error("Gagal simpan mapel", error);
      toast({
        variant: "destructive",
        title: "Gagal Simpan",
        description: "Terjadi kesalahan saat menyimpan mapel.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Master Data Mata Pelajaran
          </h2>
          <p className="text-slate-500">
            Kelola daftar mata pelajaran dan Tujuan Pembelajaran (TP).
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy transition-colors font-bold shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Tambah Mapel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-school-navy">
                Tambah Mata Pelajaran
              </DialogTitle>
              <DialogDescription>
                Masukan detail mata pelajaran baru untuk kurikulum merdeka.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="code"
                  className="font-semibold text-school-navy"
                >
                  Kode Mapel
                </Label>
                <Input
                  id="code"
                  placeholder="Contoh: MAT"
                  className="focus:border-school-gold focus:ring-school-gold bg-slate-50"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="name"
                  className="font-semibold text-school-navy"
                >
                  Nama Mapel
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: Matematika"
                  className="focus:border-school-gold focus:ring-school-gold bg-slate-50"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="level"
                    className="font-semibold text-school-navy"
                  >
                    Tingkat Kelas
                  </Label>
                  <Select
                    value={formData.level}
                    onValueChange={(val) =>
                      setFormData({ ...formData, level: val })
                    }
                  >
                    <SelectTrigger className="focus:border-school-gold focus:ring-school-gold bg-slate-50">
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Kelas 7</SelectItem>
                      <SelectItem value="8">Kelas 8</SelectItem>
                      <SelectItem value="9">Kelas 9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="kktp"
                    className="font-semibold text-school-navy"
                  >
                    Jenis KKTP
                  </Label>
                  <Select
                    value={formData.kktpType}
                    onValueChange={(val) =>
                      setFormData({ ...formData, kktpType: val })
                    }
                  >
                    <SelectTrigger className="focus:border-school-gold focus:ring-school-gold bg-slate-50">
                      <SelectValue placeholder="Pilih Jenis KKTP" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interval">Interval Nilai</SelectItem>
                      <SelectItem value="rubric">Rubrik (Deskripsi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={submitting}
                onClick={handleCreate}
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy sm:w-auto w-full"
              >
                {submitting && (
                  <SystemRestart className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-t-4 border-t-school-gold shadow-lg border-none">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
              <Book className="w-5 h-5 text-school-gold" />
              Daftar Mata Pelajaran
            </CardTitle>
            <div className="w-full md:w-1/3 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari kode atau nama mapel..."
                className="pl-9 border-slate-200 focus:border-school-gold focus:ring-school-gold bg-slate-50 rounded-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <SystemRestart className="h-8 w-8 animate-spin text-school-gold" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-school-navy">
                <TableRow className="hover:bg-school-navy">
                  <TableHead className="text-white font-bold w-[100px]">
                    Kode
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Nama Mapel
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Tingkat
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Jenis Asesmen
                  </TableHead>
                  <TableHead className="text-white font-bold text-right">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Book className="h-12 w-12 text-slate-200 mb-3" />
                        <p>Belum ada data mata pelajaran.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {filteredSubjects.map((subject) => (
                  <TableRow
                    key={subject._id}
                    className="hover:bg-slate-50 border-b border-slate-100"
                  >
                    <TableCell className="font-bold text-school-navy">
                      {subject.code}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {subject.name}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold">
                        Kelas {subject.level}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize text-slate-600">
                      {subject.kktpType}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
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
