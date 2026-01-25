import { useState, useEffect } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, RefreshCw, Trash2, BookOpen } from "lucide-react";

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface AcademicYear {
  _id: string;
  name: string;
  semester: string;
  status: string;
}

interface LearningGoal {
  _id: string;
  code: string;
  description: string;
  level: number;
}

const LearningGoalPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTP, setLoadingTP] = useState(false);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("7");
  const [selectedYear, setSelectedYear] = useState(""); // ID of Academic Year

  // Form
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedLevel && selectedYear) {
      fetchLearningGoals();
    }
  }, [selectedSubject, selectedLevel, selectedYear]);

  const fetchInitialData = async () => {
    try {
      const [subjRes, yearRes] = await Promise.all([
        api.get("/academic/subject"),
        api.get("/academic/years"),
      ]);
      setSubjects(subjRes.data);
      setAcademicYears(yearRes.data);

      // Auto select active year if any
      const activeYear = yearRes.data.find(
        (y: AcademicYear) => y.status === "active"
      );
      if (activeYear) setSelectedYear(activeYear._id);
    } catch (error) {
      console.error("Gagal load data awal", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data mapel/tahun ajaran.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningGoals = async () => {
    setLoadingTP(true);
    try {
      // Note: Backend getLearningGoals currently filters by subject and level,
      // but ideally should also filter by academicYear.
      // We'll pass it anyway to be safe or if backend is updated later.
      const res = await api.get(
        `/academic/tp?subjectId=${selectedSubject}&level=${selectedLevel}`
      );
      setLearningGoals(res.data);
    } catch (error) {
      console.error("Gagal ambil TP", error);
    } finally {
      setLoadingTP(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedSubject || !selectedYear) {
      toast({
        variant: "destructive",
        title: "Pilih Filter",
        description: "Pilih Mapel dan Tahun Ajaran dulu.",
      });
      return;
    }
    setSubmitting(true);
    try {
      // Find semester name from ID
      const yearObj = academicYears.find((y) => y._id === selectedYear);

      await api.post("/academic/tp", {
        subject: selectedSubject,
        academicYear: selectedYear,
        level: parseInt(selectedLevel),
        semester: yearObj?.semester || "Ganjil",
        code: formData.code,
        description: formData.description,
      });

      setIsOpen(false);
      setFormData({ code: "", description: "" });
      fetchLearningGoals();
      toast({ title: "Sukses", description: "TP berhasil ditambahkan." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menyimpan TP.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Tujuan Pembelajaran (TP)
          </h2>
          <p className="text-muted-foreground">
            Kelola TP untuk setiap Mata Pelajaran dan Jenjang.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Tambah TP Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Tujuan Pembelajaran</DialogTitle>
              <DialogDescription>
                TP akan dikaitkan dengan Mapel dan Jenjang yang dipilih saat
                ini.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Kode TP</Label>
                <Input
                  className="col-span-3"
                  placeholder="Misal: 7.1.1"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Deskripsi</Label>
                <Input
                  className="col-span-3"
                  placeholder="Peserta didik mampu..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Data</CardTitle>
          <CardDescription>
            Pilih Tahun Ajaran, Mapel, dan Jenjang untuk menampilkan TP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="space-y-2">
              <Label>Tahun Ajaran</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((y) => (
                    <SelectItem key={y._id} value={y._id}>
                      {y.name} - {y.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Mapel" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jenjang / Kelas</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tingkat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Kelas 7</SelectItem>
                  <SelectItem value="8">Kelas 8</SelectItem>
                  <SelectItem value="9">Kelas 9</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={fetchLearningGoals}
                disabled={loadingTP}
                className="w-full"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loadingTP ? "animate-spin" : ""}`}
                />
                Refresh Data
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Kode TP</TableHead>
                  <TableHead>Deskripsi Kompetensi</TableHead>
                  <TableHead className="w-[100px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTP ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : learningGoals.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center h-24 text-muted-foreground"
                    >
                      {!selectedSubject || !selectedYear
                        ? "Silakan pilih filter terlebih dahulu."
                        : "Belum ada TP untuk mapel ini."}
                    </TableCell>
                  </TableRow>
                ) : (
                  learningGoals.map((tp) => (
                    <TableRow key={tp._id}>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80">
                          {tp.code}
                        </span>
                      </TableCell>
                      <TableCell>{tp.description}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningGoalPage;
