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
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const SchedulePage = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  // const [teachers, setTeachers] = useState<any[]>([]);

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
      const [classRes, subjectRes] = await Promise.all([
        api.get("/academic/class"),
        api.get("/academic/subject"),
        // api.get("/academic/students"), // Placeholder
      ]);
      setClasses(classRes.data);
      setSubjects(subjectRes.data);
    } catch (error) {
      console.error("Failed load master", error);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/schedule?classId=${selectedClass}&day=${selectedDay}`
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
        teacher: "676bd6ef259300302c09ef7c", // Hardcoded Teacher for Demo
        academicYear: "676bd6ef259300302c09ef7a", // Hardcoded Year
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Jadwal</h2>
        <p className="text-muted-foreground">
          Atur jadwal pelajaran per kelas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Jadwal</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="w-1/3">
            <Label>Pilih Kelas</Label>
            <Select onValueChange={setSelectedClass} value={selectedClass}>
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
          <div className="w-1/3">
            <Label>Pilih Hari</Label>
            <Select onValueChange={setSelectedDay} value={selectedDay}>
              <SelectTrigger>
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
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedClass}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Jadwal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Jadwal Pelajaran</DialogTitle>
              <DialogDescription>
                Tambahkan slot pelajaran baru untuk kelas ini.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jam Mulai</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jam Selesai</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mata Pelajaran</Label>
                <Select
                  onValueChange={(v) =>
                    setFormData({ ...formData, subject: v })
                  }
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
              {/* Teacher Select would go here */}
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jam</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Belum ada jadwal hari ini.
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>
                      {s.startTime} - {s.endTime}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {s.subject?.name}
                    </TableCell>
                    <TableCell>
                      {s.teacher?.profile?.fullName || "Guru"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(s._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
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

export default SchedulePage;
