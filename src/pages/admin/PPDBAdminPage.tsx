import { useState, useEffect } from "react";
import api from "@/services/api";
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  UserCheck,
  FileText,
  School,
} from "lucide-react";

interface Registrant {
  _id: string;
  fullname: string;
  nisn: string;
  registrationPath: string;
  status: string;
  averageGrade?: number;
  originSchool?: string;
  docKK?: string;
  createdAt: string;
  notes?: string;
}

const PPDBAdminPage = () => {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Action Dialog
  const [selectedDetail, setSelectedDetail] = useState<Registrant | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrants();
  }, [statusFilter]);

  const fetchRegistrants = async () => {
    setLoading(true);
    try {
      const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await api.get(`/ppdb/registrants${query}`);
      setRegistrants(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedDetail) return;
    setProcessing(true);
    try {
      await api.put(`/ppdb/registrants/${selectedDetail._id}`, {
        status,
        notes: actionNote,
      });
      toast({
        title: "Status Diperbarui",
        description: `Siswa ditandai sebagai ${status}`,
      });
      setOpenDialog(false);
      fetchRegistrants();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Update",
        description: "Terjadi kesalahan.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-3 h-3 mr-1" /> Diterima
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" /> Ditolak
          </Badge>
        );
      case "verified":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-3 h-3 mr-1" /> Terverifikasi
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-slate-200 text-slate-700">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Dashboard Admin PPDB
          </h2>
          <p className="text-slate-500">
            Verifikasi dan seleksi calon siswa baru (Penerimaan Peserta Didik
            Baru).
          </p>
        </div>
        <div className="w-full md:w-[250px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white border-slate-300">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Pendaftar</SelectItem>
              <SelectItem value="pending">Menunggu Verifikasi</SelectItem>
              <SelectItem value="verified">Sudah Diverifikasi</SelectItem>
              <SelectItem value="accepted">Diterima</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50 border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Pendaftar
              </p>
              <h3 className="text-2xl font-bold text-school-navy">
                {registrants.length}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Diterima</p>
              <h3 className="text-2xl font-bold text-school-navy">
                {registrants.filter((r) => r.status === "accepted").length}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Perlu Verifikasi
              </p>
              <h3 className="text-2xl font-bold text-school-navy">
                {registrants.filter((r) => r.status === "pending").length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
            <School className="w-5 h-5 text-school-gold" /> Daftar Calon Siswa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-school-navy">
              <TableRow className="hover:bg-school-navy">
                <TableHead className="text-white font-bold">
                  Nama Lengkap
                </TableHead>
                <TableHead className="text-white font-bold">NISN</TableHead>
                <TableHead className="text-white font-bold">
                  Asal Sekolah
                </TableHead>
                <TableHead className="text-white font-bold">Jalur</TableHead>
                <TableHead className="text-white font-bold">
                  Tanggal Daftar
                </TableHead>
                <TableHead className="text-white font-bold text-center">
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
                  <TableCell colSpan={7} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center text-school-gold">
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                      <p className="text-sm text-slate-500">
                        Memuat data pendaftar...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : registrants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center h-32 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <UserCheck className="h-8 w-8 text-slate-200 mb-2" />
                      <p>Tidak ada data pendaftar ditemukan.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                registrants.map((r) => (
                  <TableRow
                    key={r._id}
                    className="hover:bg-slate-50 border-b border-slate-100"
                  >
                    <TableCell className="font-bold text-school-navy">
                      {r.fullname}
                    </TableCell>
                    <TableCell className="font-medium text-slate-600">
                      {r.nisn}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {r.originSchool || "-"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium border-slate-200 bg-slate-100 text-slate-800">
                        {r.registrationPath}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(r.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-school-navy hover:text-school-gold hover:bg-slate-100 font-semibold"
                        onClick={() => {
                          setSelectedDetail(r);
                          setOpenDialog(true);
                          setActionNote(r.notes || "");
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="font-serif text-2xl text-school-navy">
              Verifikasi Data Calon Siswa
            </DialogTitle>
            <DialogDescription>
              Periksa kelengkapan data sebelum mengubah status pendaftaran.
            </DialogDescription>
          </DialogHeader>
          {selectedDetail && (
            <div className="space-y-6 py-4">
              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="font-bold text-school-navy mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Data Diri
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Nama Lengkap</span>
                      <span className="font-medium text-right">
                        {selectedDetail.fullname}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">NISN</span>
                      <span className="font-medium text-right">
                        {selectedDetail.nisn}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Asal Sekolah</span>
                      <span className="font-medium text-right">
                        {selectedDetail.originSchool}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="font-bold text-school-navy mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Kelengkapan Dokumen
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Kartu Keluarga</span>
                      {selectedDetail.docKK ? (
                        <a
                          href={`http://localhost:5000${selectedDetail.docKK}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors font-medium"
                        >
                          Lihat Dokumen
                        </a>
                      ) : (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                          Belum Upload
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Rata-rata Rapor</span>
                      <span className="font-bold text-school-navy">
                        {selectedDetail.averageGrade || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Status Saat Ini</span>
                      <span>{getStatusBadge(selectedDetail.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4 bg-yellow-50 border-yellow-100">
                <label className="mb-2 font-bold text-school-navy block text-sm">
                  Catatan Verifikator / Alasan Penolakan:
                </label>
                <Textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Contoh: Dokumen KK buram, mohon upload ulang. ATAU Selamat, Anda diterima."
                  className="bg-white border-yellow-200 focus:border-yellow-400"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
                {selectedDetail.status !== "rejected" && (
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleUpdateStatus("rejected")}
                    disabled={processing}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Tolak Pendaftaran
                  </Button>
                )}

                <div className="flex gap-2">
                  {selectedDetail.status !== "verified" &&
                    selectedDetail.status !== "accepted" && (
                      <Button
                        variant="outline"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                        onClick={() => handleUpdateStatus("verified")}
                        disabled={processing}
                      >
                        Verifikasi Dokumen
                      </Button>
                    )}

                  {selectedDetail.status !== "accepted" && (
                    <Button
                      className="bg-green-600 hover:bg-green-700 font-bold text-white shadow-md"
                      onClick={() => handleUpdateStatus("accepted")}
                      disabled={processing}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Terima Siswa
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PPDBAdminPage;
