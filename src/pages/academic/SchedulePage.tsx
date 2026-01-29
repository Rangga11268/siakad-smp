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
} from "iconoir-react";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Schedule {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: { name: string };
  teacher: {
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

  const handleSubmit = async () => {
    try {
      await api.post("/schedule", {
        ...formData,
        class: selectedClass,
        teacher: formData.teacher || undefined,
        academicYear: "676bd6ef259300302c09ef7a", // Consider fetching dynamic active year later
        semester: "Ganjil",
      });
      toast({ title: "Berhasil", description: "Jadwal berhasil ditambahkan" });
      setOpen(false);
      fetchSchedules();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal simpan jadwal",
      });
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Manajemen Jadwal
          </h2>
          <p className="text-slate-500">
            Atur roster pelajaran per kelas per semester.
          </p>
        </div>

        {(user as any)?.role === "admin" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={!selectedClass}
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy transition-colors font-bold shadow-md"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, day: selectedDay }))
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Jadwal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-school-navy">
                  Tambah Jadwal
                </DialogTitle>
                <DialogDescription>
                  Tambahkan slot pelajaran baru untuk kelas yang dipilih.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">Hari</Label>
                  <Select
                    value={formData.day}
                    onValueChange={(v) => setFormData({ ...formData, day: v })}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
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
                        setFormData({ ...formData, startTime: e.target.value })
                      }
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
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Mata Pelajaran
                  </Label>
                  <Select
                    onValueChange={(v) =>
                      setFormData({ ...formData, subject: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
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
                    Guru Pengajar
                  </Label>
                  <Select
                    onValueChange={(v) =>
                      setFormData({ ...formData, teacher: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
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
                  className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full"
                >
                  Simpan Jadwal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-none shadow-md bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-1/3 space-y-2">
              <Label className="font-bold text-school-navy">Pilih Kelas</Label>
              <Select onValueChange={setSelectedClass} value={selectedClass}>
                <SelectTrigger className="border-slate-300 focus:ring-school-gold bg-slate-50 h-10">
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
              <Label className="font-bold text-school-navy">Pilih Hari</Label>
              <Select onValueChange={setSelectedDay} value={selectedDay}>
                <SelectTrigger className="border-slate-300 focus:ring-school-gold bg-slate-50 h-10">
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

      <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
            <Calendar className="w-5 h-5 text-school-gold" />
            Jadwal Pelajaran:{" "}
            <span className="text-school-gold">{selectedDay}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-school-navy">
              <TableRow className="hover:bg-school-navy">
                <TableHead className="text-white font-bold w-[150px]">
                  Jam
                </TableHead>
                <TableHead className="text-white font-bold">
                  Mata Pelajaran
                </TableHead>
                <TableHead className="text-white font-bold">
                  Guru Pengajar
                </TableHead>
                <TableHead className="text-white font-bold text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center text-school-gold">
                      <SystemRestart className="h-6 w-6 animate-spin mb-2" />
                      <p className="text-sm text-slate-500">Memuat jadwal...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-32 py-12 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Calendar className="h-10 w-10 text-slate-200 mb-3" />
                      <p className="font-medium">
                        Belum ada jadwal untuk {selectedDay}.
                      </p>
                      <p className="text-xs">
                        Silakan pilih kelas lain atau tambahkan jadwal baru.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((s) => (
                  <TableRow
                    key={s._id}
                    className="hover:bg-slate-50 border-b border-slate-100"
                  >
                    <TableCell className="font-medium text-school-navy flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {s.startTime} - {s.endTime}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-bold text-school-navy">
                        <Book className="w-4 h-4 text-school-gold" />
                        {s.subject?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4 text-slate-400" />
                        {s.teacher?.profile?.fullName || "Guru"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {(user as any)?.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(s._id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
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

export default SchedulePage;
