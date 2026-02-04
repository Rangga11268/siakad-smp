import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Plus,
  Trash,
  Calendar,
  Clock,
  User,
  Book,
  SystemRestart,
  EditPencil,
  Printer,
  FilterList,
} from "iconoir-react";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

interface Schedule {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: { _id: string; name: string; code?: string };
  teacher: {
    _id: string; // Ensure ID is available
    username: string;
    profile?: { fullName: string };
  };
}

const SchedulePage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDay, setSelectedDay] = useState("Senin");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    day: "Senin",
    startTime: "07:00",
    endTime: "08:30",
    subject: "",
    teacher: "",
  });

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSchedules();
    }
  }, [selectedClass, selectedDay]);

  const fetchMasterData = async () => {
    try {
      const [classRes, subjectRes, teacherRes] = await Promise.all([
        api.get("/academic/class"),
        api.get("/academic/subjects"),
        api.get("/academic/teachers"),
      ]);
      setClasses(classRes.data);
      setSubjects(subjectRes.data);
      setTeachers(teacherRes.data);
    } catch (error) {
      console.error("Failed load master", error);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/schedule?classId=${selectedClass}&day=${selectedDay}`,
      );
      setSchedules(res.data);
    } catch (error) {
      console.error("Failed load schedules", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      day: selectedDay,
      startTime: "07:00",
      endTime: "08:30",
      subject: "",
      teacher: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (schedule: Schedule) => {
    setEditId(schedule._id);
    setFormData({
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      subject: schedule.subject._id,
      teacher: schedule.teacher._id,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      toast({ title: "Error", description: "Pilih kelas terlebih dahulu" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        class: selectedClass,
        teacher: formData.teacher || undefined,
        academicYear: "676bd6ef259300302c09ef7a", // TODO: Fetch dynamic active year
        semester: "Ganjil",
      };

      if (editId) {
        await api.put(`/schedule/${editId}`, payload);
        toast({ title: "Berhasil", description: "Jadwal berhasil diperbarui" });
      } else {
        await api.post("/schedule", payload);
        toast({
          title: "Berhasil",
          description: "Jadwal berhasil ditambahkan",
        });
      }

      setOpen(false);
      fetchSchedules();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.message || "Gagal simpan jadwal",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jadwal ini?")) return;
    try {
      await api.delete(`/schedule/${id}`);
      fetchSchedules();
      toast({ title: "Terhapus", description: "Jadwal dihapus" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal hapus",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Manajemen Jadwal
          </h2>
          <p className="text-slate-500 mt-1">
            Atur roster pelajaran per kelas dan per semester secara efisien.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!selectedClass}
            className="border-school-gold text-school-navy hover:bg-school-gold hover:text-white transition-colors"
          >
            <Printer className="mr-2 h-4 w-4" /> Cetak Jadwal
          </Button>

          {(user as any)?.role === "admin" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={!selectedClass}
                  onClick={handleOpenAdd}
                  className="bg-school-navy hover:bg-school-gold hover:text-school-navy transition-colors font-bold shadow-md"
                >
                  <Plus className="mr-2 h-4 w-4" /> Tambah Jadwal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-school-navy">
                    {editId ? "Edit Jadwal" : "Tambah Jadwal Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    {editId
                      ? "Perbarui informasi jadwal pelajaran."
                      : "Tambahkan slot pelajaran baru untuk kelas yang dipilih."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Hari
                    </Label>
                    <Select
                      value={formData.day}
                      onValueChange={(v) =>
                        setFormData({ ...formData, day: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-school-gold">
                        <SelectValue placeholder="Pilih Hari" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        className="bg-slate-50 border-slate-200 focus:ring-school-gold"
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
                        className="bg-slate-50 border-slate-200 focus:ring-school-gold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Mata Pelajaran
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(v) =>
                        setFormData({ ...formData, subject: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-school-gold">
                        <SelectValue placeholder="Pilih Mapel" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.code ? `${s.code} - ` : ""}
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-school-navy">
                      Guru Pengajar
                    </Label>
                    <Select
                      value={formData.teacher}
                      onValueChange={(v) =>
                        setFormData({ ...formData, teacher: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-school-gold">
                        <SelectValue placeholder="Pilih Guru" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t._id} value={t._id}>
                            {t.profile?.fullName || t.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full font-bold"
                  >
                    {submitting ? (
                      <SystemRestart className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Calendar className="w-4 h-4 mr-2" />
                    )}
                    {editId ? "Simpan Perubahan" : "Simpan Jadwal"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filter Card */}
      <Card className="border-none shadow-md bg-white print:hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-1/3 space-y-2">
              <Label className="font-bold text-school-navy flex items-center gap-2">
                <FilterList className="w-4 h-4" /> Pilih Kelas
              </Label>
              <Select onValueChange={setSelectedClass} value={selectedClass}>
                <SelectTrigger className="border-slate-300 focus:ring-school-gold bg-slate-50 h-10 rounded-xl">
                  <SelectValue placeholder="-- Pilih Kelas --" />
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
            <div className="w-full md:w-1/3 space-y-2">
              <Label className="font-bold text-school-navy flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Pilih Hari
              </Label>
              <Select onValueChange={setSelectedDay} value={selectedDay}>
                <SelectTrigger className="border-slate-300 focus:ring-school-gold bg-slate-50 h-10 rounded-xl">
                  <SelectValue placeholder="Pilih Hari" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden bg-white">
        <CardHeader className="bg-white border-b border-slate-100 pb-4 flex flex-row justify-between items-center">
          <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
            <Calendar className="w-5 h-5 text-school-gold" />
            Jadwal: <span className="text-school-gold ml-1">{selectedDay}</span>
            {selectedClass && (
              <span className="text-slate-400 font-normal text-base ml-2">
                Kelas {classes.find((c) => c._id === selectedClass)?.name}
              </span>
            )}
          </CardTitle>
          <div className="text-sm text-slate-400 hidden md:block">
            {schedules.length} Sesi Pelajaran
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-school-navy">
              <TableRow className="hover:bg-school-navy">
                <TableHead className="text-white font-bold w-[180px]">
                  Waktu
                </TableHead>
                <TableHead className="text-white font-bold">
                  Mata Pelajaran
                </TableHead>
                <TableHead className="text-white font-bold">
                  Guru Pengajar
                </TableHead>
                <TableHead className="text-white font-bold text-right print:hidden">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-48">
                    <div className="flex flex-col items-center justify-center text-school-gold">
                      <SystemRestart className="h-8 w-8 animate-spin mb-3" />
                      <p className="text-sm text-slate-500 font-medium">
                        Memuat jadwal...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-48 py-12 text-slate-500 bg-slate-50/50"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="font-serif text-lg text-school-navy font-bold">
                        Tidak ada jadwal
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Belum ada pelajaran dijadwalkan untuk hari ini.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((s) => (
                  <TableRow
                    key={s._id}
                    className="group hover:bg-slate-50 border-b border-slate-100 transition-colors"
                  >
                    <TableCell className="font-medium text-school-navy">
                      <div className="flex items-center gap-2 bg-slate-100 w-fit px-3 py-1 rounded-full text-xs font-bold">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {s.startTime} - {s.endTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-school-navy text-base flex items-center gap-2">
                          {s.subject?.name}
                        </span>
                        {s.subject?.code && (
                          <Badge
                            variant="outline"
                            className="w-fit mt-1 text-[10px] text-slate-500 border-slate-200"
                          >
                            {s.subject.code}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-school-gold/20 flex items-center justify-center text-school-navy font-bold text-xs">
                          {s.teacher?.profile?.fullName?.charAt(0) || "G"}
                        </div>
                        <span className="text-slate-700 font-medium">
                          {s.teacher?.profile?.fullName || "Guru"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      {(user as any)?.role === "admin" && (
                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(s)}
                            className="text-slate-400 hover:text-school-navy hover:bg-slate-100 rounded-full"
                          >
                            <EditPencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(s._id)}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Print Footer CSS */}
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            .space-y-8, .space-y-8 * {
                visibility: visible;
            }
            .space-y-8 {
                position: absolute;
                left: 0;
                top: 0;
            }
            .print\\:hidden { // Double escape for JS string
                display: none !important;
            }
        }
      `}</style>
    </div>
  );
};

export default SchedulePage;
