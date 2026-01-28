import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Page, Trash, Bookmark, BookStack } from "iconoir-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const AssessmentPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeAcademicYear, setActiveAcademicYear] = useState("");

  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const [loading, setLoading] = useState(true);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Assessment Form
  const [availableTPs, setAvailableTPs] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    type: "formative",
    classId: "",
    subjectId: "",
    selectedTPs: [] as string[],
  });

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [selectedClass, selectedSubject]);

  const fetchFilters = async () => {
    try {
      const [cls, subj, yrs] = await Promise.all([
        api.get("/academic/class"),
        api.get("/academic/subjects"),
        api.get("/academic/years"),
      ]);
      setClasses(cls.data);
      setSubjects(subj.data);
      const active = yrs.data.find((y: any) => y.status === "active");
      if (active) setActiveAcademicYear(active._id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      let q = "";
      if (selectedClass !== "all") q += `&classId=${selectedClass}`;
      if (selectedSubject !== "all") q += `&subjectId=${selectedSubject}`;
      const res = await api.get(`/academic/assessment?${q}`);
      setAssessments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTPs = async (clsId: string, subjId: string) => {
    if (!clsId || !subjId) return;
    try {
      const cls = classes.find((c) => c._id === clsId);
      const level = cls ? cls.level : "7"; // Fallback
      const res = await api.get(
        `/academic/tp?subjectId=${subjId}&level=${level}`,
      );
      setAvailableTPs(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!form.classId || !form.subjectId || !form.title) {
      toast({ variant: "destructive", title: "Mohon lengkapi data" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/academic/assessment", {
        title: form.title,
        type: form.type,
        subject: form.subjectId,
        class: form.classId,
        teacher: (user as any)?._id || (user as any)?.id,
        academicYear: activeAcademicYear,
        semester: "Ganjil", // Hardcoded for now
        learningGoals: form.selectedTPs,
      });
      toast({ title: "Berhasil", description: "Asesmen dibuat!" });
      setNewDialogOpen(false);
      setForm({ ...form, title: "", selectedTPs: [] }); // Reset partially
      fetchAssessments();
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal membuat asesmen" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-school-navy">
            Bank Asesmen
          </h2>
          <p className="text-slate-500">Kelola tugas dan ulangan harian.</p>
        </div>
        <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-school-navy hover:bg-school-gold font-bold">
              <Plus className="mr-2 h-4 w-4" /> Buat Asesmen Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Buat Asesmen Baru</DialogTitle>
              <DialogDescription>
                Isi detail asesmen di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kelas</Label>
                  <Select
                    value={form.classId}
                    onValueChange={(v) => {
                      setForm({ ...form, classId: v });
                      fetchTPs(v, form.subjectId);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mata Pelajaran</Label>
                  <Select
                    value={form.subjectId}
                    onValueChange={(v) => {
                      setForm({ ...form, subjectId: v });
                      fetchTPs(form.classId, v);
                    }}
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
              </div>

              <div className="space-y-2">
                <Label>Judul</Label>
                <Input
                  placeholder="Contoh: PH 1 - Aljabar"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formative">Formatif</SelectItem>
                    <SelectItem value="summative">Sumatif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lingkup TP (Opsional)</Label>
                <div className="border rounded p-3 h-32 overflow-y-auto">
                  {availableTPs.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      Pilih kelas & mapel untuk tampilkan TP
                    </p>
                  ) : (
                    availableTPs.map((tp) => (
                      <div
                        key={tp._id}
                        className="flex items-center gap-2 mb-2"
                      >
                        <Checkbox
                          checked={form.selectedTPs.includes(tp._id)}
                          onCheckedChange={(checked) => {
                            if (checked)
                              setForm({
                                ...form,
                                selectedTPs: [...form.selectedTPs, tp._id],
                              });
                            else
                              setForm({
                                ...form,
                                selectedTPs: form.selectedTPs.filter(
                                  (id) => id !== tp._id,
                                ),
                              });
                          }}
                        />
                        <span className="text-sm font-medium">{tp.code}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={submitting}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div className="w-[200px]">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Mapel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Mapel</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Mapel</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>TP</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-slate-500"
                  >
                    Belum ada data asesmen.
                  </TableCell>
                </TableRow>
              ) : (
                assessments.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-bold text-school-navy">
                      {a.title}
                    </TableCell>
                    <TableCell>{a.subject?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{a.class?.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          a.type === "summative"
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        }
                      >
                        {a.type === "summative" ? "Sumatif" : "Formatif"}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.learningGoals?.length || 0} TP</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                      >
                        <Trash className="w-4 h-4" />
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

export default AssessmentPage;
