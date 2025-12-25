import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Search,
  Plus,
  Filter,
  Wallet,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";

const FinanceDashboard = () => {
  const [billings, setBillings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openGenerate, setOpenGenerate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("all");

  // Stats
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0 });

  // Form Generate
  const [formData, setFormData] = useState({
    title: "SPP Januari 2025",
    amount: "150000",
    dueDate: "",
    type: "SPP",
    targetClass: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchBillings();
    fetchClasses();
  }, [statusFilter]);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/academic/class");
      setClasses(res.data);
    } catch (e) {
      console.error("Gagal load kelas", e);
    }
  };

  const fetchBillings = async () => {
    setLoading(true);
    try {
      const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await api.get(`/finance/all${query}`);
      setBillings(res.data);
      calculateStats(res.data);
    } catch (error) {
      console.error("Gagal load tagihan", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    const total = data.reduce((acc, curr) => acc + curr.amount, 0);
    const paid = data
      .filter((b) => b.status === "paid")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const unpaid = total - paid;
    setStats({ total, paid, unpaid });
  };

  // Format Currency (Display "Rp ...")
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const { toast } = useToast();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    setFormData({ ...formData, amount: rawValue });
  };

  const handleGenerate = async () => {
    if (!formData.dueDate || !formData.amount) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Nominal dan Tanggal Jatuh Tempo wajib diisi.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/finance/generate", {
        ...formData,
        amount: parseInt(formData.amount),
        // If targetClass is empty string, send null or let backend handle it (backend checks if truthy)
      });
      setOpenGenerate(false);
      fetchBillings();
      toast({
        title: "Berhasil",
        description: res.data.message || "Tagihan massal berhasil dibuat.",
      });
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal generate tagihan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (id: string, currentStatus: string) => {
    if (currentStatus === "paid") return;
    try {
      await api.post("/finance/pay", { billingId: id });
      fetchBillings();
      toast({
        title: "Pembayaran Diterima",
        description: "Status tagihan telah diperbarui menjadi Lunas.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal update pembayaran.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Keuangan & SPP</h2>
          <p className="text-muted-foreground">
            Monitoring pembayaran siswa dan generate tagihan rutin.
          </p>
        </div>
        <Dialog open={openGenerate} onOpenChange={setOpenGenerate}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" /> Generate Tagihan Massal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Buat Tagihan (Massal)</DialogTitle>
              <DialogDescription>
                Membuat tagihan untuk siswa sesuai kriteria.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Judul</Label>
                <Input
                  className="col-span-3"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Misal: SPP Februari 2025"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Target Kelas</Label>
                <Select
                  value={formData.targetClass}
                  onValueChange={(v) =>
                    setFormData({ ...formData, targetClass: v })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Semua Siswa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_classes">Semua Siswa</SelectItem>
                    {classes.map((c: any) => (
                      <SelectItem key={c._id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Jenis Tagihan</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPP">SPP Bulanan</SelectItem>
                    <SelectItem value="Gedung">Uang Gedung</SelectItem>
                    <SelectItem value="Seragam">Seragam</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nominal (Rp)</Label>
                <div className="col-span-3 relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                    Rp
                  </span>
                  <Input
                    className="pl-9"
                    value={formData.amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.amount
                      ? formatRupiah(parseInt(formData.amount))
                      : "Rp 0"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Jatuh Tempo</Label>
                <Input
                  type="date"
                  className="col-span-3"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleGenerate} disabled={submitting}>
                {submitting ? "Memproses..." : "Generate & Kirim"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tagihan (Filter)
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRupiah(stats.total)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Lunas / Masuk
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatRupiah(stats.paid)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Belum Bayar
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatRupiah(stats.unpaid)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="unpaid">Belum Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Siswa</TableHead>
                <TableHead>Tagihan</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Jatuh Tempo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billings.map((bill: any) => (
                <TableRow key={bill._id}>
                  <TableCell>
                    <div className="font-medium">
                      {bill.student?.profile?.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bill.student?.profile?.nisn}
                    </div>
                  </TableCell>
                  <TableCell>{bill.title}</TableCell>
                  <TableCell>{formatRupiah(bill.amount)}</TableCell>
                  <TableCell>
                    {new Date(bill.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        bill.status === "paid" ? "default" : "destructive"
                      }
                      className={bill.status === "paid" ? "bg-green-600" : ""}
                    >
                      {bill.status === "paid" ? "Lunas" : "Belum Bayar"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {bill.status === "unpaid" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePay(bill._id, bill.status)}
                      >
                        Verifikasi Bayar
                      </Button>
                    )}
                    {bill.status === "paid" && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(bill.paidDate).toLocaleDateString()}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;
