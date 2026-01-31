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
  SystemRestart,
  Box,
} from "iconoir-react";
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

  const [editingId, setEditingId] = useState<string | null>(null);

  // Stats
  const totalAssets = assets.length;
  const totalValue = assets.reduce(
    (acc, curr: any) => acc + (curr.purchasePrice || 0),
    0,
  );
  const goodCondition = assets.filter(
    (a: any) => a.condition === "Baik",
  ).length;
  const badCondition = totalAssets - goodCondition;

  const handleEdit = (asset: any) => {
    setFormData({
      code: asset.code,
      name: asset.name,
      category: asset.category,
      condition: asset.condition,
      location: asset.location,
      purchasePrice: asset.purchasePrice.toString(),
    });
    setEditingId(asset._id);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus aset ini?")) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
      toast({ title: "Berhasil", description: "Aset berhasil dihapus." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal hapus aset.",
      });
    }
  };

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
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
      const payload = new FormData();
      payload.append("code", formData.code);
      payload.append("name", formData.name);
      payload.append("category", formData.category);
      payload.append("condition", formData.condition);
      payload.append("location", formData.location);
      payload.append("purchasePrice", formData.purchasePrice);
      // payload.append("purchaseDate", new Date().toISOString()); // Backend handles or we send string

      if (selectedImage) {
        payload.append("image", selectedImage);
      }

      if (editingId) {
        await api.put(`/assets/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Berhasil", description: "Aset berhasil diperbarui." });
      } else {
        await api.post("/assets", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({
          title: "Berhasil",
          description: "Aset baru berhasil didaftarkan.",
        });
      }

      setOpenDialog(false);
      setFormData({
        code: "",
        name: "",
        category: "Elektronik",
        condition: "Baik",
        location: "Lab Komputer",
        purchasePrice: "",
      });
      setSelectedImage(null);
      setEditingId(null);
      fetchAssets();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: editingId ? "Gagal update aset." : "Gagal tambah aset.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openValidDialog = () => {
    setEditingId(null);
    setFormData({
      code: "",
      name: "",
      category: "Elektronik",
      condition: "Baik",
      location: "Lab Komputer",
      purchasePrice: "",
    });
    setSelectedImage(null);
    setOpenDialog(true);
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-school-navy text-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full">
              <Box className="w-8 h-8 text-school-gold" />
            </div>
            <div>
              <p className="text-sm text-white/70">Total Aset</p>
              <h3 className="text-2xl font-bold font-serif">
                {totalAssets} Unit
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-full">
              <SystemRestart className="w-8 h-8 text-green-600" />
              {/* Using SystemRestart as a placeholder for 'Value' icon if Wallet is not imported, or just reuse generic */}
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Nilai Aset</p>
              <h3 className="text-2xl font-bold font-serif text-school-navy">
                {formatRupiah(totalValue)}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-full">
              <SystemRestart className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Perlu Perbaikan</p>
              <h3 className="text-2xl font-bold font-serif text-school-navy">
                {badCondition} Unit
              </h3>
            </div>
          </CardContent>
        </Card>
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
            <Button
              onClick={openValidDialog}
              className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> Registrasi Aset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-school-navy">
                {editingId ? "Edit Data Aset" : "Registrasi Aset Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Perbarui informasi aset."
                  : "Masukkan detail aset untuk inventarisasi."}
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold text-school-navy">
                  Foto Aset
                </Label>
                <div className="col-span-3">
                  <Input
                    type="file"
                    className="bg-slate-50"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: JPG, PNG. Maks 5MB.
                  </p>
                </div>
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
            <Box className="w-5 h-5 text-school-gold" /> Daftar Aset Sekolah
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-school-navy">
              <TableRow className="hover:bg-school-navy">
                <TableHead className="text-white font-bold">
                  Kode Aset
                </TableHead>
                <TableHead className="text-white font-bold">Foto</TableHead>
                <TableHead className="text-white font-bold">
                  Nama Barang
                </TableHead>
                <TableHead className="text-white font-bold">Kategori</TableHead>
                <TableHead className="text-white font-bold">Lokasi</TableHead>
                <TableHead className="text-white font-bold">Kondisi</TableHead>
                <TableHead className="text-white font-bold">
                  Nilai Awal
                </TableHead>
                <TableHead className="text-white font-bold text-center">
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
                    <TableCell>
                      {asset.image ? (
                        <div className="w-12 h-12 rounded-md overflow-hidden border border-slate-200">
                          <img
                            src={`${import.meta.env.VITE_API_URL}${asset.image}`}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                          <Box className="w-6 h-6" />
                        </div>
                      )}
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
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleEdit(asset)}
                          title="Edit"
                        >
                          <Box className="w-4 h-4" />
                          {/* Using Box as generic edit icon placeholder if Edit is missing, or I can import Edit from iconoir */}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(asset._id)}
                          title="Hapus"
                        >
                          <SystemRestart className="w-4 h-4 rotate-45" />
                          {/* Using SystemRestart rotated as generic Close/Delete if X is missing. Better Check imports. */}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-school-navy hover:text-white"
                          onClick={() => handleShowQr(asset)}
                          title="Lihat QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
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
