import { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CreditCard,
  CheckCircle,
  Clock,
  WarningTriangle,
  Upload,
} from "iconoir-react";

// Midtrans Snap Type
declare global {
  interface Window {
    snap: any;
  }
}

interface Bill {
  _id: string;
  title: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "waiting_verification";
  paymentType: "manual" | "online" | "none";
  dueDate?: string;
  evidence?: string;
  midtransOrderId?: string;
  createdAt: string;
}

const StudentBillPage = () => {
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment State
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "online" | "manual" | null
  >(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBills();
    // Load Midtrans Script
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", "Mid-client-aAUNIuf1fCSll2qz");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchBills = async () => {
    try {
      const res = await api.get("/finance");
      setBills(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (billId: string) => {
    try {
      const res = await api.get(`/finance/midtrans/status/${billId}`);
      toast({
        title: "Status Diperbarui",
        description: `Status: ${res.data.status.toUpperCase()}`,
      });
      fetchBills();
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal cek status" });
    }
  };

  const handleOnlinePayment = async () => {
    if (!selectedBill) return;
    setProcessing(true);
    try {
      const res = await api.post("/finance/midtrans/token", {
        billId: selectedBill._id,
      });
      const token = res.data.token;

      window.snap.pay(token, {
        onSuccess: async function (_result: any) {
          toast({
            title: "Pembayaran Berhasil!",
            description: "Memverifikasi...",
          });
          await handleCheckStatus(selectedBill._id);
          handleClose();
        },
        onPending: function (_result: any) {
          toast({
            title: "Menunggu Pembayaran",
            description: "Silakan selesaikan pembayaran.",
          });
          handleClose();
          fetchBills();
        },
        onError: function (_result: any) {
          toast({ variant: "destructive", title: "Pembayaran Gagal" });
          handleClose();
        },
        onClose: function () {
          // Customer closed the popup without finishing the payment
          handleClose();
        },
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal memproses pembayaran" });
    } finally {
      setProcessing(false);
    }
  };

  const handleManualPayment = async () => {
    if (!selectedBill || !evidenceFile) return;
    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append("file", evidenceFile);
      const up = await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await api.post("/finance/manual", {
        billId: selectedBill._id,
        evidenceUrl: up.data.url,
      });

      toast({
        title: "Bukti Terkirim",
        description: "Admin akan memverifikasi.",
      });
      handleClose();
      fetchBills();
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal kirim bukti" });
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedBill(null);
    setPaymentMethod(null);
    setEvidenceFile(null);
  };

  const pendingBills = bills.filter((b) => b.status !== "paid");
  const paidBills = bills.filter((b) => b.status === "paid");

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Hero Balance? For simplicity just header */}
      <div className="bg-school-navy text-white p-8 rounded-xl relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-serif font-bold mb-2">
            Tagihan & Keuangan
          </h1>
          <p className="text-blue-100">
            Kelola pembayaran SPP dan tagihan sekolah lainnya.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      </div>

      <Tabs defaultValue="unpaid" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-lg border shadow-sm">
          <TabsTrigger
            value="unpaid"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white"
          >
            Belum Lunas{" "}
            <Badge className="ml-2 bg-red-500">{pendingBills.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white"
          >
            Riwayat Pembayaran
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unpaid" className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-slate-500 animate-pulse">
              Memuat tagihan...
            </div>
          ) : pendingBills.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-lg border border-dashed text-slate-500">
              Tidak ada tagihan outstanding.
            </div>
          ) : (
            pendingBills.map((bill) => (
              <Card
                key={bill._id}
                className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between p-6 items-center">
                  <div>
                    <h3 className="font-bold text-xl text-school-navy">
                      {bill.title}
                    </h3>
                    <div className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Jatuh Tempo:{" "}
                      {bill.dueDate
                        ? new Date(bill.dueDate).toLocaleDateString()
                        : "-"}
                    </div>
                    {bill.status === "waiting_verification" && (
                      <Badge className="mt-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        <Clock className="mr-1 w-3 h-3" /> Menunggu Verifikasi
                      </Badge>
                    )}
                    {bill.status === "failed" && (
                      <Badge className="mt-2 bg-red-100 text-red-800 hover:bg-red-200">
                        <WarningTriangle className="mr-1 w-3 h-3" /> Pembayaran
                        Gagal
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0 text-right flex flex-col gap-2 items-end">
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      {formatRupiah(bill.amount)}
                    </div>
                    {bill.status !== "waiting_verification" && (
                      <div className="flex gap-2">
                        {bill.midtransOrderId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCheckStatus(bill._id)}
                          >
                            Cek Status Online
                          </Button>
                        )}
                        <Button
                          className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-lg"
                          onClick={() => setSelectedBill(bill)}
                        >
                          Bayar Sekarang
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {paidBills.map((bill) => (
            <Card
              key={bill._id}
              className="border-l-4 border-l-green-500 bg-slate-50/50"
            >
              <div className="flex justify-between p-6 items-center">
                <div>
                  <h3 className="font-bold text-lg text-school-navy line-through text-slate-400">
                    {bill.title}
                  </h3>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 mt-2">
                    <CheckCircle className="mr-1 w-3 h-3" /> Lunas
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {formatRupiah(bill.amount)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Paid via{" "}
                    {bill.paymentType === "online" ? "Midtrans" : "Manual"}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
            <DialogDescription>
              Tagihan: <span className="font-bold">{selectedBill?.title}</span>{" "}
              <br />
              Total:{" "}
              <span className="font-bold text-school-navy">
                {selectedBill && formatRupiah(selectedBill.amount)}
              </span>
            </DialogDescription>
          </DialogHeader>

          {!paymentMethod ? (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div
                onClick={() => setPaymentMethod("online")}
                className="border-2 rounded-xl p-4 cursor-pointer hover:border-school-navy hover:bg-slate-50 transition-all text-center group"
              >
                <CreditCard className="w-10 h-10 mx-auto text-slate-400 group-hover:text-school-navy mb-2" />
                <h4 className="font-bold text-school-navy">Online Payment</h4>
                <p className="text-xs text-slate-500 mt-1">
                  QRIS, Virtual Account, Kartu Kredit (Otomatis Lunas)
                </p>
              </div>
              <div
                onClick={() => setPaymentMethod("manual")}
                className="border-2 rounded-xl p-4 cursor-pointer hover:border-school-navy hover:bg-slate-50 transition-all text-center group"
              >
                <Upload className="w-10 h-10 mx-auto text-slate-400 group-hover:text-school-navy mb-2" />
                <h4 className="font-bold text-school-navy">Transfer Manual</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Upload bukti transfer bank (Verifikasi Admin)
                </p>
              </div>
            </div>
          ) : paymentMethod === "online" ? (
            <div className="space-y-4 py-4 text-center">
              <p className="text-sm text-slate-600">
                Anda akan diarahkan ke sistem pembayaran aman Midtrans.
              </p>
              <Button
                onClick={handleOnlinePayment}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {processing ? "Memproses..." : "Lanjut ke Pembayaran"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setPaymentMethod(null)}
              >
                Kembali
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="bg-yellow-50 p-3 rounded text-sm mb-2 border border-yellow-100">
                <p className="font-bold">Rekening Sekolah:</p>
                <p>BCA: 123-456-7890 (Yayasan Pendidikan)</p>
                <p>Mandiri: 987-654-3210</p>
              </div>
              <div>
                <label className="text-sm font-bold">
                  Upload Bukti Transfer
                </label>
                <Input
                  type="file"
                  onChange={(e) =>
                    setEvidenceFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>
              <Button
                onClick={handleManualPayment}
                disabled={processing}
                className="w-full bg-school-navy text-white"
              >
                {processing ? "Mengupload..." : "Kirim Bukti Pembayaran"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setPaymentMethod(null)}
              >
                Kembali
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentBillPage;
