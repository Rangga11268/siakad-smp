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
  HeartPulse,
  NotebookPen,
  Plus,
  Activity,
  UserPlus,
  FileText,
  Loader2,
} from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const UksDashboard = () => {
  const { user } = useAuth();
  // const [activeTab, setActiveTab] = useState("records");
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
  const canEdit = ["admin", "teacher"].includes(user?.role || "");

  useEffect(() => {
    fetchData();
    if (canEdit) {
      fetchStudents();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRecords, resVisits] = await Promise.all([
        api.get("/uks/records", {
          params: user?.role === "student" ? { studentId: user.id } : {},
        }),
        api.get("/uks/visits"),
      ]);
      setHealthRecords(resRecords.data);
      setVisits(resVisits.data);
    } catch (error) {
      console.error("Gagal load data UKS", error);
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Unit Kesehatan Sekolah (UKS)
          </h2>
          <p className="text-slate-500">
            Monitoring kesehatan siswa, screening rutin, dan rekam medis harian.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-emerald-50 border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">
                Screening Sehat
              </h3>
              <p className="text-2xl font-bold text-school-navy">
                {
                  healthRecords.filter((r: any) => r.dentalHealth === "Sehat")
                    .length
                }{" "}
                Siswa
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <NotebookPen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">
                Total Kunjungan
              </h3>
              <p className="text-2xl font-bold text-school-navy">
                {visits.length} Kali
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">
                Perlu Tindakan
              </h3>
              <p className="text-2xl font-bold text-school-navy">
                {
                  healthRecords.filter(
                    (r: any) =>
                      r.dentalHealth !== "Sehat" || r.bmi > 25 || r.bmi < 18.5,
                  ).length
                }{" "}
                Siswa
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger
            value="records"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white px-6"
          >
            <HeartPulse className="mr-2 h-4 w-4" />
            Screening & Data Fisik
          </TabsTrigger>
          <TabsTrigger
            value="visits"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white px-6"
          >
            <FileText className="mr-2 h-4 w-4" />
            Buku Kunjungan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-serif text-lg text-school-navy">
                  Rekapitulasi Screening Kesehatan
                </CardTitle>
                <CardDescription>
                  Data Tinggi Badan, Berat Badan, BMI, dan Kesehatan Dasar.
                </CardDescription>
              </div>
              {canEdit && (
                <Dialog
                  open={openRecordDialog}
                  onOpenChange={setOpenRecordDialog}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold">
                      <UserPlus className="mr-2 h-4 w-4" /> Input Data Fisik
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-xl text-school-navy">
                        Input Screening Kesehatan
                      </DialogTitle>
                      <DialogDescription>
                        Pencatatan antropometri dan kesehatan dasar.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-semibold text-school-navy">
                          Siswa
                        </Label>
                        <Select
                          onValueChange={(v) =>
                            setRecordForm({ ...recordForm, studentId: v })
                          }
                        >
                          <SelectTrigger className="col-span-3 bg-slate-50">
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
                        <Label className="text-right font-semibold text-school-navy">
                          Tinggi (cm)
                        </Label>
                        <Input
                          type="number"
                          className="col-span-3 bg-slate-50"
                          value={recordForm.height}
                          onChange={(e) =>
                            setRecordForm({
                              ...recordForm,
                              height: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-semibold text-school-navy">
                          Berat (kg)
                        </Label>
                        <Input
                          type="number"
                          className="col-span-3 bg-slate-50"
                          value={recordForm.weight}
                          onChange={(e) =>
                            setRecordForm({
                              ...recordForm,
                              weight: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-semibold text-school-navy">
                          Penglihatan
                        </Label>
                        <div className="col-span-3 flex gap-2">
                          <Select
                            value={recordForm.visionLeft}
                            onValueChange={(v) =>
                              setRecordForm({ ...recordForm, visionLeft: v })
                            }
                          >
                            <SelectTrigger className="bg-slate-50 w-full">
                              <SelectValue placeholder="Mata Kiri" />
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
                            <SelectTrigger className="bg-slate-50 w-full">
                              <SelectValue placeholder="Mata Kanan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Normal">Normal</SelectItem>
                              <SelectItem value="Minus">Minus</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-semibold text-school-navy">
                          Gigi
                        </Label>
                        <Select
                          value={recordForm.dentalHealth}
                          onValueChange={(v) =>
                            setRecordForm({ ...recordForm, dentalHealth: v })
                          }
                        >
                          <SelectTrigger className="col-span-3 bg-slate-50">
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
                        className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full font-bold"
                        onClick={handleAddRecord}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" />{" "}
                            Menyimpan...
                          </>
                        ) : (
                          "Simpan Data Fisik"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-school-navy">
                  <TableRow className="hover:bg-school-navy">
                    <TableHead className="text-white font-bold">
                      Tanggal Periksa
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Nama Siswa
                    </TableHead>
                    <TableHead className="text-white font-bold text-center">
                      Tinggi/Berat
                    </TableHead>
                    <TableHead className="text-white font-bold text-center">
                      BMI Status
                    </TableHead>
                    <TableHead className="text-white font-bold text-center">
                      Mata (L/R)
                    </TableHead>
                    <TableHead className="text-white font-bold text-center">
                      Gigi
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
                            Memuat data screening...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : healthRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center h-24 text-slate-500"
                      >
                        Belum ada data rekaman kesehatan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    healthRecords.map((rec: any) => (
                      <TableRow
                        key={rec._id}
                        className="hover:bg-slate-50 border-b border-slate-100"
                      >
                        <TableCell className="text-slate-600">
                          {new Date(rec.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-bold text-school-navy">
                          {rec.student?.profile?.fullName}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {rec.height}cm / {rec.weight}kg
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              rec.bmi < 18.5 || rec.bmi > 25
                                ? "destructive"
                                : "default"
                            }
                            className={
                              rec.bmi >= 18.5 && rec.bmi <= 25
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }
                          >
                            {rec.bmi < 18.5
                              ? "Underweight"
                              : rec.bmi > 25
                                ? "Overweight"
                                : "Normal"}{" "}
                            ({rec.bmi})
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${rec.visionLeft !== "Normal" || rec.visionRight !== "Normal" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                          >
                            {rec.visionLeft} / {rec.visionRight}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${rec.dentalHealth !== "Sehat" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                          >
                            {rec.dentalHealth}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-serif text-lg text-school-navy">
                  Jurnal Kunjungan Pasien
                </CardTitle>
                <CardDescription>
                  Catatan harian siswa yang sakit atau membutuhkan pertolongan
                  pertama.
                </CardDescription>
              </div>
              {canEdit && (
                <Dialog
                  open={openVisitDialog}
                  onOpenChange={setOpenVisitDialog}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md">
                      <Plus className="mr-2 h-4 w-4" /> Catat Pasien Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-xl text-school-navy">
                        Form Kunjungan Pasien
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-semibold text-school-navy">
                          Pasien (Siswa)
                        </Label>
                        <Select
                          onValueChange={(v) =>
                            setVisitForm({ ...visitForm, studentId: v })
                          }
                        >
                          <SelectTrigger className="col-span-3 bg-slate-50">
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
                        <Label className="text-right font-semibold text-school-navy">
                          Keluhan Utama
                        </Label>
                        <Input
                          className="col-span-3 bg-slate-50"
                          placeholder="Pusing, Mual, Luka, Demam..."
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
                        <Label className="text-right font-semibold text-school-navy">
                          Tindakan
                        </Label>
                        <Input
                          className="col-span-3 bg-slate-50"
                          placeholder="Istirahat 1 Jam, Kompres..."
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
                        <Label className="text-right font-semibold text-school-navy">
                          Obat Diberikan
                        </Label>
                        <Input
                          className="col-span-3 bg-slate-50"
                          placeholder="Paracetamol 500mg, Betadine..."
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
                        <Label className="text-right font-semibold text-school-navy">
                          Status Akhir
                        </Label>
                        <Select
                          value={visitForm.status}
                          onValueChange={(v) =>
                            setVisitForm({ ...visitForm, status: v })
                          }
                        >
                          <SelectTrigger className="col-span-3 bg-slate-50">
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
                            <SelectItem value="Sembuh">
                              Kembali ke Kelas
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddVisit}
                        disabled={submitting}
                        className="w-full bg-red-600 hover:bg-red-700 font-bold"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" />{" "}
                            Menyimpan...
                          </>
                        ) : (
                          "Simpan Kunjungan"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-school-navy">
                  <TableRow className="hover:bg-school-navy">
                    <TableHead className="text-white font-bold">
                      Waktu Masuk
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Nama Pasien
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Keluhan
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Tindakan & Obat
                    </TableHead>
                    <TableHead className="text-white font-bold text-center">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center text-school-gold">
                          <Loader2 className="h-6 w-6 animate-spin mb-2" />
                          <p className="text-sm text-slate-500">
                            Memuat data kunjungan...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : visits.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-slate-500"
                      >
                        Belum ada kunjungan hari ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visits.map((v: any) => (
                      <TableRow
                        key={v._id}
                        className="hover:bg-slate-50 border-b border-slate-100"
                      >
                        <TableCell className="text-slate-600">
                          <div className="flex flex-col">
                            <span>{new Date(v.date).toLocaleDateString()}</span>
                            <span className="text-xs text-slate-400">
                              {new Date(v.date).toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-school-navy">
                          {v.student?.profile?.fullName}
                        </TableCell>
                        <TableCell className="font-medium text-red-600">
                          {v.complaint}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{v.treatment}</span>
                          {v.medicineGiven && (
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded ml-2 text-slate-600 border border-slate-200">
                              {v.medicineGiven}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`${v.status === "Sembuh" ? "border-green-500 text-green-700 bg-green-50" : "border-red-200 text-red-600 bg-red-50"}`}
                          >
                            {v.status}
                          </Badge>
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

export default UksDashboard;
