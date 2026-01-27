import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SystemRestart,
  Calendar,
  FloppyDisk,
  Clock,
  Book,
  Presentation,
  Page,
} from "iconoir-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface JournalForm {
  classId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  method: string;
  studentActivity: string;
  notes: string;
  materialIds: string[];
}

const JournalPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Data Lists
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [myJournals, setMyJournals] = useState<any[]>([]);
  const [allJournals, setAllJournals] = useState<any[]>([]); // For admin
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<JournalForm>({
    classId: "",
    subjectId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "07:00",
    endTime: "08:20",
    topic: "",
    method: "Ceramah & Diskusi",
    studentActivity: "",
    notes: "",
    materialIds: [], // New Field
  });
  const [file, setFile] = useState<File | null>(null);
  const [materials, setMaterials] = useState<any[]>([]); // Available materials
  const [editingJournal, setEditingJournal] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("entry");

  useEffect(() => {
    fetchMasterData();
    fetchMyJournals();
    if (user?.role === "admin") fetchAllJournals();
  }, [user]);

  const fetchMasterData = async () => {
    try {
      const [classesRes, subjectsRes, materialsRes] = await Promise.all([
        api.get("/academic/class"),
        api.get("/academic/subjects"),
        api.get("/learning-material"),
      ]);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setMaterials(materialsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMyJournals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/journal/mine");
      setMyJournals(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllJournals = async () => {
    try {
      const res = await api.get("/journal");
      setAllJournals(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "materialIds") {
        value.forEach((id: string) => submitData.append("materials[]", id));
      } else {
        submitData.append(key, value as string);
      }
    });
    if (file) {
      submitData.append("attachment", file);
    }

    try {
      await api.post("/journal", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({ title: "Berhasil", description: "Jurnal mengajar tersimpan!" });

      // Reset essential fields
      setFormData((prev) => ({
        ...prev,
        topic: "",
        notes: "",
        studentActivity: "",
      }));
      setFile(null);

      fetchMyJournals();
      if (user?.role === "admin") fetchAllJournals();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menyimpan jurnal.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (journal: any) => {
    setEditingJournal(journal);
    setFormData({
      classId: journal.class?._id || "",
      subjectId: journal.subject?._id || "",
      date:
        journal.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      startTime: journal.startTime || "07:00",
      endTime: journal.endTime || "08:20",
      topic: journal.topic || "",
      method: journal.method || "Ceramah & Diskusi",
      studentActivity: journal.studentActivity || "",
      notes: journal.notes || "",
      materialIds: journal.materials?.map((m: any) => m._id) || [],
    });
    // Switch to entry tab and scroll to form
    setActiveTab("entry");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJournal) return;
    setSubmitting(true);

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "materialIds") {
        (value as string[]).forEach((id: string) =>
          submitData.append("materials[]", id),
        );
      } else {
        submitData.append(key, value as string);
      }
    });
    if (file) {
      submitData.append("attachment", file);
    }

    try {
      await api.put(`/journal/${editingJournal._id}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({ title: "Berhasil", description: "Jurnal berhasil diupdate!" });
      setEditingJournal(null);
      resetForm();
      fetchMyJournals();
      if (user?.role === "admin") fetchAllJournals();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description:
          error?.response?.data?.message || "Gagal mengupdate jurnal.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      classId: "",
      subjectId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "07:00",
      endTime: "08:20",
      topic: "",
      method: "Ceramah & Diskusi",
      studentActivity: "",
      notes: "",
      materialIds: [],
    });
    setFile(null);
    setEditingJournal(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
          Jurnal Mengajar
        </h2>
        <p className="text-slate-500">
          Catat aktivitas belajar mengajar harian, materi yang disampaikan, dan
          kejadian penting di kelas.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="entry"
        className="space-y-6"
      >
        <TabsList className="bg-slate-100 p-1 rounded-lg w-full md:w-auto grid grid-cols-2 md:inline-flex md:grid-cols-none">
          <TabsTrigger
            value="entry"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white font-medium px-6"
          >
            Entri Jurnal
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white font-medium px-6"
          >
            Riwayat Saya
          </TabsTrigger>
          {user?.role === "admin" && (
            <TabsTrigger
              value="monitoring"
              className="data-[state=active]:bg-school-navy data-[state=active]:text-white font-medium px-6"
            >
              Monitoring Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="entry">
          <Card className="border-t-4 border-t-school-gold shadow-lg border-none">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
                <Presentation className="w-5 h-5 text-school-gold" /> Form
                Jurnal Kelas
              </CardTitle>
              <CardDescription>
                Lengkapi data di bawah ini setelah selesai mengajar.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form
                onSubmit={editingJournal ? handleUpdate : handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Tanggal Mengajar
                    </Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Jam Mulai
                      </Label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        required
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Jam Selesai
                      </Label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        required
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Kelas
                    </Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, classId: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
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
                    <Label className="font-semibold text-school-navy">
                      Mata Pelajaran
                    </Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, subjectId: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Pilih Mapel" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name} ({s.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Topik / Materi Pembelajaran
                  </Label>
                  <Input
                    placeholder="Contoh: Aljabar Linear - Pertemuan 1"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    required
                    className="bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Metode Pembelajaran
                    </Label>
                    <Input
                      value={formData.method}
                      onChange={(e) =>
                        setFormData({ ...formData, method: e.target.value })
                      }
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Aktivitas Siswa
                    </Label>
                    <Input
                      placeholder="Contoh: Diskusi Kelompok"
                      value={formData.studentActivity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studentActivity: e.target.value,
                        })
                      }
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Catatan / Kejadian Khusus
                  </Label>
                  <Textarea
                    placeholder="Contoh: Kendala teknis, siswa sakit, catatan perilaku, dll."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="min-h-[100px] bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Gunakan Bahan Ajar (Opsional)
                  </Label>
                  <Select
                    value={formData.materialIds[0] || ""}
                    onValueChange={(v) =>
                      setFormData({ ...formData, materialIds: [v] as any })
                    }
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Pilih Materi Terkait" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials
                        .filter(
                          (m) =>
                            !formData.subjectId ||
                            m.subject?._id === formData.subjectId,
                        )
                        .map((m) => (
                          <SelectItem key={m._id} value={m._id}>
                            {m.title} ({m.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Lampiran (File Bukti/Dokumentasi)
                  </Label>
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files) setFile(e.target.files[0]);
                    }}
                    className="cursor-pointer file:bg-school-navy file:text-white file:border-0 file:rounded-md file:px-2 file:text-sm hover:file:bg-school-gold hover:file:text-school-navy transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  {editingJournal && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="border-slate-300"
                    >
                      Batal Edit
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md min-w-[150px]"
                  >
                    {submitting ? (
                      <>
                        <SystemRestart className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <FloppyDisk className="mr-2 h-4 w-4" />
                        {editingJournal ? "Update Jurnal" : "Simpan Jurnal"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
                <Clock className="w-5 h-5 text-school-gold" /> Riwayat Jurnal
                Mengajar Saya
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <JournalTable
                journals={myJournals}
                loading={loading}
                onEdit={handleEdit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === "admin" && (
          <TabsContent value="monitoring">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
                  <Page className="w-5 h-5 text-school-gold" /> Monitoring Semua
                  Jurnal
                </CardTitle>
                <CardDescription>
                  Pantau aktivitas mengajar seluruh guru.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <JournalTable
                  journals={allJournals}
                  loading={false}
                  showTeacher
                  onEdit={handleEdit}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Sub-component for Table
const JournalTable = ({
  journals,
  loading,
  showTeacher = false,
  onEdit,
}: {
  journals: any[];
  loading: boolean;
  showTeacher?: boolean;
  onEdit?: (journal: any) => void;
}) => {
  return (
    <Table>
      <TableHeader className="bg-school-navy">
        <TableRow className="hover:bg-school-navy">
          <TableHead className="text-white font-bold whitespace-nowrap">
            Tanggal & Jam
          </TableHead>
          {showTeacher && (
            <TableHead className="text-white font-bold">Guru</TableHead>
          )}
          <TableHead className="text-white font-bold">Kelas</TableHead>
          <TableHead className="text-white font-bold">Mapel</TableHead>
          <TableHead className="text-white font-bold max-w-[200px]">
            Materi / Topik
          </TableHead>
          <TableHead className="text-white font-bold">Lampiran</TableHead>
          <TableHead className="text-white font-bold">Catatan</TableHead>
          {onEdit && (
            <TableHead className="text-white font-bold">Aksi</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={onEdit ? 8 : 7} className="text-center h-24">
              <div className="flex flex-col items-center justify-center text-school-gold">
                <SystemRestart className="h-6 w-6 animate-spin mb-2" />
                <p className="text-sm text-slate-500">Memuat data jurnal...</p>
              </div>
            </TableCell>
          </TableRow>
        ) : journals.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={onEdit ? 8 : 7}
              className="text-center h-24 text-slate-500"
            >
              <div className="flex flex-col items-center justify-center">
                <Book className="h-8 w-8 text-slate-200 mb-2" />
                <p>Belum ada data jurnal yang tersimpan.</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          journals.map((j: any) => (
            <TableRow
              key={j._id}
              className="hover:bg-slate-50 border-b border-slate-100"
            >
              <TableCell className="whitespace-nowrap font-medium text-school-navy">
                <div className="flex flex-col">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {new Date(j.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    {j.startTime} - {j.endTime}
                  </span>
                </div>
              </TableCell>
              {showTeacher && (
                <TableCell>
                  <div className="font-semibold text-slate-700">
                    {j.teacher?.profile?.fullName || j.teacher?.username}
                  </div>
                </TableCell>
              )}
              <TableCell>
                <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-bold border-blue-200 bg-blue-50 text-blue-700">
                  {j.class?.name || "-"}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                {j.subject?.name || "-"}
              </TableCell>
              <TableCell
                className="max-w-[200px] truncate font-medium text-slate-600"
                title={j.topic}
              >
                {j.topic}
              </TableCell>
              <TableCell>
                {j.attachment ? (
                  <a
                    href={`http://localhost:5000${j.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-school-navy hover:text-white transition-colors text-xs font-medium"
                  >
                    Unduh File
                  </a>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell
                className="max-w-[200px] truncate text-slate-500 text-sm italic"
                title={j.notes}
              >
                {j.notes || "-"}
              </TableCell>
              {onEdit && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(j)}
                    className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                  >
                    Edit
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default JournalPage;
