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
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import api from "@/services/api";

interface ClassData {
  _id: string;
  name: string;
  level: number;
  homeroomTeacher?: {
    username: string;
    profile?: { fullName: string };
  };
}

const MasterClassPage = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    level: "7",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/academic/class");
      setClasses(res.data);
    } catch (error) {
      console.error("Gagal ambil kelas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await api.post("/academic/class", {
        ...formData,
        level: parseInt(formData.level),
      });
      setOpenDialog(false);
      setFormData({ name: "", level: "7" }); // Reset
      fetchClasses(); // Refresh
    } catch (error) {
      console.error("Gagal simpan kelas", error);
      alert("Gagal menyimpan data kelas");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Kelas</h2>
          <p className="text-muted-foreground">
            Kelola daftar kelas dan wali kelas.
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Tambah Kelas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Kelas Baru</DialogTitle>
              <DialogDescription>
                Buat kelas baru untuk tahun ajaran aktif.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama Kelas
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: 7A"
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="level" className="text-right">
                  Tingkat
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(val) =>
                    setFormData({ ...formData, level: val })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Tingkat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Kelas 7</SelectItem>
                    <SelectItem value="8">Kelas 8</SelectItem>
                    <SelectItem value="9">Kelas 9</SelectItem>
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
          <CardTitle>Daftar Kelas (Tahun Ajaran 2024/2025)</CardTitle>
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
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead>Tingkat</TableHead>
                  <TableHead>Wali Kelas</TableHead>
                  <TableHead>Jumlah Siswa</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Belum ada data kelas
                    </TableCell>
                  </TableRow>
                )}
                {classes.map((cls) => (
                  <TableRow key={cls._id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>Kelas {cls.level}</TableCell>
                    <TableCell>
                      {cls.homeroomTeacher?.profile?.fullName ||
                        cls.homeroomTeacher?.username ||
                        "-"}
                    </TableCell>
                    <TableCell>0 Siswa</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4 text-orange-500" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
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

export default MasterClassPage;
