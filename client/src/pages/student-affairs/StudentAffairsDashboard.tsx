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
  AlertTriangle,
  Trophy,
  Search,
  Plus,
  Loader2,
  HeartHandshake,
  Siren,
} from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const StudentAffairsDashboard = () => {
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kesiswaan & BK</h2>
          <p className="text-muted-foreground">
            Monitoring kedisiplinan, poin pelanggaran, dan konseling.
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="incidents"
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="incidents">
            <AlertTriangle className="mr-2 h-4 w-4" /> Pelanggaran
          </TabsTrigger>
          <TabsTrigger value="points">
            <Siren className="mr-2 h-4 w-4" /> Poin & Sanksi
          </TabsTrigger>
          <TabsTrigger value="counseling">
            <HeartHandshake className="mr-2 h-4 w-4" /> Konseling
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="mr-2 h-4 w-4" /> Prestasi
          </TabsTrigger>
        </TabsList>

        {/* Tab Pelanggaran */}
        <TabsContent value="incidents" className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Daftar Pelanggaran</h3>
            <Dialog
              open={openIncidentDialog}
              onOpenChange={setOpenIncidentDialog}
            >
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Plus className="mr-2 h-4 w-4" /> Lapor Pelanggaran
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Lapor Pelanggaran</DialogTitle>
                  <DialogDescription>
                    Catat ketidakdisiplinan siswa.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Siswa</Label>
                    <Select
                      onValueChange={(v) =>
                        setIncidentForm({ ...incidentForm, studentId: v })
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
                    <Label className="text-right">Jenis</Label>
                    <Select
                      value={incidentForm.type}
                      onValueChange={(v) =>
                        setIncidentForm({ ...incidentForm, type: v })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Keterlambatan">
                          Keterlambatan
                        </SelectItem>
                        <SelectItem value="Atribut">Atribut</SelectItem>
                        <SelectItem value="Bolos">Bolos</SelectItem>
                        <SelectItem value="Bullying">Bullying</SelectItem>
                        <SelectItem value="Berkelahi">Berkelahi</SelectItem>
                        <SelectItem value="Merokok">Merokok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Poin</Label>
                    <Input
                      type="number"
                      className="col-span-3"
                      value={incidentForm.point}
                      onChange={(e) =>
                        setIncidentForm({
                          ...incidentForm,
                          point: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Ket.</Label>
                    <Textarea
                      className="col-span-3"
                      placeholder="Kronologi..."
                      value={incidentForm.description}
                      onChange={(e) =>
                        setIncidentForm({
                          ...incidentForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Sanksi</Label>
                    <Input
                      className="col-span-3"
                      placeholder="Hukuman"
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
                    onClick={handleReportIncident}
                    disabled={submitting}
                  >
                    {submitting ? "Menyimpan.." : "Simpan"}
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
                    <TableHead>Siswa</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Poin</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((inc: any) => (
                    <TableRow key={inc._id}>
                      <TableCell>
                        {new Date(inc.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {inc.student?.profile?.fullName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{inc.type}</Badge>
                      </TableCell>
                      <TableCell>{inc.description}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">+{inc.point}</Badge>
                      </TableCell>
                      <TableCell>{inc.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Poin & Sanksi */}
        <TabsContent value="points" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Poin Pelanggaran</CardTitle>
              <CardDescription>
                Siswa dengan akumulasi poin tinggi perlu perhatian khusus
                (Conseling / Panggilan Ortu).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Total Pelanggaran</TableHead>
                    <TableHead>Total Poin</TableHead>
                    <TableHead>Status / Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violationStats.map((stat: any) => (
                    <TableRow
                      key={stat._id}
                      className={stat.totalPoints >= 50 ? "bg-red-50" : ""}
                    >
                      <TableCell className="font-bold">
                        {stat.fullName}
                      </TableCell>
                      <TableCell>{stat.className}</TableCell>
                      <TableCell>{stat.incidentCount} Kasus</TableCell>
                      <TableCell className="text-lg text-red-600 font-bold">
                        {stat.totalPoints}
                      </TableCell>
                      <TableCell>
                        {stat.totalPoints >= 100 ? (
                          <Badge className="bg-red-700">DO / KELUAR</Badge>
                        ) : stat.totalPoints >= 75 ? (
                          <Badge variant="destructive">
                            SURAT PERINGATAN 3
                          </Badge>
                        ) : stat.totalPoints >= 50 ? (
                          <Badge variant="destructive">PANGGILAN ORTU</Badge>
                        ) : stat.totalPoints >= 25 ? (
                          <Badge className="bg-orange-500">
                            PEMBINAAN WALI KELAS
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600">
                            AMAN
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Konseling */}
        <TabsContent value="counseling" className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Rekam Konseling (Rahasia)</h3>
            <Dialog
              open={openCounselingDialog}
              onOpenChange={setOpenCounselingDialog}
            >
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="mr-2 h-4 w-4" /> Buka Sesi Konseling
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rekam Sesi Konseling</DialogTitle>
                  <DialogDescription>
                    Catatan ini bersifat rahasia antara Guru BK dan Siswa.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Siswa</Label>
                    <Select
                      onValueChange={(v) =>
                        setCounselingForm({ ...counselingForm, studentId: v })
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
                    <Label className="text-right">Topik</Label>
                    <Input
                      className="col-span-3"
                      placeholder="Masalah Belajar / Pribadi"
                      value={counselingForm.title}
                      onChange={(e) =>
                        setCounselingForm({
                          ...counselingForm,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Jenis</Label>
                    <Select
                      value={counselingForm.type}
                      onValueChange={(v) =>
                        setCounselingForm({ ...counselingForm, type: v })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Jenis Masalah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pribadi">Pribadi</SelectItem>
                        <SelectItem value="Sosial">Sosial</SelectItem>
                        <SelectItem value="Belajar">Belajar</SelectItem>
                        <SelectItem value="Karir">Karir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Catatan</Label>
                    <Textarea
                      className="col-span-3 h-32"
                      placeholder="Isi sesi konseling..."
                      value={counselingForm.notes}
                      onChange={(e) =>
                        setCounselingForm({
                          ...counselingForm,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Tindak Lanjut</Label>
                    <Input
                      className="col-span-3"
                      placeholder="Rencana ke depan"
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
                  <Button onClick={handleAddCounseling} disabled={submitting}>
                    {submitting ? "Menyimpan.." : "Simpan Sesi"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {counseling.map((ses: any) => (
              <Card key={ses._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{ses.title}</CardTitle>
                      <CardDescription>
                        {new Date(ses.date).toLocaleDateString()} •{" "}
                        {ses.student?.profile?.fullName}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{ses.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md mb-2">
                    "{ses.notes}"
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>Tindak Lanjut:</strong> {ses.followUp || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Counselor: {ses.counselor?.profile?.fullName}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Prestasi */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Daftar Prestasi</h3>
            <Dialog
              open={openAchievementDialog}
              onOpenChange={setOpenAchievementDialog}
            >
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600">
                  <Plus className="mr-2 h-4 w-4" /> Catat Prestasi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Catat Prestasi</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Siswa</Label>
                    <Select
                      onValueChange={(v) =>
                        setAchievementForm({ ...achievementForm, studentId: v })
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
                    <Label className="text-right">Judul</Label>
                    <Input
                      className="col-span-3"
                      value={achievementForm.title}
                      onChange={(e) =>
                        setAchievementForm({
                          ...achievementForm,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Kategori</Label>
                    <Select
                      value={achievementForm.category}
                      onValueChange={(v) =>
                        setAchievementForm({ ...achievementForm, category: v })
                      }
                    >
                      <SelectTrigger className="col-span-3">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Tingkat</Label>
                    <Select
                      value={achievementForm.level}
                      onValueChange={(v) =>
                        setAchievementForm({ ...achievementForm, level: v })
                      }
                    >
                      <SelectTrigger className="col-span-3">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Ket.</Label>
                    <Textarea
                      className="col-span-3"
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
                    className="bg-amber-500"
                    onClick={handleAddAchievement}
                    disabled={submitting}
                  >
                    {submitting ? "Menyimpan.." : "Simpan"}
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
                    <TableHead>Nama</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Tingkat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.map((ach: any) => (
                    <TableRow key={ach._id}>
                      <TableCell>{ach.student?.profile?.fullName}</TableCell>
                      <TableCell>
                        <div className="font-bold">{ach.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {ach.category}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ach.level}</Badge>
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

export default StudentAffairsDashboard;
