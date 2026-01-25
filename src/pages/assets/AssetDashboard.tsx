import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Box, Plus, Search, MapPin } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const AssetDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Sarana & Prasarana (Aset)
          </h2>
          <p className="text-muted-foreground">
            Inventaris barang dan monitoring kondisi aset sekolah.
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" /> Tambah Aset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrasi Aset Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Kode</Label>
                <Input
                  className="col-span-3"
                  placeholder="INV-2024-001"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nama Barang</Label>
                <Input
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v })
                  }
                >
                  <SelectTrigger className="col-span-3">
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
                <Label className="text-right">Kondisi</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(v) =>
                    setFormData({ ...formData, condition: v })
                  }
                >
                  <SelectTrigger className="col-span-3">
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
                <Label className="text-right">Lokasi</Label>
                <Input
                  className="col-span-3"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Harga Beli</Label>
                <div className="col-span-3 relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                    Rp
                  </span>
                  <Input
                    className="pl-9"
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
              <Button onClick={handleCreate} disabled={submitting}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR Dialog */}
        <Dialog open={openQrDialog} onOpenChange={setOpenQrDialog}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>QR Code Aset</DialogTitle>
              <DialogDescription>
                Scan QR ini untuk melihat detail aset.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-4">
              {qrCodeData && (
                <>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeData.code}`}
                    alt="QR Code"
                    className="border rounded-lg shadow-sm"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-lg font-bold">{qrCodeData.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {qrCodeData.code}
                    </p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="sm:justify-center">
              <Button onClick={handlePrintQr} className="w-full">
                <Box className="mr-2 h-4 w-4" /> Cetak Label QR
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Aset</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead>Nilai Awal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    Belum ada data aset.
                  </TableCell>
                </TableRow>
              )}
              {assets.map((asset: any) => (
                <TableRow key={asset._id}>
                  <TableCell className="font-mono text-xs">
                    {asset.code}
                  </TableCell>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                      {asset.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        asset.condition === "Baik" ? "default" : "destructive"
                      }
                      className={
                        asset.condition === "Baik" ? "bg-green-600" : ""
                      }
                    >
                      {asset.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatRupiah(asset.purchasePrice)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowQr(asset)}
                    >
                      <Box className="w-4 h-4 mr-1" /> QR
                    </Button>
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

export default AssetDashboard;
