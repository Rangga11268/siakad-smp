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
import { Plus, Trash2, Edit, Loader2, Users, UserPlus, X } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface ClassData {
  _id: string;
  name: string;
  level: number;
  homeroomTeacher?: {
    username: string;
    profile?: { fullName: string };
  };
  students?: any[];
}

const MasterClassPage = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMembersDialog, setOpenMembersDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    level: "7",
  });
  const [selectedStudentId, setSelectedStudentId] = useState("");

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
      toast({ title: "Berhasil", description: "Kelas berhasil dibuat." });
    } catch (error) {
      console.error("Gagal simpan kelas", error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal membuat kelas.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openManageMembers = async (cls: ClassData) => {
    setSelectedClass(cls);
    setOpenMembersDialog(true);
    setLoading(true);
    try {
      const [resMembers, resAll] = await Promise.all([
        api.get(`/academic/class/${cls._id}/students`),
        api.get("/academic/students"),
      ]);
      setMembers(resMembers.data);
      setAllStudents(resAll.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal load data anggota.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedStudentId || !selectedClass) return;
    setSubmitting(true);
    try {
      await api.post(`/academic/class/${selectedClass._id}/students`, {
        studentId: selectedStudentId,
      });
      // Refresh members
      const res = await api.get(
        `/academic/class/${selectedClass._id}/students`
      );
      setMembers(res.data);
      setSelectedStudentId("");
      toast({ title: "Berhasil", description: "Siswa ditambahkan ke kelas." });
      fetchClasses(); // Update count in main list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menambah siswa.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (studentId: string) => {
    if (!selectedClass) return;
    if (!confirm("Hapus siswa dari kelas ini?")) return;
    try {
      await api.delete(`/academic/class/${selectedClass._id}/students`, {
        data: { studentId },
      });
      setMembers(members.filter((m) => m._id !== studentId));
      toast({ title: "Berhasil", description: "Siswa dihapus dari kelas." });
      fetchClasses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menghapus siswa.",
      });
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

      {/* Manage Members Dialog */}
      <Dialog open={openMembersDialog} onOpenChange={setOpenMembersDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Kelola Anggota Kelas - {selectedClass?.name}
            </DialogTitle>
            <DialogDescription>
              Tambah atau hapus siswa dari kelas ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select
                onValueChange={setSelectedStudentId}
                value={selectedStudentId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Siswa (Cari Nama...)" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {allStudents
                    .filter((s) => !s.profile.class || s.profile.class === "")
                    .map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.profile.fullName} ({s.username})
                      </SelectItem>
                    ))}
                  {/* Option to show all even if assigned, mostly relying on filter for now */}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMember}
                disabled={!selectedStudentId || submitting}
              >
                <UserPlus className="mr-2 h-4 w-4" /> Tambah
              </Button>
            </div>

            <div className="border rounded-md max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m, idx) => (
                    <TableRow key={m._id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{m.profile.fullName}</TableCell>
                      <TableCell>{m.profile.nisn}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(m._id)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas (Tahun Ajaran 2024/2025)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !openMembersDialog ? (
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
                    <TableCell>{cls.students?.length || 0} Siswa</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openManageMembers(cls)}
                      >
                        <Users className="h-4 w-4 mr-2" /> Anggota
                      </Button>
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
