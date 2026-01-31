import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  CheckCircle,
  Xmark,
  Eye,
  WarningTriangle,
  Search,
  FilterList,
} from "iconoir-react";

interface Bill {
  _id: string;
  student: {
    _id: string;
    username: string;
    profile?: { fullName: string; nisn: string };
  };
  title: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "waiting_verification";
  paymentType: string;
  evidence?: string;
  createdAt: string;
}

interface Student {
  _id: string;
  username: string;
  profile: { fullName: string; nisn: string };
}

const FinanceDashboard = () => {
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    outstanding: 0,
    collected: 0,
    today: 0,
    pending: 0,
  });

  // Create State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([]);

  // Filter States
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [createForm, setCreateForm] = useState({
    targetType: "student", // student, class, level
    targetValue: "",
    title: "",
    amount: 0,
    dueDate: "",
  });

  // Verification State
  const [verifyingBill, setVerifyingBill] = useState<Bill | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billRes, stRes, statsRes] = await Promise.all([
        api.get("/finance"),
        api.get("/academic/students"),
        api.get("/finance/stats"),
      ]);
      setBills(billRes.data);
      setStudents(stRes.data);
      setStats(statsRes.data);

      // Extract classes
      const classes = Array.from(
        new Set(stRes.data.map((s: any) => s.profile?.class).filter(Boolean)),
      ) as string[];
      setUniqueClasses(classes.sort());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.targetValue || !createForm.title || !createForm.amount) {
      toast({ variant: "destructive", title: "Mohon lengkapi form" });
      return;
    }
    try {
      const res = await api.post("/finance", createForm);
      toast({ title: "Tagihan Dibuat", description: res.data.message });
      setIsCreateOpen(false);
      setCreateForm({
        targetType: "student",
        targetValue: "",
        title: "",
        amount: 0,
        dueDate: "",
      });
      fetchData();
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal buat tagihan" });
    }
  };

  const handleVerify = async (action: "approve" | "reject") => {
    if (!verifyingBill) return;
    try {
      await api.put("/finance/confirm", {
        billId: verifyingBill._id,
        action,
      });
      toast({
        title:
          action === "approve" ? "Pembayaran Diterima" : "Pembayaran Ditolak",
      });
      setVerifyingBill(null);
      fetchData(); // Refresh stats too
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal verifikasi" });
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);
  };

  const handleExportCSV = () => {
    const headers = ["Tanggal,Siswa,Kelas,Judul,Status,Metode,Jumlah"];
    const rows = bills.map(
      (b) =>
        `${new Date(b.createdAt).toLocaleDateString()},"${b.student?.profile?.fullName || "Deleted"}",${b.student?.profile?.class || "-"},"${b.title}",${b.status},${b.paymentType},${b.amount}`,
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `laporan_keuangan_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Logic
  const filteredBills = bills.filter((bill) => {
    const matchesClass =
      classFilter === "all" || bill.student?.profile?.class === classFilter;
    const matchesStatus =
      statusFilter === "all" || bill.status === statusFilter;
    const matchesSearch =
      bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.student?.profile?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesClass && matchesStatus && matchesSearch;
  });

  const pendingVerification = bills.filter(
    (b) => b.status === "waiting_verification",
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-school-navy">
            Keuangan Sekolah
          </h2>
          <p className="text-slate-500">
            Kelola SPP, tagihan, dan verifikasi pembayaran.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FilterList className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-school-navy hover:bg-school-gold hover:text-school-navy"
          >
            <Plus className="mr-2 h-4 w-4" /> Buat Tagihan Baru
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-school-navy text-white border-none">
          <CardContent className="p-6">
            <p className="text-white/70 text-sm">Pemasukan Hari Ini</p>
            <h3 className="text-2xl font-bold">{formatRupiah(stats.today)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-500 text-sm">Total Tagihan Lunas</p>
            <h3 className="text-2xl font-bold text-green-600">
              {formatRupiah(stats.collected)}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-500 text-sm">Total Outstanding</p>
            <h3 className="text-2xl font-bold text-red-600">
              {formatRupiah(stats.outstanding)}
            </h3>
          </CardContent>
        </Card>
        <Card
          className={stats.pending > 0 ? "bg-yellow-50 border-yellow-200" : ""}
        >
          <CardContent className="p-6">
            <p className="text-slate-500 text-sm">Perlu Verifikasi</p>
            <h3 className="text-2xl font-bold text-yellow-700">
              {stats.pending} Transaksi
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Verification Alert */}
      {pendingVerification.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <WarningTriangle className="w-5 h-5" /> Perlu Verifikasi (
              {pendingVerification.length})
            </CardTitle>
            <CardDescription>
              Ada pembayaran manual yang perlu dicek buktinya.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Tagihan</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Bukti</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingVerification.map((bill) => (
                  <TableRow key={bill._id}>
                    <TableCell className="font-bold">
                      {bill.student.profile?.fullName}
                    </TableCell>
                    <TableCell>{bill.title}</TableCell>
                    <TableCell>{formatRupiah(bill.amount)}</TableCell>
                    <TableCell>
                      {bill.evidence && (
                        <a
                          href={`http://localhost:5000${bill.evidence}`}
                          target="_blank"
                          className="text-blue-600 underline text-xs"
                        >
                          Lihat Bukti
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => setVerifyingBill(bill)}
                        className="bg-school-navy text-white text-xs h-8"
                      >
                        Proses
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <CardTitle>Daftar Semua Tagihan</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari Siswa/Tagihan..."
                  className="pl-9 w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border rounded px-3 text-sm bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="paid">Lunas</option>
                <option value="pending">Belum Bayar</option>
                <option value="failed">Gagal</option>
              </select>
              <select
                className="border rounded px-3 text-sm bg-white"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">Semua Kelas</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>
                    Kelas {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      Loading data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center h-24 text-slate-500"
                  >
                    Data tidak ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBills.map((bill) => (
                  <TableRow key={bill._id}>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {bill.student?.profile?.fullName || "Deleted User"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {bill.student?.profile?.class || "-"}
                    </TableCell>
                    <TableCell>{bill.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          bill.status === "paid"
                            ? "default"
                            : bill.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                        className={bill.status === "paid" ? "bg-green-600" : ""}
                      >
                        {bill.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs uppercase text-slate-500">
                      {bill.paymentType}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatRupiah(bill.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Tagihan Baru</DialogTitle>
            <DialogDescription>
              Bisa untuk satu siswa, satu kelas, atau satu angkatan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Target Tagihan</label>
              <select
                className="w-full border rounded p-2"
                value={createForm.targetType}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    targetType: e.target.value,
                    targetValue: "",
                  })
                }
              >
                <option value="student">Per Siswa</option>
                <option value="class">Per Kelas</option>
                <option value="level">Per Tingkatan (Angkatan)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">
                {createForm.targetType === "student"
                  ? "Pilih Siswa"
                  : createForm.targetType === "class"
                    ? "Pilih Kelas"
                    : "Pilih Tingkatan"}
              </label>

              {createForm.targetType === "student" && (
                <select
                  className="w-full border rounded p-2"
                  value={createForm.targetValue}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      targetValue: e.target.value,
                    })
                  }
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.profile?.fullName} ({s.profile?.nisn})
                    </option>
                  ))}
                </select>
              )}

              {createForm.targetType === "class" && (
                <select
                  className="w-full border rounded p-2"
                  value={createForm.targetValue}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      targetValue: e.target.value,
                    })
                  }
                >
                  <option value="">-- Pilih Kelas --</option>
                  {uniqueClasses.map((c) => (
                    <option key={c} value={c}>
                      Kelas {c}
                    </option>
                  ))}
                </select>
              )}

              {createForm.targetType === "level" && (
                <select
                  className="w-full border rounded p-2"
                  value={createForm.targetValue}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      targetValue: e.target.value,
                    })
                  }
                >
                  <option value="">-- Pilih Tingkatan --</option>
                  <option value="7">Kelas 7</option>
                  <option value="8">Kelas 8</option>
                  <option value="9">Kelas 9</option>
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">Judul Tagihan</label>
              <Input
                placeholder="Contoh: SPP Februari 2025"
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm({ ...createForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Nominal (Rp)</label>
              <Input
                type="number"
                placeholder="500000"
                value={createForm.amount}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    amount: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Jatuh Tempo</label>
              <Input
                type="date"
                value={createForm.dueDate}
                onChange={(e) =>
                  setCreateForm({ ...createForm, dueDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreate}
              className="bg-school-navy text-white w-full"
            >
              Buat Tagihan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog
        open={!!verifyingBill}
        onOpenChange={(o) => !o && setVerifyingBill(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verifikasi Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            {verifyingBill?.evidence && (
              <div className="border p-2 rounded max-h-[300px] overflow-auto">
                <img
                  src={`http://localhost:5000${verifyingBill.evidence}`}
                  alt="Bukti"
                  className="w-full"
                />
              </div>
            )}
            <p>Apakah bukti valid dan dana sudah diterima?</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => handleVerify("approve")}
                className="bg-green-600 hover:bg-green-700"
              >
                Terima (Approve)
              </Button>
              <Button
                onClick={() => handleVerify("reject")}
                variant="destructive"
              >
                Tolak (Reject)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceDashboard;
