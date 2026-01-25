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
import {
  SystemRestart,
  Plus,
  Refresh,
  Trash,
  Book,
  Trophy,
} from "iconoir-react";

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
        (y: AcademicYear) => y.status === "active",
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
      const res = await api.get(
        `/academic/tp?subjectId=${selectedSubject}&level=${selectedLevel}`,
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Tujuan Pembelajaran (TP)
          </h2>
          <p className="text-slate-500">
            Kelola TP (Tujuan Pembelajaran) untuk penilaian rapor Kurikulum
            Merdeka.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all">
              <Plus className="mr-2 h-4 w-4" /> Tambah TP Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-school-navy">
                Tambah Tujuan Pembelajaran
              </DialogTitle>
              <DialogDescription>
                TP akan dikaitkan dengan Mapel dan Jenjang yang sedang dipilih
                di filter.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-2">
                <p className="text-sm text-blue-800 font-medium">
                  Konteks Data:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-700 mt-1">
                  <li>
                    Mapel:{" "}
                    {subjects.find((s) => s._id === selectedSubject)?.name ||
                      "-"}
                  </li>
                  <li>Kelas: {selectedLevel}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-school-navy">
                  Kode TP
                </Label>
                <Input
                  className="bg-slate-50 focus:border-school-gold"
                  placeholder="Misal: 7.1.1 (Kelas 7, Bab 1, TP 1)"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-school-navy">
                  Deskripsi Kompetensi
                </Label>
                <Input
                  className="bg-slate-50 focus:border-school-gold"
                  placeholder="Peserta didik mampu memahami konsep..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={submitting}
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full font-bold"
              >
                {submitting && (
                  <SystemRestart className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan TP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-md bg-white">
        <CardHeader>
          <CardTitle className="font-serif text-xl text-school-navy">
            Filter Data
          </CardTitle>
          <CardDescription>
            Pilih Tahun Ajaran, Mapel, dan Jenjang untuk menampilkan TP yang
            relevan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <Label className="font-semibold text-school-navy">
                Tahun Ajaran
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-slate-50 border-slate-300">
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
              <Label className="font-semibold text-school-navy">
                Mata Pelajaran
              </Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="bg-slate-50 border-slate-300">
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
              <Label className="font-semibold text-school-navy">
                Jenjang / Kelas
              </Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="bg-slate-50 border-slate-300">
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
                className="w-full border-school-navy text-school-navy hover:bg-school-navy hover:text-white transition-colors"
              >
                <Refresh
                  className={`mr-2 h-4 w-4 ${loadingTP ? "animate-spin" : ""}`}
                />
                Refresh Table
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center gap-2">
          <Trophy className="w-5 h-5 text-school-gold" />
          <CardTitle className="font-serif text-lg text-school-navy">
            Daftar Tujuan Pembelajaran
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-school-navy">
              <TableRow className="hover:bg-school-navy">
                <TableHead className="text-white font-bold w-[150px]">
                  Kode TP
                </TableHead>
                <TableHead className="text-white font-bold">
                  Deskripsi Kompetensi
                </TableHead>
                <TableHead className="text-white font-bold w-[100px] text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingTP ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    <div className="flex flex-col items-center justify-center text-school-gold">
                      <SystemRestart className="h-6 w-6 animate-spin mb-2" />
                      <p className="text-sm text-slate-500">
                        Memuat data TP...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : learningGoals.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center h-24 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Book className="h-8 w-8 text-slate-200 mb-2" />
                      {!selectedSubject || !selectedYear
                        ? "Silakan pilih filter Mapel dan Kelas terlebih dahulu."
                        : "Belum ada TP untuk kategori ini."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                learningGoals.map((tp) => (
                  <TableRow
                    key={tp._id}
                    className="hover:bg-slate-50 border-b border-slate-100"
                  >
                    <TableCell className="font-medium align-top">
                      <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none border-transparent bg-school-navy text-white shadow">
                        {tp.code}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-700 leading-relaxed">
                      {tp.description}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
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

export default LearningGoalPage;
