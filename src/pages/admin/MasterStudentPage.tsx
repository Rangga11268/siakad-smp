import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import api from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  User,
  Search,
  UserPlus,
  Group,
  GraduationCap,
  SystemRestart,
  EditPencil,
  FilterList,
  Eye,
} from "iconoir-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Student {
  _id: string;
  username: string;
  role: string;
  profile: {
    fullName: string;
    nisn: string;
    gender: string;
    level: string;
    class: string;
    birthPlace?: string;
    birthDate?: string;
    address?: string;
    physical?: {
      height: number;
      weight: number;
      headCircumference: number;
      bloodType: string;
    };
    family?: {
      fatherName: string;
      motherName: string;
      guardianName: string;
      parentJob: string;
      parentIncome: string;
      kipStatus: boolean;
      kipNumber: string;
    };
  };
}

const MasterStudentPage = () => {
  const navigate = useNavigate(); // Hook Navigasi
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all"); // Filter Kelas
  const [classes, setClasses] = useState<any[]>([]); // Data Kelas

  const [isOpen, setIsOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const initialFormState = {
    username: "",
    password: "",
    fullName: "",
    nisn: "",
    gender: "L",
    level: "7",
    className: "7A",
    birthPlace: "",
    birthDate: "",
    address: "",
    // Phys
    height: "0",
    weight: "0",
    headCircumference: "0",
    bloodType: "-",
    // Family
    fatherName: "",
    motherName: "",
    guardianName: "",
    parentJob: "",
    parentIncome: "",
    kipStatus: "false",
    kipNumber: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentRes, classRes] = await Promise.all([
        api.get("/academic/students"),
        api.get("/academic/class"),
      ]);
      setStudents(studentRes.data);
      setClasses(classRes.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal memuat data",
        description: "Tidak dapat mengambil daftar siswa terbaru.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (student?: Student) => {
    if (student) {
      setIsEditing(true);
      setSelectedId(student._id);
      setFormData({
        ...initialFormState,
        username: student.username,
        fullName: student.profile.fullName,
        nisn: student.profile.nisn || "",
        gender: student.profile.gender || "L",
        level: student.profile.level || "7",
        className: student.profile.class || "",
        birthPlace: student.profile.birthPlace || "",
        birthDate: student.profile.birthDate
          ? new Date(student.profile.birthDate).toISOString().split("T")[0]
          : "",
        address: student.profile.address || "",
        // Phys
        height: student.profile.physical?.height?.toString() || "0",
        weight: student.profile.physical?.weight?.toString() || "0",
        headCircumference:
          student.profile.physical?.headCircumference?.toString() || "0",
        bloodType: student.profile.physical?.bloodType || "-",
        // Family
        fatherName: student.profile.family?.fatherName || "",
        motherName: student.profile.family?.motherName || "",
        guardianName: student.profile.family?.guardianName || "",
        parentJob: student.profile.family?.parentJob || "",
        parentIncome: student.profile.family?.parentIncome || "",
        kipStatus: student.profile.family?.kipStatus ? "true" : "false",
        kipNumber: student.profile.family?.kipNumber || "",
      });
    } else {
      setIsEditing(false);
      setSelectedId(null);
      setFormData(initialFormState);
    }
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      const payload = {
        username: formData.username,
        password: formData.password, // Only sent if not empty
        fullName: formData.fullName,
        nisn: formData.nisn,
        gender: formData.gender,
        level: formData.level,
        className: formData.className,
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate || undefined,
        address: formData.address,
        physical: {
          height: parseInt(formData.height) || 0,
          weight: parseInt(formData.weight) || 0,
          headCircumference: parseInt(formData.headCircumference) || 0,
          bloodType: formData.bloodType,
        },
        family: {
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          guardianName: formData.guardianName,
          parentJob: formData.parentJob,
          parentIncome: formData.parentIncome,
          kipStatus: formData.kipStatus === "true",
          kipNumber: formData.kipNumber,
        },
      };

      if (isEditing && selectedId) {
        await api.put(`/academic/students/${selectedId}`, payload);
        toast({ title: "Updated", description: "Data siswa diperbarui." });
      } else {
        await api.post("/academic/students", payload);
        toast({ title: "Created", description: "Siswa baru ditambahkan." });
      }

      setIsOpen(false);
      setSearch(""); // Reset filter agar data baru langsung terlihat
      fetchData(); // Refresh all
    } catch (error: any) {
      console.error("Submit Error:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan data.";
      const validationDetails = error.response?.data?.errors
        ?.map((e: any) => `- ${e.message}`)
        .join("\n");

      toast({
        variant: "destructive",
        title: "Gagal Validasi",
        description: (
          <div className="whitespace-pre-wrap">
            {errorMessage}
            {validationDetails && (
              <>
                <br />
                {validationDetails}
              </>
            )}
          </div>
        ),
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.profile?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.profile?.nisn?.includes(search);
    const matchesClass =
      classFilter === "all" || s.profile?.class === classFilter;

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Data Siswa (Buku Induk)
          </h2>
          <p className="text-slate-500">
            Manajemen data induk siswa lengkap sesuai Dapodik & Kurikulum
            Merdeka.
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-lg transition-all text-white px-6 py-2"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Registrasi Siswa Baru
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="font-serif text-2xl text-school-navy">
              {isEditing ? "Edit Data Siswa" : "Registrasi Siswa Baru"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi biodata siswa, data fisik, dan informasi orang tua dengan
              benar.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-lg mb-6">
              <TabsTrigger
                value="identity"
                className="data-[state=active]:bg-school-navy data-[state=active]:text-white data-[state=active]:shadow-md font-medium transition-all"
              >
                Identitas
              </TabsTrigger>
              <TabsTrigger
                value="physical"
                className="data-[state=active]:bg-school-navy data-[state=active]:text-white data-[state=active]:shadow-md font-medium transition-all"
              >
                Fisik & Kesehatan
              </TabsTrigger>
              <TabsTrigger
                value="family"
                className="data-[state=active]:bg-school-navy data-[state=active]:text-white data-[state=active]:shadow-md font-medium transition-all"
              >
                Keluarga & Wali
              </TabsTrigger>
            </TabsList>

            {/* TAB IDENTITAS */}
            <TabsContent value="identity" className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">NISN</Label>
                  <Input
                    value={formData.nisn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nisn: e.target.value,
                        username: !isEditing
                          ? e.target.value
                          : formData.username,
                      })
                    }
                    placeholder="0012345678"
                    className="border-slate-300 focus:border-school-gold bg-slate-50"
                  />
                  {!isEditing && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      *Username otomatis mengikuti NISN
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Password {isEditing && "(Isi jika ingin ubah)"}
                  </Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={
                      isEditing
                        ? "Biarkan kosong jika tetap"
                        : "Default: 123456"
                    }
                    className="border-slate-300 focus:border-school-gold bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">
                  Nama Lengkap
                </Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="border-slate-300 focus:border-school-gold bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(v) =>
                      setFormData({ ...formData, gender: v })
                    }
                  >
                    <SelectTrigger className="border-slate-300 bg-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Tingkat
                  </Label>
                  <Select
                    value={formData.level}
                    onValueChange={(v) =>
                      setFormData({ ...formData, level: v })
                    }
                  >
                    <SelectTrigger className="border-slate-300 bg-slate-50">
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
                  <Label className="font-semibold text-slate-700">Kelas</Label>
                  <Input
                    value={formData.className}
                    onChange={(e) =>
                      setFormData({ ...formData, className: e.target.value })
                    }
                    placeholder="7A"
                    className="border-slate-300 focus:border-school-gold bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Tempat Lahir
                  </Label>
                  <Input
                    value={formData.birthPlace}
                    onChange={(e) =>
                      setFormData({ ...formData, birthPlace: e.target.value })
                    }
                    className="border-slate-300 focus:border-school-gold bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Tanggal Lahir
                  </Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    className="border-slate-300 focus:border-school-gold bg-slate-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">
                  Alamat Lengkap
                </Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Jl. Raya..."
                  className="border-slate-300 focus:border-school-gold bg-slate-50"
                />
              </div>
            </TabsContent>

            {/* TAB FISIK */}
            <TabsContent value="physical" className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Tinggi Badan (cm)
                  </Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    className="border-slate-300 focus:border-school-gold bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Berat Badan (kg)
                  </Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    className="border-slate-300 focus:border-school-gold bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Lingkar Kepala (cm)
                  </Label>
                  <Input
                    type="number"
                    value={formData.headCircumference}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        headCircumference: e.target.value,
                      })
                    }
                    className="border-slate-300 focus:border-school-gold bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Golongan Darah
                  </Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(v) =>
                      setFormData({ ...formData, bloodType: v })
                    }
                  >
                    <SelectTrigger className="border-slate-300 bg-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="O">O</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* TAB KELUARGA */}
            <TabsContent value="family" className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Nama Ayah
                  </Label>
                  <Input
                    value={formData.fatherName}
                    onChange={(e) =>
                      setFormData({ ...formData, fatherName: e.target.value })
                    }
                    className="border-slate-300 focus:border-school-gold bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Nama Ibu
                  </Label>
                  <Input
                    value={formData.motherName}
                    onChange={(e) =>
                      setFormData({ ...formData, motherName: e.target.value })
                    }
                    className="border-slate-300 focus:border-school-gold bg-slate-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">
                  Pekerjaan Orang Tua
                </Label>
                <Input
                  value={formData.parentJob}
                  onChange={(e) =>
                    setFormData({ ...formData, parentJob: e.target.value })
                  }
                  placeholder="Wiraswasta/PNS/Buruh..."
                  className="border-slate-300 focus:border-school-gold bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">
                  Penghasilan Bulanan
                </Label>
                <Select
                  value={formData.parentIncome}
                  onValueChange={(v) =>
                    setFormData({ ...formData, parentIncome: v })
                  }
                >
                  <SelectTrigger className="border-slate-300 bg-slate-50">
                    <SelectValue placeholder="Pilih Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="< 1 Juta">Kurang dari 1 Juta</SelectItem>
                    <SelectItem value="1 - 3 Juta">1 - 3 Juta</SelectItem>
                    <SelectItem value="3 - 5 Juta">3 - 5 Juta</SelectItem>
                    <SelectItem value="> 5 Juta">Lebih dari 5 Juta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-orange-50 border-orange-100">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Status KIP/KKS
                  </Label>
                  <Select
                    value={formData.kipStatus}
                    onValueChange={(v) =>
                      setFormData({ ...formData, kipStatus: v })
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Tidak Ada</SelectItem>
                      <SelectItem value="true">Ada (Penerima)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.kipStatus === "true" && (
                  <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">
                      Nomor KIP
                    </Label>
                    <Input
                      value={formData.kipNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, kipNumber: e.target.value })
                      }
                      className="bg-white"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="mr-2"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitLoading}
              className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold min-w-[150px]"
            >
              {submitLoading && (
                <SystemRestart className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Update Data Siswa" : "Simpan Siswa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-t-4 border-t-school-gold shadow-lg border-none">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-school-gold" />
              Daftar Siswa Aktif
            </CardTitle>
            <div className="flex flex-1 gap-2 w-full md:w-auto">
              <div className="w-40">
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <FilterList className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Semua Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {classes.map((cls: any) => (
                      <SelectItem key={cls._id} value={cls.name}>
                        Kelas {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari siswa berdasarkan nama atau NISN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-slate-200 focus:border-school-gold focus:ring-school-gold bg-slate-50 rounded-full w-full"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-school-navy">
              <TableRow className="hover:bg-school-navy">
                <TableHead className="text-white font-bold w-[120px]">
                  NISN
                </TableHead>
                <TableHead className="text-white font-bold">
                  Nama Lengkap
                </TableHead>
                <TableHead className="text-white font-bold text-center w-[80px]">
                  L/P
                </TableHead>
                <TableHead className="text-white font-bold w-[100px]">
                  Kelas
                </TableHead>
                <TableHead className="text-white font-bold text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-48">
                    <div className="flex flex-col items-center justify-center text-school-gold">
                      <SystemRestart className="h-8 w-8 animate-spin mb-2" />
                      <p className="text-slate-500 font-medium">
                        Memuat data siswa...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-48 py-12 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Group className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="font-medium text-lg">
                        Tidak ada data siswa ditemukan.
                      </p>
                      <p className="text-sm">
                        Silakan tambah siswa baru atau gunakan filter lain.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((s) => (
                  <TableRow
                    key={s._id}
                    className="hover:bg-slate-50 border-b border-slate-100 shadow-sm"
                  >
                    <TableCell className="font-bold text-school-navy">
                      {s.profile?.nisn || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">
                          {s.profile?.fullName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                          {s.username}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium bg-slate-50 mx-2">
                      {s.profile?.gender}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold transition-colors focus:outline-none border-blue-200 bg-blue-50 text-blue-700">
                        {s.profile?.class || "Belum Ada"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/dashboard/academic/students/${s._id}`)
                        }
                        className="text-slate-500 hover:text-school-navy hover:bg-blue-50 mr-1"
                      >
                        <Eye className="w-4 h-4 mr-2" /> Profil
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(s)}
                        className="text-slate-500 hover:text-orange-600 hover:bg-orange-50"
                      >
                        <EditPencil className="h-4 w-4" />
                      </Button>
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

export default MasterStudentPage;
