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
import {
  WarningTriangle,
  Trophy,
  Search,
  Plus,
  SystemRestart,
  Heart,
  Megaphone,
  Printer,
} from "iconoir-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

import { useNavigate } from "react-router-dom";

const StudentAffairsDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("incidents");
  const [incidents, setIncidents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [counseling, setCounseling] = useState([]);
  const [violationStats, setViolationStats] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [openIncidentDialog, setOpenIncidentDialog] = useState(false);
  const [openAchievementDialog, setOpenAchievementDialog] = useState(false);
  const [openCounselingDialog, setOpenCounselingDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [incidentForm, setIncidentForm] = useState({
    studentId: "",
    type: "Keterlambatan",
    point: "5",
    description: "",
    sanction: "",
  });

  const [achievementForm, setAchievementForm] = useState({
    studentId: "",
    title: "",
    category: "Non-Akademik",
    level: "Sekolah",
    description: "",
  });

  const [counselingForm, setCounselingForm] = useState({
    studentId: "",
    type: "Pribadi",
    title: "",
    notes: "",
    followUp: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    fetchStudents();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resIncidents, resAchievements, resCounseling, resStats] =
        await Promise.all([
          api.get("/bk/incidents"),
          api.get("/bk/achievements"),
          api.get("/bk/counseling"),
          api.get("/bk/stats/violations"),
        ]);
      setIncidents(resIncidents.data);
      setAchievements(resAchievements.data);
      setCounseling(resCounseling.data);
      setViolationStats(resStats.data);
    } catch (error) {
      console.error("Gagal load data BK", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data BK.",
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

  // --- Handlers ---

  const handleReportIncident = async () => {
    if (!incidentForm.studentId || !incidentForm.description) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Siswa dan Keterangan wajib diisi.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/bk/incidents", {
        ...incidentForm,
        point: parseInt(incidentForm.point),
      });
      setOpenIncidentDialog(false);
      setIncidentForm({
        studentId: "",
        type: "Keterlambatan",
        point: "5",
        description: "",
        sanction: "",
      });
      fetchData();
      toast({
        title: "Berhasil",
        description: "Laporan pelanggaran tersimpan.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal melapor pelanggaran.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAchievement = async () => {
    if (!achievementForm.studentId || !achievementForm.title) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Siswa dan Judul Prestasi wajib diisi.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/bk/achievements", achievementForm);
      setOpenAchievementDialog(false);
      setAchievementForm({
        studentId: "",
        title: "",
        category: "Non-Akademik",
        level: "Sekolah",
        description: "",
      });
      fetchData();
      toast({ title: "Berhasil", description: "Prestasi berhasil dicatat." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menambah prestasi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCounseling = async () => {
    if (
      !counselingForm.studentId ||
      !counselingForm.title ||
      !counselingForm.notes
    ) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Siswa, Topik, dan Catatan wajib diisi.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/bk/counseling", counselingForm);
      setOpenCounselingDialog(false);
      setCounselingForm({
        studentId: "",
        type: "Pribadi",
        title: "",
        notes: "",
        followUp: "",
      });
      fetchData();
      toast({
        title: "Berhasil",
        description: "Sesi konseling berhasil direkam.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal merekam konseling.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Kesiswaan & BK
          </h2>
          <p className="text-slate-500">
            Monitoring kedisiplinan, poin pelanggaran, dan bimbingan konseling
            siswa.
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="incidents"
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4 lg:w-[700px] h-auto p-1 bg-slate-100 rounded-full border border-slate-200">
          <TabsTrigger
            value="incidents"
            className="rounded-full data-[state=active]:bg-school-navy data-[state=active]:text-white py-2.5 transition-all"
          >
            <WarningTriangle className="mr-2 h-4 w-4" /> Pelanggaran
          </TabsTrigger>
          <TabsTrigger
            value="points"
            className="rounded-full data-[state=active]:bg-school-navy data-[state=active]:text-white py-2.5 transition-all"
          >
            <Megaphone className="mr-2 h-4 w-4" /> Poin & Sanksi
          </TabsTrigger>
          <TabsTrigger
            value="counseling"
            className="rounded-full data-[state=active]:bg-school-navy data-[state=active]:text-white py-2.5 transition-all"
          >
            <Heart className="mr-2 h-4 w-4" /> Konseling
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="rounded-full data-[state=active]:bg-school-navy data-[state=active]:text-white py-2.5 transition-all"
          >
            <Trophy className="mr-2 h-4 w-4" /> Prestasi
          </TabsTrigger>
        </TabsList>

        {/* Tab Pelanggaran */}
        <TabsContent value="incidents" className="space-y-4">
          <Card className="border-t-4 border-t-school-gold shadow-md border-none bg-white">
            <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="font-serif text-xl text-school-navy">
                  Daftar Pelanggaran
                </CardTitle>
                <CardDescription>
                  Catat dan monitoring ketidakdisiplinan siswa.
                </CardDescription>
              </div>
              <Dialog
                open={openIncidentDialog}
                onOpenChange={setOpenIncidentDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 shadow-md"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Lapor Pelanggaran
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-school-navy">
                      Lapor Pelanggaran Siswa
                    </DialogTitle>
                    <DialogDescription>
                      Isi form berikut untuk mencatat pelanggaran tata tertib.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Nama Siswa
                      </Label>
                      <Select
                        onValueChange={(v) =>
                          setIncidentForm({ ...incidentForm, studentId: v })
                        }
                      >
                        <SelectTrigger className="bg-slate-50 focus:ring-school-gold">
                          <SelectValue placeholder="Cari Siswa..." />
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Jenis Pelanggaran
                        </Label>
                        <Select
                          value={incidentForm.type}
                          onValueChange={(v) =>
                            setIncidentForm({ ...incidentForm, type: v })
                          }
                        >
                          <SelectTrigger className="bg-slate-50">
                            <SelectValue placeholder="Jenis" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Keterlambatan">
                              Keterlambatan
                            </SelectItem>
                            <SelectItem value="Atribut">
                              Atribut Tidak Lengkap
                            </SelectItem>
                            <SelectItem value="Bolos">
                              Bolos Sekolah/Pelajaran
                            </SelectItem>
                            <SelectItem value="Bullying">
                              Perundungan (Bullying)
                            </SelectItem>
                            <SelectItem value="Berkelahi">Berkelahi</SelectItem>
                            <SelectItem value="Merokok">Merokok</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Poin Penalti
                        </Label>
                        <Input
                          type="number"
                          className="bg-slate-50"
                          value={incidentForm.point}
                          onChange={(e) =>
                            setIncidentForm({
                              ...incidentForm,
                              point: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Keterangan / Kronologi
                      </Label>
                      <Textarea
                        className="bg-slate-50 min-h-[80px]"
                        placeholder="Jelaskan detail kejadian..."
                        value={incidentForm.description}
                        onChange={(e) =>
                          setIncidentForm({
                            ...incidentForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Sanksi / Tindakan
                      </Label>
                      <Input
                        className="bg-slate-50"
                        placeholder="Contoh: Membersihkan halaman, push up, dsb."
                        value={incidentForm.sanction}
                        onChange={(e) =>
                          setIncidentForm({
                            ...incidentForm,
                            sanction: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      className="w-full bg-red-600 hover:bg-red-700 font-bold"
                      onClick={handleReportIncident}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <SystemRestart className="animate-spin mr-2" />
                      ) : null}
                      {submitting ? "Menyimpan.." : "Simpan Laporan"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-school-navy">
                  <TableRow className="hover:bg-school-navy">
                    <TableHead className="text-white font-bold w-[120px]">
                      Tanggal
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Siswa
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Jenis
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Keterangan
                    </TableHead>
                    <TableHead className="text-white font-bold w-[80px] text-center">
                      Poin
                    </TableHead>
                    <TableHead className="text-white font-bold w-[100px] text-center">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-slate-500"
                      >
                        Belum ada data pelanggaran.
                      </TableCell>
                    </TableRow>
                  ) : (
                    incidents.map((inc: any) => (
                      <TableRow
                        key={inc._id}
                        className="hover:bg-slate-50 border-b border-slate-100"
                      >
                        <TableCell className="font-medium text-slate-600">
                          {new Date(inc.date).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="font-bold text-school-navy">
                          {inc.student?.profile?.fullName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-red-200 text-red-700 bg-red-50"
                          >
                            {inc.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-slate-600 max-w-[200px] truncate"
                          title={inc.description}
                        >
                          {inc.description}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-red-600">
                            +{inc.point}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {inc.status}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Poin & Sanksi */}
        <TabsContent value="points" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <Card className="bg-red-50 border-red-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-700 text-sm font-bold uppercase tracking-wider">
                  Perhatian Khusus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif font-bold text-red-800">
                  {
                    violationStats.filter((s: any) => s.totalPoints >= 50)
                      .length
                  }{" "}
                  Siswa
                </div>
                <p className="text-xs text-red-600 mt-1">
                  Akumulasi poin {">"}= 50
                </p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-orange-700 text-sm font-bold uppercase tracking-wider">
                  Perlu Pembinaan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif font-bold text-orange-800">
                  {
                    violationStats.filter(
                      (s: any) => s.totalPoints >= 25 && s.totalPoints < 50,
                    ).length
                  }{" "}
                  Siswa
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Akumulasi poin 25-49
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-t-4 border-t-school-gold shadow-lg border-none bg-white">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="font-serif text-xl text-school-navy">
                Monitoring Akumulasi Poin
              </CardTitle>
              <CardDescription>
                Tindakan otomatis berdasarkan ambang batas poin pelanggaran
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
                    <TableHead className="text-white font-bold text-center">
                      Jml Kasus
                    </TableHead>
                    <TableHead className="text-white font-bold text-center">
                      Total Poin
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Status / Tindakan
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violationStats.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-slate-500"
                      >
                        Tidak ada data pelanggaran.
                      </TableCell>
                    </TableRow>
                  ) : (
                    violationStats.map((stat: any) => (
                      <TableRow
                        key={stat._id}
                        className={
                          stat.totalPoints >= 50
                            ? "bg-red-50/50 hover:bg-red-50"
                            : "hover:bg-slate-50"
                        }
                      >
                        <TableCell className="font-bold text-school-navy">
                          {stat.fullName}
                        </TableCell>
                        <TableCell className="font-mono text-slate-500">
                          {stat.className}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {stat.incidentCount}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`text-lg font-bold px-3 py-1 rounded-full ${
                              stat.totalPoints >= 50
                                ? "bg-red-100 text-red-700"
                                : stat.totalPoints >= 25
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {stat.totalPoints}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            {stat.totalPoints >= 100 ? (
                              <Badge className="bg-red-900 border-red-800 text-white font-bold">
                                DO / KELUAR
                              </Badge>
                            ) : stat.totalPoints >= 75 ? (
                              <Badge
                                variant="destructive"
                                className="font-bold animate-pulse"
                              >
                                SP 3
                              </Badge>
                            ) : stat.totalPoints >= 50 ? (
                              <Badge
                                variant="destructive"
                                className="font-bold"
                              >
                                PANGGILAN ORTU
                              </Badge>
                            ) : stat.totalPoints >= 25 ? (
                              <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-orange-600">
                                PEMBINAAN WALI KELAS
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-emerald-600 border-emerald-200 bg-emerald-50"
                              >
                                AMAN
                              </Badge>
                            )}

                            {stat.totalPoints >= 25 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-school-navy text-school-navy hover:bg-school-navy hover:text-white"
                                onClick={() =>
                                  navigate(
                                    `/dashboard/student-affairs/letter/${stat._id}`,
                                  )
                                }
                              >
                                <Printer className="mr-1 h-3 w-3" /> Cetak Surat
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Konseling */}
        <TabsContent value="counseling" className="space-y-4">
          <Card className="border-t-4 border-t-school-gold shadow-md border-none bg-white">
            <CardHeader className="bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between pb-4 gap-4">
              <div>
                <CardTitle className="font-serif text-xl text-school-navy">
                  Rekam Konseling Privasi
                </CardTitle>
                <CardDescription>
                  Catatan ini bersifat rahasia (hanya guru BK).
                </CardDescription>
              </div>
              <Dialog
                open={openCounselingDialog}
                onOpenChange={setOpenCounselingDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md font-bold text-white">
                    <Plus className="mr-2 h-4 w-4" /> Buka Sesi Konseling
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-school-navy">
                      Rekam Sesi Konseling Baru
                    </DialogTitle>
                    <DialogDescription>
                      Pastikan privasi siswa terjaga saat mengisi data ini.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Nama Siswa Konseli
                      </Label>
                      <Select
                        onValueChange={(v) =>
                          setCounselingForm({ ...counselingForm, studentId: v })
                        }
                      >
                        <SelectTrigger className="bg-slate-50 focus:ring-school-gold">
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Topik Masalah
                        </Label>
                        <Input
                          className="bg-slate-50"
                          placeholder="Cth: Kesulitan Belajar Matematika"
                          value={counselingForm.title}
                          onChange={(e) =>
                            setCounselingForm({
                              ...counselingForm,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Kategori
                        </Label>
                        <Select
                          value={counselingForm.type}
                          onValueChange={(v) =>
                            setCounselingForm({ ...counselingForm, type: v })
                          }
                        >
                          <SelectTrigger className="bg-slate-50">
                            <SelectValue placeholder="Jenis Masalah" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pribadi">
                              Masalah Pribadi
                            </SelectItem>
                            <SelectItem value="Sosial">
                              Masalah Sosial/Teman
                            </SelectItem>
                            <SelectItem value="Belajar">
                              Masalah Belajar
                            </SelectItem>
                            <SelectItem value="Karir">
                              Bimbingan Karir
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Catatan Sesi (Verbatim/Ringkasan)
                      </Label>
                      <Textarea
                        className="bg-slate-50 h-32 leading-relaxed"
                        placeholder="Tuliskan inti permasalahan dan proses konseling..."
                        value={counselingForm.notes}
                        onChange={(e) =>
                          setCounselingForm({
                            ...counselingForm,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Rencana Tindak Lanjut
                      </Label>
                      <Input
                        className="bg-slate-50"
                        placeholder="Apa yang akan dilakukan setelah ini?"
                        value={counselingForm.followUp}
                        onChange={(e) =>
                          setCounselingForm({
                            ...counselingForm,
                            followUp: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleAddCounseling}
                      disabled={submitting}
                      className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold w-full"
                    >
                      {submitting ? (
                        <SystemRestart className="animate-spin mr-2" />
                      ) : null}
                      {submitting ? "Menyimpan.." : "Simpan Arsip Konseling"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {counseling.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500 italic bg-slate-50 border border-dashed rounded-lg">
                Belum ada riwayat konseling.
              </div>
            ) : (
              counseling.map((ses: any) => (
                <Card
                  key={ses._id}
                  className="hover:shadow-lg transition-all duration-300 border-none shadow-md overflow-hidden group"
                >
                  <CardHeader className="bg-indigo-50/50 pb-3 border-b border-indigo-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle
                          className="text-lg font-bold text-school-navy line-clamp-1"
                          title={ses.title}
                        >
                          {ses.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <span className="font-medium text-slate-700">
                            {ses.student?.profile?.fullName}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-white border-indigo-200 text-indigo-700"
                      >
                        {ses.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-400 mb-2">
                      {new Date(ses.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md mb-3 border border-slate-100 italic line-clamp-4">
                      "{ses.notes}"
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-50 p-2 rounded text-green-800 border border-green-100">
                      <span className="font-bold">Next:</span>{" "}
                      {ses.followUp || "Sesi selesai"}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab Prestasi */}
        <TabsContent value="achievements" className="space-y-4">
          <Card className="border-t-4 border-t-school-gold shadow-md border-none bg-white">
            <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="font-serif text-xl text-school-navy">
                  Rekap Prestasi Siswa
                </CardTitle>
                <CardDescription>
                  Database pencapaian akademik dan non-akademik.
                </CardDescription>
              </div>
              <Dialog
                open={openAchievementDialog}
                onOpenChange={setOpenAchievementDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Catat Prestasi
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-school-navy">
                      Catat Prestasi Baru
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Siswa Berprestasi
                      </Label>
                      <Select
                        onValueChange={(v) =>
                          setAchievementForm({
                            ...achievementForm,
                            studentId: v,
                          })
                        }
                      >
                        <SelectTrigger className="bg-slate-50 focus:ring-school-gold">
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

                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Nama / Judul Prestasi
                      </Label>
                      <Input
                        className="bg-slate-50 font-medium"
                        placeholder="Juara 1 Lomba Cerdas Cermat..."
                        value={achievementForm.title}
                        onChange={(e) =>
                          setAchievementForm({
                            ...achievementForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Kategori
                        </Label>
                        <Select
                          value={achievementForm.category}
                          onValueChange={(v) =>
                            setAchievementForm({
                              ...achievementForm,
                              category: v,
                            })
                          }
                        >
                          <SelectTrigger className="bg-slate-50">
                            <SelectValue placeholder="Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Akademik">Akademik</SelectItem>
                            <SelectItem value="Non-Akademik">
                              Non-Akademik
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Tingkat
                        </Label>
                        <Select
                          value={achievementForm.level}
                          onValueChange={(v) =>
                            setAchievementForm({ ...achievementForm, level: v })
                          }
                        >
                          <SelectTrigger className="bg-slate-50">
                            <SelectValue placeholder="Tingkat" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sekolah">Sekolah</SelectItem>
                            <SelectItem value="Kecamatan">Kecamatan</SelectItem>
                            <SelectItem value="Kabupaten">Kabupaten</SelectItem>
                            <SelectItem value="Provinsi">Provinsi</SelectItem>
                            <SelectItem value="Nasional">Nasional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Keterangan Tambahan (Opsional)
                      </Label>
                      <Textarea
                        className="bg-slate-50"
                        placeholder="Diselenggarakan oleh..."
                        value={achievementForm.description}
                        onChange={(e) =>
                          setAchievementForm({
                            ...achievementForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold w-full"
                      onClick={handleAddAchievement}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <SystemRestart className="animate-spin mr-2" />
                      ) : null}
                      {submitting ? "Menyimpan.." : "Simpan Prestasi"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-school-navy">
                  <TableRow className="hover:bg-school-navy">
                    <TableHead className="text-white font-bold">
                      Nama Siswa
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Judul Prestasi
                    </TableHead>
                    <TableHead className="text-white font-bold w-[150px]">
                      Tingkat
                    </TableHead>
                    <TableHead className="text-white font-bold w-[120px]">
                      Kategori
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        Belum ada data prestasi recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    achievements.map((ach: any) => (
                      <TableRow
                        key={ach._id}
                        className="hover:bg-slate-50 border-b border-slate-100"
                      >
                        <TableCell className="font-bold text-school-navy">
                          {ach.student?.profile?.fullName}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-800">
                            {ach.title}
                          </div>
                          <div className="text-xs text-slate-500 italic mt-0.5">
                            {ach.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200"
                          >
                            {ach.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {ach.category}
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
      </Tabs>
    </div>
  );
};

export default StudentAffairsDashboard;
