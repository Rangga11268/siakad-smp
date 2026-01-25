import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SystemRestart, GraduationCap, CheckCircle } from "iconoir-react";

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Data States
  const [academicData, setAcademicData] = useState<any>(null);
  const [financeData, setFinanceData] = useState<any[]>([]);
  const [disciplineData, setDisciplineData] = useState<any[]>([]);

  useEffect(() => {
    // Cast to any to access children (dynamically populated by backend)
    const currentUser = user as any;
    if (currentUser?.children && currentUser.children.length > 0) {
      setChildren(currentUser.children);
      setSelectedChild(currentUser.children[0]._id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildData = async (studentId: string) => {
    setLoading(true);
    try {
      // 1. Finance (Bills)
      const resFinance = await api.get(`/finance/all?studentId=${studentId}`);
      setFinanceData(resFinance.data);

      // 2. Discipline (Incidents)
      const resBk = await api.get(`/bk/student/${studentId}`);
      setDisciplineData(resBk.data);

      // 3. Academic
      setAcademicData({
        gpa: 88.5,
        attendance: 95,
        semester: "Ganjil 2024/2025",
      });
    } catch (error) {
      console.error("Gagal load data anak", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  if (!user || user.role !== "parent") {
    return <div>Akses Ditolak. Halaman ini khusus Orang Tua.</div>;
  }

  if (children.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">
          Tidak ada data anak yang terhubung.
        </h2>
        <p className="text-muted-foreground">
          Hubungi Admin Sekolah untuk menghubungkan akun Anda dengan data siswa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Dashboard Orang Tua
          </h2>
          <p className="text-muted-foreground">
            Pantau perkembangan akademik dan administrasi putra/putri Anda.
          </p>
        </div>

        <div className="w-full md:w-64">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Anak" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child._id} value={child._id}>
                  {child.profile?.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <SystemRestart className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="academic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="academic">Akademik</TabsTrigger>
            <TabsTrigger value="finance">Keuangan</TabsTrigger>
            <TabsTrigger value="discipline">Kesiswaan</TabsTrigger>
          </TabsList>

          {/* ACADEMIC TAB */}
          <TabsContent value="academic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Rata-Rata Nilai
                  </CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{academicData?.gpa}</div>
                  <p className="text-xs text-muted-foreground">
                    Semester {academicData?.semester}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Kehadiran
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    Rajin
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {academicData?.attendance}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total Pertemuan
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Info Akademik</CardTitle>
                <CardDescription>
                  Detail nilai belum tersedia (Segera Hadir).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
                  Modul Rapor Digital sedang disiapkan sekolah.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FINANCE TAB */}
          <TabsContent value="finance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Tagihan</CardTitle>
                <CardDescription>
                  Status pembayaran SPP dan tagihan lainnya.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul Tagihan</TableHead>
                      <TableHead>Jatuh Tempo</TableHead>
                      <TableHead>Nominal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financeData.map((bill) => (
                      <TableRow key={bill._id}>
                        <TableCell className="font-medium">
                          {bill.title}
                        </TableCell>
                        <TableCell>
                          {new Date(bill.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatRupiah(bill.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              bill.status === "paid" ? "default" : "destructive"
                            }
                            className={
                              bill.status === "paid" ? "bg-green-600" : ""
                            }
                          >
                            {bill.status === "paid" ? "Lunas" : "Belum Bayar"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {financeData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Tidak ada tagihan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DISCIPLINE TAB */}
          <TabsContent value="discipline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Catatan Kedisiplinan</CardTitle>
                <CardDescription>
                  Riwayat pelanggaran tata tertib sekolah.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jenis Pelanggaran</TableHead>
                      <TableHead>Poin</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disciplineData.map((inc) => (
                      <TableRow key={inc._id}>
                        <TableCell>
                          {new Date(inc.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{inc.type}</Badge>
                        </TableCell>
                        <TableCell className="text-red-600 font-bold">
                          +{inc.point}
                        </TableCell>
                        <TableCell>{inc.description}</TableCell>
                      </TableRow>
                    ))}
                    {disciplineData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-green-600">
                            <CheckCircle className="h-8 w-8" />
                            <p>
                              Anak Anda Tertib! Tidak ada catatan pelanggaran.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ParentDashboard;
