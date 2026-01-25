import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Wallet,
  CheckCircle,
  XCircle,
  Printer,
  AlertOctagon,
  Loader2,
  DollarSign,
  FileText,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const FinanceDashboard = () => {
  const { user } = useAuth();
  const [billings, setBillings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [agingReport, setAgingReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openGenerate, setOpenGenerate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

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

  useEffect(() => {
    if (activeTab === "report") {
      fetchAgingReport();
    }
  }, [activeTab]);

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

  const fetchAgingReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/finance/aging-report");
      setAgingReport(res.data);
    } catch (error) {
      console.error("Gagal load laporan", error);
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
        targetClass:
          formData.targetClass === "all_classes" ? "" : formData.targetClass,
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Keuangan & SPP
          </h2>
          <p className="text-slate-500">
            Monitoring pembayaran siswa, generate tagihan (SPP/Gedung), dan
            laporan piutang.
          </p>
        </div>
        {user?.role !== "student" && (
          <Dialog open={openGenerate} onOpenChange={setOpenGenerate}>
            <DialogTrigger asChild>
              <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all">
                <Plus className="mr-2 h-4 w-4" /> Generate Tagihan Massal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-school-navy">
                  Buat Tagihan (Massal)
                </DialogTitle>
                <DialogDescription>
                  Tagihan akan dikirim ke seluruh siswa atau kelas tertentu.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Judul Tagihan
                  </Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Misal: SPP Februari 2025"
                    className="bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Target Kelas
                    </Label>
                    <Select
                      value={formData.targetClass}
                      onValueChange={(v) =>
                        setFormData({ ...formData, targetClass: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
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
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Jenis Tagihan
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, type: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Nominal (Rp)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500 font-semibold">
                        Rp
                      </span>
                      <Input
                        className="pl-9 bg-slate-50 border-slate-200 font-bold text-school-navy"
                        value={formData.amount}
                        onChange={handleAmountChange}
                        placeholder="0"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.amount
                        ? formatRupiah(parseInt(formData.amount))
                        : "Rp 0"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Jatuh Tempo
                    </Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleGenerate}
                  disabled={submitting}
                  className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full font-bold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Generate & Kirim Tagihan
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500">
                Total Tagihan
              </h3>
              <div className="text-2xl font-bold text-school-navy mt-1">
                {formatRupiah(stats.total)}
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500">
                Lunas / Diterima
              </h3>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {formatRupiah(stats.paid)}
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500">
                Belum Dibayar (Piutang)
              </h3>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {formatRupiah(stats.unpaid)}
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-full text-red-600">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="overview"
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white px-6"
          >
            <Wallet className="w-4 h-4 mr-2" /> Data Tagihan
          </TabsTrigger>
          {user?.role !== "student" && (
            <TabsTrigger
              value="report"
              className="data-[state=active]:bg-school-navy data-[state=active]:text-white px-6"
            >
              <FileText className="w-4 h-4 mr-2" /> Laporan Piutang (Aging)
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between pb-4">
              <CardTitle className="font-serif text-lg text-school-navy">
                Daftar Tagihan Siswa
              </CardTitle>
              <div className="w-[200px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 h-8">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="paid">Lunas</SelectItem>
                    <SelectItem value="unpaid">Belum Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-school-navy">
                  <TableRow className="hover:bg-school-navy">
                    <TableHead className="text-white font-bold">
                      Siswa
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Judul Tagihan
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Nominal
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Jatuh Tempo
                    </TableHead>
                    <TableHead className="text-white font-bold">
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
                      <TableCell colSpan={6} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center text-school-gold">
                          <Loader2 className="h-6 w-6 animate-spin mb-2" />
                          <p className="text-sm text-slate-500">
                            Memuat data tagihan...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (user?.role === "student"
                      ? billings.filter(
                          (b: any) =>
                            b.student?._id === (user as any).id ||
                            b.student?._id === (user as any)._id,
                        )
                      : billings
                    ).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center h-24 text-slate-500"
                      >
                        Tidak ada data tagihan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (user?.role === "student"
                      ? billings.filter(
                          (b: any) =>
                            b.student?._id === (user as any).id ||
                            b.student?._id === (user as any)._id,
                        )
                      : billings
                    ).map((bill: any) => (
                      <TableRow
                        key={bill._id}
                        className="hover:bg-slate-50 border-b border-slate-100"
                      >
                        <TableCell>
                          <div className="font-bold text-school-navy">
                            {bill.student?.profile?.fullName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {bill.student?.profile?.nisn}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">
                          {bill.title}
                        </TableCell>
                        <TableCell className="font-bold text-school-navy">
                          {formatRupiah(bill.amount)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date(bill.dueDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              bill.status === "paid" ? "default" : "destructive"
                            }
                            className={
                              bill.status === "paid"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-500 hover:bg-red-600"
                            }
                          >
                            {bill.status === "paid" ? "Lunas" : "Belum Bayar"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {bill.status === "unpaid" &&
                            user?.role !== "student" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-school-navy text-school-navy hover:bg-school-navy hover:text-white"
                                onClick={() => handlePay(bill._id, bill.status)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                Verifikasi Bayar
                              </Button>
                            )}
                          {bill.status === "paid" && (
                            <span className="text-xs text-green-600 font-medium flex items-center justify-end gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Dibayar:{" "}
                              {new Date(bill.paidDate).toLocaleDateString()}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="font-serif text-lg text-school-navy">
                Laporan Detail Tunggakan (Aging Report)
              </CardTitle>
              <CardDescription>
                Analisis kesehatan keuangan sekolah berdasarkan lama tunggakan
                siswa.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-school-navy">
                  <TableRow className="hover:bg-school-navy">
                    <TableHead className="text-white font-bold">
                      Nama Siswa
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Kelas
                    </TableHead>
                    <TableHead className="text-white font-bold text-right">
                      Total Tunggakan
                    </TableHead>
                    <TableHead className="text-white font-bold text-right bg-green-700/20">
                      Lancar (Current)
                    </TableHead>
                    <TableHead className="text-white font-bold text-right bg-yellow-600/20">
                      30-60 Hari
                    </TableHead>
                    <TableHead className="text-white font-bold text-right bg-red-700/20">
                      &gt; 60 Hari (Macet)
                    </TableHead>
                    <TableHead className="text-white font-bold text-right text-center">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agingReport.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center h-24 text-slate-500"
                      >
                        Tidak ada data piutang ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    agingReport.map((item: any) => (
                      <TableRow
                        key={item.student._id}
                        className="hover:bg-slate-50 border-b border-slate-100"
                      >
                        <TableCell className="font-bold text-school-navy">
                          {item.student?.profile?.fullName}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold border-blue-200 bg-blue-50 text-blue-700">
                            {item.student?.profile?.class || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-black text-school-navy text-lg">
                          {formatRupiah(item.totalDebt)}
                        </TableCell>
                        <TableCell className="text-right text-green-700 font-medium">
                          {formatRupiah(item.breakdown.current)}
                        </TableCell>
                        <TableCell className="text-right text-orange-600 font-medium">
                          {formatRupiah(item.breakdown.medium)}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-bold">
                          {item.breakdown.bad > 0 && (
                            <div className="flex items-center justify-end gap-1">
                              <AlertOctagon className="h-4 w-4" />
                              {formatRupiah(item.breakdown.bad)}
                            </div>
                          )}
                          {item.breakdown.bad === 0 && (
                            <span className="text-slate-300">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Printer className="h-4 w-4 text-slate-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;
