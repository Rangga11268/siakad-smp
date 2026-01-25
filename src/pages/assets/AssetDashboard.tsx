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
  Plus,
  Search,
  MapPin,
  Printer,
  QrCode,
  Loader2,
  Package,
} from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const AssetDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "Elektronik",
    condition: "Baik",
    location: "Lab Komputer",
    purchasePrice: "",
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/assets");
      setAssets(res.data);
    } catch (error) {
      console.error("Gagal load aset", error);
    } finally {
      setLoading(false);
    }
  };

  // Format Currency
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const { toast } = useToast();

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    setFormData({ ...formData, purchasePrice: rawValue });
  };

  const handleCreate = async () => {
    if (!formData.code || !formData.name || !formData.purchasePrice) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Kode, Nama Barang, dan Harga wajib diisi.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/assets", {
        ...formData,
        purchasePrice: parseInt(formData.purchasePrice),
        purchaseDate: new Date(),
      });
      setOpenDialog(false);
      setFormData({
        code: "",
        name: "",
        category: "Elektronik",
        condition: "Baik",
        location: "Lab Komputer",
        purchasePrice: "",
      });
      fetchAssets();
      toast({
        title: "Berhasil",
        description: "Aset baru berhasil didaftarkan.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal tambah aset.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // QR Code State
  const [qrCodeData, setQrCodeData] = useState<{
    code: string;
    name: string;
  } | null>(null);
  const [openQrDialog, setOpenQrDialog] = useState(false);

  const handleShowQr = (asset: any) => {
    setQrCodeData({ code: asset.code, name: asset.name });
    setOpenQrDialog(true);
  };

  const handlePrintQr = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && qrCodeData) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${qrCodeData.name}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
              img { width: 300px; height: 300px; }
              .label { margin-top: 20px; font-size: 24px; font-weight: bold; }
              .code { font-size: 18px; color: #555; }
            </style>
          </head>
          <body>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrCodeData.code}" />
            <div class="label">${qrCodeData.name}</div>
            <div class="code">${qrCodeData.code}</div>
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const filteredAssets = assets.filter(
    (asset: any) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Sarana & Prasarana (Aset)
          </h2>
          <p className="text-slate-500">
            Inventarisasi aset sekolah, monitoring kondisi, dan pelabelan QR
            Code.
          </p>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari Nama Aset, Kode, atau Lokasi..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all">
              <Plus className="mr-2 h-4 w-4" /> Registrasi Aset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-school-navy">
                Registrasi Aset Baru
              </DialogTitle>
              <DialogDescription>
                Masukkan detail aset untuk inventarisasi.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold text-school-navy">
                  Kode
                </Label>
                <Input
                  className="col-span-3 bg-slate-50"
                  placeholder="INV-2024-001"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold text-school-navy">
                  Nama Barang
                </Label>
                <Input
                  className="col-span-3 bg-slate-50"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold text-school-navy">
                  Kategori
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v })
                  }
                >
                  <SelectTrigger className="col-span-3 bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Elektronik">Elektronik</SelectItem>
                    <SelectItem value="Meubeler">Meubeler</SelectItem>
                    <SelectItem value="Kendaraan">Kendaraan</SelectItem>
                    <SelectItem value="Alat Tulis">Alat Tulis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold text-school-navy">
                  Kondisi
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(v) =>
                    setFormData({ ...formData, condition: v })
                  }
                >
                  <SelectTrigger className="col-span-3 bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baik">Baik</SelectItem>
                    <SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem>
                    <SelectItem value="Rusak Berat">Rusak Berat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold text-school-navy">
                  Lokasi
                </Label>
                <Input
                  className="col-span-3 bg-slate-50"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold text-school-navy">
                  Harga Beli
                </Label>
                <div className="col-span-3 relative">
                  <span className="absolute left-3 top-2.5 text-school-navy font-bold text-sm">
                    Rp
                  </span>
                  <Input
                    className="pl-9 bg-slate-50 font-bold text-school-navy"
                    value={formData.purchasePrice}
                    onChange={handlePriceChange}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.purchasePrice
                      ? formatRupiah(parseInt(formData.purchasePrice))
                      : "Rp 0"}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={submitting}
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full font-bold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Aset"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR Dialog */}
        <Dialog open={openQrDialog} onOpenChange={setOpenQrDialog}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-center text-school-navy">
                QR Code Aset
              </DialogTitle>
              <DialogDescription className="text-center">
                Scan QR ini untuk melihat detail aset.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-slate-50 m-2">
              {qrCodeData && (
                <>
                  <div className="bg-white p-2 border shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeData.code}`}
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-lg font-bold text-school-navy">
                      {qrCodeData.name}
                    </p>
                    <p className="text-sm text-slate-500 font-mono tracking-wider font-bold">
                      {qrCodeData.code}
                    </p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="sm:justify-center">
              <Button
                onClick={handlePrintQr}
                className="w-full bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold"
              >
                <Printer className="mr-2 h-4 w-4" /> Cetak Label QR
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <CardTitle className="font-serif text-lg text-school-navy flex items-center gap-2">
            <Package className="w-5 h-5 text-school-gold" /> Daftar Aset Sekolah
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-school-navy">
              <TableRow className="hover:bg-school-navy">
                <TableHead className="text-white font-bold">
                  Kode Aset
                </TableHead>
                <TableHead className="text-white font-bold">
                  Nama Barang
                </TableHead>
                <TableHead className="text-white font-bold">Kategori</TableHead>
                <TableHead className="text-white font-bold">Lokasi</TableHead>
                <TableHead className="text-white font-bold">Kondisi</TableHead>
                <TableHead className="text-white font-bold">
                  Nilai Awal
                </TableHead>
                <TableHead className="text-white font-bold text-right">
                  Label
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    <div className="flex flex-col items-center justify-center text-school-gold">
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                      <p className="text-sm text-slate-500">
                        Memuat data aset...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center h-24 text-slate-500"
                  >
                    Data aset tidak ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset: any) => (
                  <TableRow
                    key={asset._id}
                    className="hover:bg-slate-50 border-b border-slate-100"
                  >
                    <TableCell className="font-mono font-bold text-school-navy text-xs">
                      {asset.code}
                    </TableCell>
                    <TableCell className="font-bold text-slate-700">
                      {asset.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-slate-300 text-slate-600"
                      >
                        {asset.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="mr-1 h-3 w-3 text-school-gold" />
                        {asset.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          asset.condition === "Baik" ? "default" : "destructive"
                        }
                        className={
                          asset.condition === "Baik"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-500 hover:bg-red-600"
                        }
                      >
                        {asset.condition}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {formatRupiah(asset.purchasePrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-school-navy hover:text-white"
                        onClick={() => handleShowQr(asset)}
                        title="Lihat QR Code"
                      >
                        <QrCode className="w-4 h-4" />
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

export default AssetDashboard;
