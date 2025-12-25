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
import { AlertTriangle, Trophy, Search, Plus, Loader2 } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const StudentAffairsDashboard = () => {
  const [activeTab, setActiveTab] = useState("incidents");
  const [incidents, setIncidents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [students, setStudents] = useState([]); // For dropdown
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [openIncidentDialog, setOpenIncidentDialog] = useState(false);
  const [openAchievementDialog, setOpenAchievementDialog] = useState(false);
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

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    fetchStudents();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resIncidents, resAchievements] = await Promise.all([
        api.get("/bk/incidents"),
        api.get("/bk/achievements"),
      ]);
      setIncidents(resIncidents.data);
      setAchievements(resAchievements.data);
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
      // Fetches ALL students now
      const res = await api.get("/academic/students");
      setStudents(res.data);
    } catch (error) {
      console.error("Gagal load siswa", error);
    }
  };

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
      fetchData(); // Refresh list
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
      toast({
        title: "Berhasil",
        description: "Prestasi berhasil dicatat.",
      });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kesiswaan & BK</h2>
          <p className="text-muted-foreground">
            Monitoring kedisiplinan dan pencatatan prestasi siswa.
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="incidents"
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="incidents">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Pelanggaran / Kedisiplinan
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="mr-2 h-4 w-4" />
            Prestasi Siswa
          </TabsTrigger>
        </TabsList>

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
                  <DialogTitle>Lapor Pelanggaran Siswa</DialogTitle>
                  <DialogDescription>
                    Catat ketidakdisiplinan siswa untuk tindak lanjut.
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
                        <SelectValue placeholder="Jenis Pelanggaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Keterlambatan">
                          Keterlambatan
                        </SelectItem>
                        <SelectItem value="Atribut">
                          Atribut Tidak Lengkap
                        </SelectItem>
                        <SelectItem value="Bolos">Bolos</SelectItem>
                        <SelectItem value="Bullying">
                          Bullying / Perundungan
                        </SelectItem>
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
                    <Label className="text-right">Keterangan</Label>
                    <Textarea
                      className="col-span-3"
                      placeholder="Kronologi kejadian..."
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
                      placeholder="Hukuman/Tindakan"
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
                    {submitting ? "Menyimpan..." : "Simpan Laporan"}
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
                    <TableHead>Jenis Pelanggaran</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Poin</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        Belum ada data pelanggaran.
                      </TableCell>
                    </TableRow>
                  )}
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
                      <TableCell
                        className="max-w-[200px] truncate"
                        title={inc.description}
                      >
                        {inc.description}
                      </TableCell>
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

        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Daftar Prestasi Siswa</h3>
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
                  <DialogTitle>Catat Prestasi Siswa</DialogTitle>
                  <DialogDescription>
                    Apresiasi pencapaian siswa Akademik & Non-Akademik.
                  </DialogDescription>
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
                      placeholder="Juara 1 Lomba..."
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
                        <SelectValue placeholder="Pilih Kategori" />
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
                        <SelectValue placeholder="Pilih Tingkat" />
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
                    <Label className="text-right">Deskripsi</Label>
                    <Textarea
                      className="col-span-3"
                      placeholder="Detail prestasi..."
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
                    className="bg-amber-500 hover:bg-amber-600"
                    onClick={handleAddAchievement}
                    disabled={submitting}
                  >
                    {submitting ? "Menyimpan..." : "Simpan Prestasi"}
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
                    <TableHead>Prestasi</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tingkat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        Belum ada data prestasi.
                      </TableCell>
                    </TableRow>
                  )}
                  {achievements.map((ach: any) => (
                    <TableRow key={ach._id}>
                      <TableCell>
                        {new Date(ach.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {ach.student?.profile?.fullName}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-amber-600">
                          {ach.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ach.description}
                        </div>
                      </TableCell>
                      <TableCell>{ach.category}</TableCell>
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
