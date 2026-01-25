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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHoriz,
  EditPencil,
  Trash,
  SystemRestart,
  UserBadgeCheck,
  Phone,
  Mail,
} from "iconoir-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Teacher {
  _id: string;
  username: string;
  email: string;
  role: string;
  profile: {
    fullName: string;
    nip?: string;
    phone?: string;
    subject?: string;
    address?: string;
    birthDate?: string;
    gender?: string;
  };
  isActive: boolean;
  createdAt: string;
}

const MasterTeacherPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    nip: "",
    phone: "",
    subject: "",
    gender: "Laki-laki",
    address: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/academic/teachers");
      setTeachers(res.data);
    } catch (error) {
      console.error("Gagal load data guru", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data guru.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/academic/subjects");
      setSubjects(res.data);
    } catch (error) {
      console.error("Gagal load mapel", error);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      nip: "",
      phone: "",
      subject: "",
      gender: "Laki-laki",
      address: "",
    });
    setEditingTeacher(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      username: teacher.username,
      email: teacher.email || "",
      password: "",
      fullName: teacher.profile?.fullName || "",
      nip: teacher.profile?.nip || "",
      phone: teacher.profile?.phone || "",
      subject: teacher.profile?.subject || "",
      gender: teacher.profile?.gender || "Laki-laki",
      address: teacher.profile?.address || "",
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.fullName) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Username dan Nama Lengkap wajib diisi.",
      });
      return;
    }

    if (!editingTeacher && !formData.password) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Password wajib diisi untuk guru baru.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        role: "teacher",
        profile: {
          fullName: formData.fullName,
          nip: formData.nip,
          phone: formData.phone,
          subject: formData.subject,
          gender: formData.gender,
          address: formData.address,
        },
        ...(formData.password && { password: formData.password }),
      };

      if (editingTeacher) {
        await api.put(`/users/${editingTeacher._id}`, payload);
        toast({
          title: "Berhasil",
          description: "Data guru berhasil diperbarui.",
        });
      } else {
        await api.post("/auth/register", { ...payload, role: "teacher" });
        toast({
          title: "Berhasil",
          description: "Guru baru berhasil ditambahkan.",
        });
      }

      setOpenDialog(false);
      resetForm();
      fetchTeachers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description:
          error.response?.data?.message || "Terjadi kesalahan saat menyimpan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus data guru ini?")) return;

    try {
      await api.delete(`/users/${id}`);
      toast({
        title: "Berhasil",
        description: "Data guru berhasil dihapus.",
      });
      fetchTeachers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menghapus data guru.",
      });
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.profile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.profile?.nip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Master Data Guru
          </h2>
          <p className="text-slate-500">
            Kelola data guru, NIP, bidang studi, dan informasi kontak.
          </p>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari NIP, Nama, atau Username..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={handleOpenCreate}
              className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> Tambah Guru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-school-navy">
                {editingTeacher ? "Edit Data Guru" : "Tambah Guru Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingTeacher
                  ? "Perbarui informasi guru yang sudah terdaftar."
                  : "Lengkapi data untuk mendaftarkan guru baru."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="guru.budi"
                    className="bg-slate-50"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    disabled={!!editingTeacher}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Password{" "}
                    {!editingTeacher && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    type="password"
                    placeholder={
                      editingTeacher
                        ? "Kosongkan jika tidak diubah"
                        : "••••••••"
                    }
                    className="bg-slate-50"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Budi Santoso, S.Pd"
                    className="bg-slate-50"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">NIP</Label>
                  <Input
                    placeholder="198501012010011001"
                    className="bg-slate-50"
                    value={formData.nip}
                    onChange={(e) =>
                      setFormData({ ...formData, nip: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="budi@sekolah.sch.id"
                    className="bg-slate-50"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    No. HP
                  </Label>
                  <Input
                    placeholder="08123456789"
                    className="bg-slate-50"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Bidang Studi
                  </Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(v) =>
                      setFormData({ ...formData, subject: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue placeholder="Pilih Mapel" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s: any) => (
                        <SelectItem key={s._id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Jenis Kelamin
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(v) =>
                      setFormData({ ...formData, gender: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-school-navy">Alamat</Label>
                <Input
                  placeholder="Jl. Pendidikan No. 123, Jakarta"
                  className="bg-slate-50"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full font-bold"
              >
                {submitting ? (
                  <>
                    <SystemRestart className="mr-2 animate-spin" /> Menyimpan...
                  </>
                ) : editingTeacher ? (
                  "Simpan Perubahan"
                ) : (
                  "Daftarkan Guru"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <CardTitle className="font-serif text-lg text-school-navy flex items-center gap-2">
            <UserBadgeCheck className="w-5 h-5 text-school-gold" /> Daftar Guru
            Terdaftar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-school-navy">
              <TableRow className="hover:bg-school-navy">
                <TableHead className="text-white font-bold">NIP</TableHead>
                <TableHead className="text-white font-bold">
                  Nama Guru
                </TableHead>
                <TableHead className="text-white font-bold">Username</TableHead>
                <TableHead className="text-white font-bold">
                  Bidang Studi
                </TableHead>
                <TableHead className="text-white font-bold">Kontak</TableHead>
                <TableHead className="text-white font-bold text-center">
                  Status
                </TableHead>
                <TableHead className="text-white font-bold text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    <div className="flex flex-col items-center justify-center text-school-gold">
                      <SystemRestart className="h-6 w-6 animate-spin mb-2" />
                      <p className="text-sm text-slate-500">
                        Memuat data guru...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center h-24 text-slate-500"
                  >
                    {searchQuery
                      ? "Guru tidak ditemukan."
                      : "Belum ada data guru."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TableRow
                    key={teacher._id}
                    className="hover:bg-slate-50 border-b border-slate-100"
                  >
                    <TableCell className="font-mono text-xs font-bold text-school-navy">
                      {teacher.profile?.nip || "-"}
                    </TableCell>
                    <TableCell className="font-bold text-slate-700">
                      {teacher.profile?.fullName}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      @{teacher.username}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-school-navy text-school-navy"
                      >
                        {teacher.profile?.subject || "Belum Diatur"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-slate-500">
                        {teacher.profile?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />{" "}
                            {teacher.profile.phone}
                          </span>
                        )}
                        {teacher.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {teacher.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          teacher.isActive !== false
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-500 hover:bg-red-600"
                        }
                      >
                        {teacher.isActive !== false ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHoriz className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(teacher)}
                            className="cursor-pointer"
                          >
                            <EditPencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(teacher._id)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default MasterTeacherPage;
