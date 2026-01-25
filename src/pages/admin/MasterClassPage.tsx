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
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  Users,
  UserPlus,
  X,
  Building2,
} from "lucide-react";
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
        `/academic/class/${selectedClass._id}/students`,
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Master Data Kelas
          </h2>
          <p className="text-slate-500">
            Kelola daftar kelas aktif dan pembagian siswa.
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all">
              <Plus className="mr-2 h-4 w-4" /> Tambah Kelas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-school-navy">
                Tambah Kelas Baru
              </DialogTitle>
              <DialogDescription>
                Buat kelas baru untuk tahun ajaran aktif.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="name"
                  className="font-semibold text-school-navy"
                >
                  Nama Kelas
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: 7A"
                  className="bg-slate-50 focus:border-school-gold focus:ring-school-gold"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="level"
                  className="font-semibold text-school-navy"
                >
                  Tingkat
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(val) =>
                    setFormData({ ...formData, level: val })
                  }
                >
                  <SelectTrigger className="bg-slate-50 focus:border-school-gold focus:ring-school-gold">
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
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full"
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
        <DialogContent className="max-w-3xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="font-serif text-2xl text-school-navy">
              Kelola Siswa -{" "}
              <span className="text-school-gold">{selectedClass?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Tambah atau hapus siswa dari kelas ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="flex gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex-1">
                <Select
                  onValueChange={setSelectedStudentId}
                  value={selectedStudentId}
                >
                  <SelectTrigger className="w-full bg-white border-slate-300 focus:border-school-gold focus:ring-school-gold">
                    <SelectValue placeholder="Cari Siswa Belum Ada Kelas..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {allStudents
                      .filter((s) => !s.profile.class || s.profile.class === "")
                      .map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.profile.fullName} ({s.username})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddMember}
                disabled={!selectedStudentId || submitting}
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Tambah Siswa
              </Button>
            </div>

            <div className="border border-slate-200 rounded-lg max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-school-navy sticky top-0">
                  <TableRow className="hover:bg-school-navy">
                    <TableHead className="text-white w-12 text-center">
                      No
                    </TableHead>
                    <TableHead className="text-white">Nama Siswa</TableHead>
                    <TableHead className="text-white">NISN</TableHead>
                    <TableHead className="text-white text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        Belum ada siswa di kelas ini.
                      </TableCell>
                    </TableRow>
                  )}
                  {members.map((m, idx) => (
                    <TableRow key={m._id} className="hover:bg-slate-50">
                      <TableCell className="text-center">{idx + 1}</TableCell>
                      <TableCell className="font-medium text-school-navy">
                        {m.profile.fullName}
                      </TableCell>
                      <TableCell>{m.profile.nisn || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(m._id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
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

      <Card className="border-t-4 border-t-school-gold shadow-lg border-none">
        <CardHeader className="border-b border-slate-100 bg-white">
          <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
            <Building2 className="w-5 h-5 text-school-gold" /> Daftar Kelas
            Aktif
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && !openMembersDialog ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-school-gold" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-school-navy">
                <TableRow className="hover:bg-school-navy">
                  <TableHead className="text-white font-bold">
                    Nama Kelas
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Tingkat
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Wali Kelas
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Jumlah Siswa
                  </TableHead>
                  <TableHead className="text-white font-bold text-right">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Building2 className="h-12 w-12 text-slate-200 mb-3" />
                        <p>Belum ada data kelas.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {classes.map((cls) => (
                  <TableRow
                    key={cls._id}
                    className="hover:bg-slate-50 border-b border-slate-100"
                  >
                    <TableCell className="font-bold text-lg text-school-navy">
                      {cls.name}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold">
                        Kelas {cls.level}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {cls.homeroomTeacher?.profile?.fullName ||
                        cls.homeroomTeacher?.username ||
                        "-"}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Users className="w-4 h-4" />{" "}
                        {cls.students?.length || 0} Siswa
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openManageMembers(cls)}
                        className="border-school-navy text-school-navy hover:bg-school-navy hover:text-white"
                      >
                        <Users className="h-3 w-3 mr-2" /> Detail Siswa
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-orange-50 text-orange-500"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-50 text-red-500"
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

export default MasterClassPage;
