import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
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
import { HeartPulse, NotebookPen, Plus, Loader2 } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const UksDashboard = () => {
  const [activeTab, setActiveTab] = useState("records");
  const [healthRecords, setHealthRecords] = useState([]);
  const [visits, setVisits] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dialogs
  const [openRecordDialog, setOpenRecordDialog] = useState(false);
  const [openVisitDialog, setOpenVisitDialog] = useState(false);

  // Forms
  const [recordForm, setRecordForm] = useState({
    studentId: "",
    height: "",
    weight: "",
    visionLeft: "Normal",
    visionRight: "Normal",
    dentalHealth: "Sehat",
    notes: "",
  });

  const [visitForm, setVisitForm] = useState({
    studentId: "",
    complaint: "",
    diagnosis: "",
    treatment: "Istirahat",
    medicineGiven: "",
    status: "Istirahat",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    fetchStudents();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRecords, resVisits] = await Promise.all([
        api.get("/uks/records"),
        api.get("/uks/visits"),
      ]);
      setHealthRecords(resRecords.data);
      setVisits(resVisits.data);
    } catch (error) {
      console.error("Gagal load data UKS", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data UKS.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/academic/students");
      setStudents(res.data);
    } catch (error) {
      console.error("Gagal load siswa", error);
    }
  };

  const handleAddRecord = async () => {
    if (!recordForm.studentId || !recordForm.height || !recordForm.weight) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Data Siswa, TB, dan BB wajib diisi.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/uks/records", {
        ...recordForm,
        height: parseFloat(recordForm.height),
        weight: parseFloat(recordForm.weight),
      });
      setOpenRecordDialog(false);
      setRecordForm({
        studentId: "",
        height: "",
        weight: "",
        visionLeft: "Normal",
        visionRight: "Normal",
        dentalHealth: "Sehat",
        notes: "",
      });
      fetchData();
      toast({
        title: "Berhasil",
        description: "Data kesehatan tersimpan.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal simpan data kesehatan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddVisit = async () => {
    if (!visitForm.studentId || !visitForm.complaint) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Siswa dan Keluhan wajib diisi.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/uks/visits", visitForm);
      setOpenVisitDialog(false);
      setVisitForm({
        studentId: "",
        complaint: "",
        diagnosis: "",
        treatment: "Istirahat",
        medicineGiven: "",
        status: "Istirahat",
      });
      fetchData();
      toast({
        title: "Berhasil",
        description: "Kunjungan berhasil dicatat.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal simpan kunjungan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Unit Kesehatan Sekolah (UKS)
        </h2>
        <p className="text-muted-foreground">
          Monitoring kesehatan siswa dan layanan pertolongan pertama.
        </p>
      </div>

      <Tabs
        defaultValue="records"
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="records">
            <HeartPulse className="mr-2 h-4 w-4" />
            Screening Kesehatan
          </TabsTrigger>
          <TabsTrigger value="visits">
            <NotebookPen className="mr-2 h-4 w-4" />
            Kunjungan Harian
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">
              Data Screening (Stunting Check)
            </h3>
            <Dialog open={openRecordDialog} onOpenChange={setOpenRecordDialog}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" /> Input Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Input Screening Kesehatan</DialogTitle>
                  <DialogDescription>
                    Pencatatan antropometri dan kesehatan dasar.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Siswa</Label>
                    <Select
                      onValueChange={(v) =>
                        setRecordForm({ ...recordForm, studentId: v })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih Siswa" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s: any) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.profile?.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Tinggi (cm)</Label>
                    <Input
                      type="number"
                      className="col-span-3"
                      value={recordForm.height}
                      onChange={(e) =>
                        setRecordForm({ ...recordForm, height: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Berat (kg)</Label>
                    <Input
                      type="number"
                      className="col-span-3"
                      value={recordForm.weight}
                      onChange={(e) =>
                        setRecordForm({ ...recordForm, weight: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Penglihatan</Label>
                    <div className="col-span-3 flex gap-2">
                      <Select
                        value={recordForm.visionLeft}
                        onValueChange={(v) =>
                          setRecordForm({ ...recordForm, visionLeft: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kiri" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Minus">Minus</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={recordForm.visionRight}
                        onValueChange={(v) =>
                          setRecordForm({ ...recordForm, visionRight: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kanan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Minus">Minus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Gigi</Label>
                    <Select
                      value={recordForm.dentalHealth}
                      onValueChange={(v) =>
                        setRecordForm({ ...recordForm, dentalHealth: v })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Kondisi Gigi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sehat">Sehat</SelectItem>
                        <SelectItem value="Karies">
                          Karies (Berlubang)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleAddRecord}
                    disabled={submitting}
                  >
                    {submitting ? "Menyimpan..." : "Simpan Data"}
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
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>TB / BB</TableHead>
                    <TableHead>BMI</TableHead>
                    <TableHead>Mata (L/R)</TableHead>
                    <TableHead>Gigi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {healthRecords.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        Belum ada data screening.
                      </TableCell>
                    </TableRow>
                  )}
                  {healthRecords.map((rec: any) => (
                    <TableRow key={rec._id}>
                      <TableCell>
                        {new Date(rec.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {rec.student?.profile?.fullName}
                      </TableCell>
                      <TableCell>
                        {rec.height}cm / {rec.weight}kg
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rec.bmi < 18.5 || rec.bmi > 25
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {rec.bmi}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rec.visionLeft} / {rec.visionRight}
                      </TableCell>
                      <TableCell>{rec.dentalHealth}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Buku Kunjungan Harian</h3>
            <Dialog open={openVisitDialog} onOpenChange={setOpenVisitDialog}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Plus className="mr-2 h-4 w-4" /> Catat Kunjungan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Catat Kunjungan UKS</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Siswa</Label>
                    <Select
                      onValueChange={(v) =>
                        setVisitForm({ ...visitForm, studentId: v })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih Siswa" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s: any) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.profile?.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Keluhan</Label>
                    <Input
                      className="col-span-3"
                      placeholder="Pusing, Mual, Luka..."
                      value={visitForm.complaint}
                      onChange={(e) =>
                        setVisitForm({
                          ...visitForm,
                          complaint: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Tindakan</Label>
                    <Input
                      className="col-span-3"
                      placeholder="Istirahat, P3K..."
                      value={visitForm.treatment}
                      onChange={(e) =>
                        setVisitForm({
                          ...visitForm,
                          treatment: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Obat</Label>
                    <Input
                      className="col-span-3"
                      placeholder="Paracetamol, Betadine..."
                      value={visitForm.medicineGiven}
                      onChange={(e) =>
                        setVisitForm({
                          ...visitForm,
                          medicineGiven: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Status</Label>
                    <Select
                      value={visitForm.status}
                      onValueChange={(v) =>
                        setVisitForm({ ...visitForm, status: v })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Status Akhir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Istirahat">
                          Istirahat di UKS
                        </SelectItem>
                        <SelectItem value="Pulang">Dipulangkan</SelectItem>
                        <SelectItem value="Rujuk">
                          Rujuk RS/Puskesmas
                        </SelectItem>
                        <SelectItem value="Sembuh">Kembali ke Kelas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddVisit} disabled={submitting}>
                    {submitting ? "Menyimpan..." : "Simpan"}
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
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Keluhan</TableHead>
                    <TableHead>Tindakan/Obat</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        Belum ada kunjungan hari ini.
                      </TableCell>
                    </TableRow>
                  )}
                  {visits.map((v: any) => (
                    <TableRow key={v._id}>
                      <TableCell>
                        {new Date(v.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {v.student?.profile?.fullName}
                      </TableCell>
                      <TableCell>{v.complaint}</TableCell>
                      <TableCell>
                        {v.treatment}{" "}
                        {v.medicineGiven && `(${v.medicineGiven})`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{v.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UksDashboard;
