import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Calendar,
  FloppyDisk,
  CheckCircle,
  XmarkCircle,
  Clock,
  PageSearch,
  SystemRestart,
  Group,
} from "iconoir-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const AttendancePage = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && date) {
      fetchData();
    } else {
      setStudents([]);
    }
  }, [selectedClass, date]);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/academic/class");
      setClasses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const resStudents = await api.get(
        `/academic/class/${selectedClass}/students`,
      );
      const studentList = resStudents.data;

      const resAttendance = await api.get("/attendance/daily", {
        params: { classId: selectedClass, date },
      });
      const existingRecords = resAttendance.data;

      const initialData: any = {};
      studentList.forEach((s: any) => {
        const record = existingRecords.find((r: any) => r.student === s._id);
        initialData[s._id] = {
          status: record ? record.status : null,
          note: record ? record.note : "",
        };
      });

      setStudents(studentList);
      setAttendanceData(initialData);
    } catch (error) {
      console.error("Gagal load data absensi", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData((prev: any) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceData((prev: any) => ({
      ...prev,
      [studentId]: { ...prev[studentId], note },
    }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const records = Object.keys(attendanceData)
        .filter((studentId) => attendanceData[studentId].status)
        .map((studentId) => ({
          studentId,
          status: attendanceData[studentId].status,
          note: attendanceData[studentId].note,
        }));

      if (records.length === 0) {
        toast({
          variant: "destructive",
          title: "Peringatan",
          description: "Belum ada status absensi yang dipilih.",
        });
        setSubmitting(false);
        return;
      }

      await api.post("/attendance", {
        classId: selectedClass,
        date,
        records,
      });

      toast({ title: "Berhasil", description: "Data absensi tersimpan." });
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menyimpan absensi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Status Configurations
  const statuses = [
    {
      id: "Present",
      label: "Hadir",
      icon: CheckCircle,
      color: "text-green-600",
      activeClass:
        "bg-green-100 border-green-500 text-green-700 font-bold shadow-sm",
    },
    {
      id: "Sick",
      label: "Sakit",
      icon: PageSearch,
      color: "text-yellow-600",
      activeClass:
        "bg-yellow-100 border-yellow-500 text-yellow-700 font-bold shadow-sm",
    },
    {
      id: "Permission",
      label: "Izin",
      icon: Clock,
      color: "text-blue-600",
      activeClass:
        "bg-blue-100 border-blue-500 text-blue-700 font-bold shadow-sm",
    },
    {
      id: "Alpha",
      label: "Alpha",
      icon: XmarkCircle,
      color: "text-red-600",
      activeClass: "bg-red-100 border-red-500 text-red-700 font-bold shadow-sm",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
          Absensi Harian
        </h2>
        <p className="text-slate-500">
          Catat dan kelola kehadiran siswa per kelas dan tanggal.
        </p>
      </div>

      <Card className="border-none shadow-md bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-1/3 space-y-2">
              <Label className="font-bold text-school-navy">Pilih Kelas</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="border-slate-300 focus:ring-school-gold bg-slate-50 h-10">
                  <SelectValue placeholder="-- Pilih Kelas --" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3 space-y-2">
              <Label className="font-bold text-school-navy">
                Tanggal Absensi
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-slate-300 focus:ring-school-gold bg-slate-50 h-10"
              />
            </div>
            <div className="w-full md:w-1/3">
              <Button
                onClick={fetchData}
                variant="outline"
                className="w-full h-10 border-school-navy text-school-navy hover:bg-school-navy hover:text-white transition-colors font-semibold"
              >
                <Calendar className="mr-2 h-4 w-4" /> Load Data Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && (
        <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
            <div>
              <CardTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
                <Group className="w-5 h-5 text-school-gold" />
                Daftar Kehadiran Siswa
              </CardTitle>
              <div className="flex flex-wrap gap-4 mt-2">
                {statuses.map((s) => {
                  const count = Object.values(attendanceData).filter(
                    (v: any) => v.status === s.id,
                  ).length;
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                        s.activeClass,
                      )}
                    >
                      <s.icon className="w-3.5 h-3.5" />
                      {s.label}: {count}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newData = { ...attendanceData };
                  students.forEach((s) => {
                    if (!newData[s._id]?.status) {
                      newData[s._id] = { ...newData[s._id], status: "Alpha" };
                    }
                  });
                  setAttendanceData(newData);
                  toast({
                    title: "Auto-Alpha Berhasil",
                    description: "Siswa tanpa keterangan kini ditandai Alpha.",
                  });
                }}
                className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
              >
                <XmarkCircle className="mr-2 h-4 w-4" /> Set All Alpha
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={submitting || students.length === 0}
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all"
              >
                {submitting ? (
                  <>
                    <SystemRestart className="mr-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <FloppyDisk className="mr-2 h-4 w-4" /> Simpan
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-school-navy">
                  <TableRow className="hover:bg-school-navy">
                    <TableHead className="text-white font-bold w-[50px] text-center">
                      No
                    </TableHead>
                    <TableHead className="text-white font-bold w-[250px]">
                      Nama Siswa
                    </TableHead>
                    <TableHead className="text-center text-white font-bold">
                      Status Kehadiran
                    </TableHead>
                    <TableHead className="text-white font-bold w-[250px]">
                      Keterangan (Opsional)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-school-gold">
                          <SystemRestart className="h-8 w-8 animate-spin mb-2" />
                          <p className="text-sm text-slate-500">
                            Memuat data absensi...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : students.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-12 text-slate-500"
                      >
                        Tidak ada siswa di kelas ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student, idx) => (
                      <TableRow
                        key={student._id}
                        className="hover:bg-slate-50 border-b border-slate-100"
                      >
                        <TableCell className="text-center font-medium text-slate-500">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-school-navy">
                              {student.profile?.fullName || student.username}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                              {student.username}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            {statuses.map((item) => (
                              <div
                                key={item.id}
                                onClick={() =>
                                  handleStatusChange(student._id, item.id)
                                }
                                className={cn(
                                  "flex items-center gap-1 px-3 py-2 rounded-md border text-xs cursor-pointer transition-all duration-200 select-none",
                                  attendanceData[student._id]?.status ===
                                    item.id
                                    ? item.activeClass
                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300",
                                )}
                              >
                                <item.icon className="w-3 h-3" />
                                {item.label}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Catatan..."
                            value={attendanceData[student._id]?.note || ""}
                            onChange={(e) =>
                              handleNoteChange(student._id, e.target.value)
                            }
                            className="h-9 w-full border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendancePage;
