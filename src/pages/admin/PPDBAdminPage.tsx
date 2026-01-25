import { useState, useEffect } from "react";
import api from "@/services/api";
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Eye, CheckCircle, XCircle } from "lucide-react";

interface Registrant {
  _id: string;
  fullname: string;
  nisn: string;
  registrationPath: string;
  status: string;
  averageGrade?: number;
  docKK?: string;
  createdAt: string;
}

const PPDBAdminPage = () => {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Action Dialog
  const [selectedDetail, setSelectedDetail] = useState<any>(null); // Full detail
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Data Pendaftar PPDB
        </h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="accepted">Diterima</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>List Calon Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NISN</TableHead>
                <TableHead>Jalur</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrants.map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="font-medium">{r.fullname}</TableCell>
                  <TableCell>{r.nisn}</TableCell>
                  <TableCell>{r.registrationPath}</TableCell>
                  <TableCell>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.status === "accepted"
                          ? "default"
                          : r.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {r.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDetail(r);
                        setOpenDialog(true);
                        setActionNote("");
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" /> Detail / Verifikasi
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Pendaftar</DialogTitle>
          </DialogHeader>
          {selectedDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nama:</p>
                  <p className="font-semibold">{selectedDetail.fullname}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">NISN:</p>
                  <p className="font-semibold">{selectedDetail.nisn}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Asal Sekolah:</p>
                  <p className="font-semibold">{selectedDetail.originSchool}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dokumen KK:</p>
                  {selectedDetail.docKK ? (
                    <a
                      href={selectedDetail.docKK}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Lihat Link
                    </a>
                  ) : (
                    "Tidak ada"
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="mb-2 font-medium">Catatan / Alasan:</p>
                <Textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Contoh: Dokumen lengkap / Nilai kurang..."
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                  onClick={() => handleUpdateStatus("rejected")}
                  disabled={processing}
                >
                  Tolak
                </Button>
                <Button
                  variant="outline"
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                  onClick={() => handleUpdateStatus("verified")}
                  disabled={processing}
                >
                  Verifikasi Data
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleUpdateStatus("accepted")}
                  disabled={processing}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Terima Siswa
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PPDBAdminPage;
