import { useState, useEffect } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Loader2, Users, Edit, Trash2 } from "lucide-react";
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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const fetchStudents = async () => {
    try {
      const { data } = await api.get("/academic/students");
      setStudents(data);
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
    fetchStudents();
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
        birthDate: formData.birthDate,
        address: formData.address,
        physical: {
          height: parseInt(formData.height),
          weight: parseInt(formData.weight),
          headCircumference: parseInt(formData.headCircumference),
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
      fetchStudents();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    s.profile?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Data Siswa (Buku Induk)
          </h2>
          <p className="text-muted-foreground">
            Manajemen data indik siswa lengkap sesuai Dapodik.
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Tambah Siswa Baru
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Data Siswa" : "Registrasi Siswa Baru"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi biodata siswa, data fisik, dan informasi orang tua.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="identity">Identitas</TabsTrigger>
              <TabsTrigger value="physical">Fisik & Kesehatan</TabsTrigger>
              <TabsTrigger value="family">Keluarga & Wali</TabsTrigger>
            </TabsList>

            {/* TAB IDENTITAS */}
            <TabsContent value="identity" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>NISN</Label>
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
                  />
                  {!isEditing && (
                    <p className="text-[10px] text-muted-foreground">
                      *Username otomatis NISN
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Password {isEditing && "(Isi jika ingin ubah)"}</Label>
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(v) =>
                      setFormData({ ...formData, gender: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tingkat</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(v) =>
                      setFormData({ ...formData, level: v })
                    }
                  >
                    <SelectTrigger>
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
                  <Label>Kelas</Label>
                  <Input
                    value={formData.className}
                    onChange={(e) =>
                      setFormData({ ...formData, className: e.target.value })
                    }
                    placeholder="7A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tempat Lahir</Label>
                  <Input
                    value={formData.birthPlace}
                    onChange={(e) =>
                      setFormData({ ...formData, birthPlace: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Lahir</Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alamat Lengkap</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Jl. Raya..."
                />
              </div>
            </TabsContent>

            {/* TAB FISIK */}
            <TabsContent value="physical" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tinggi Badan (cm)</Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Berat Badan (kg)</Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lingkar Kepala (cm)</Label>
                  <Input
                    type="number"
                    value={formData.headCircumference}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        headCircumference: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Golongan Darah</Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(v) =>
                      setFormData({ ...formData, bloodType: v })
                    }
                  >
                    <SelectTrigger>
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
            <TabsContent value="family" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Ayah</Label>
                  <Input
                    value={formData.fatherName}
                    onChange={(e) =>
                      setFormData({ ...formData, fatherName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Ibu</Label>
                  <Input
                    value={formData.motherName}
                    onChange={(e) =>
                      setFormData({ ...formData, motherName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pekerjaan Orang Tua</Label>
                <Input
                  value={formData.parentJob}
                  onChange={(e) =>
                    setFormData({ ...formData, parentJob: e.target.value })
                  }
                  placeholder="Wiraswasta/PNS/Buruh..."
                />
              </div>
              <div className="space-y-2">
                <Label>Penghasilan Bulanan</Label>
                <Select
                  value={formData.parentIncome}
                  onValueChange={(v) =>
                    setFormData({ ...formData, parentIncome: v })
                  }
                >
                  <SelectTrigger>
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
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-slate-50">
                <div className="space-y-2">
                  <Label>Status KIP/KKS</Label>
                  <Select
                    value={formData.kipStatus}
                    onValueChange={(v) =>
                      setFormData({ ...formData, kipStatus: v })
                    }
                  >
                    <SelectTrigger>
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
                    <Label>Nomor KIP</Label>
                    <Input
                      value={formData.kipNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, kipNumber: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Update Data" : "Simpan Siswa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari siswa berdasarkan nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NISN</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>L/P</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Tidak ada data siswa.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium">
                    {s.profile?.nisn || "-"}
                  </TableCell>
                  <TableCell>
                    {s.profile?.fullName}
                    <div className="text-[10px] text-muted-foreground">
                      {s.username}
                    </div>
                  </TableCell>
                  <TableCell>{s.profile?.gender}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {s.profile?.class || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(s)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Detail / Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MasterStudentPage;
