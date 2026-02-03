import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Check,
  SystemRestart,
  FloppyDisk,
} from "iconoir-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Student {
  _id: string;
  profile: {
    fullName: string;
    avatar?: string;
    nisn?: string;
    gender?: string;
  };
}

interface AttendanceRecord {
  studentId: string;
  status: "Present" | "Sick" | "Permission" | "Alpha";
  note: string;
}

const HomeroomAttendancePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classData, setClassData] = useState<{
    _id: string;
    name: string;
  } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [existingData, setExistingData] = useState(false);

  useEffect(() => {
    fetchClassData();
  }, []);

  useEffect(() => {
    if (classData && students.length > 0) {
      fetchExistingAttendance();
    }
  }, [selectedDate, classData, students]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/homeroom/dashboard");
      setClassData(res.data.class);
      setStudents(res.data.students || []);

      // Initialize attendance with all Present
      const initialAttendance: Record<string, AttendanceRecord> = {};
      (res.data.students || []).forEach((s: Student) => {
        initialAttendance[s._id] = {
          studentId: s._id,
          status: "Present",
          note: "",
        };
      });
      setAttendance(initialAttendance);
    } catch (error: any) {
      console.error("Failed to load class data:", error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        navigate("/dashboard/teacher/hub");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const res = await api.get(`/attendance/daily`, {
        params: {
          classId: classData?._id,
          date: selectedDate,
        },
      });

      if (res.data && res.data.length > 0) {
        setExistingData(true);
        const existingAttendance: Record<string, AttendanceRecord> = {};

        // Start with all students as Present
        students.forEach((s) => {
          existingAttendance[s._id] = {
            studentId: s._id,
            status: "Present",
            note: "",
          };
        });

        // Override with existing data
        res.data.forEach((record: any) => {
          if (record.student?._id) {
            existingAttendance[record.student._id] = {
              studentId: record.student._id,
              status: record.status,
              note: record.note || "",
            };
          }
        });

        setAttendance(existingAttendance);
      } else {
        setExistingData(false);
        // Reset to all Present
        const resetAttendance: Record<string, AttendanceRecord> = {};
        students.forEach((s) => {
          resetAttendance[s._id] = {
            studentId: s._id,
            status: "Present",
            note: "",
          };
        });
        setAttendance(resetAttendance);
      }
    } catch (error) {
      console.error("Failed to fetch existing attendance:", error);
    }
  };

  const updateAttendance = (
    studentId: string,
    field: keyof AttendanceRecord,
    value: string,
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!classData) return;

    setSubmitting(true);
    try {
      const records = Object.values(attendance).map((record) => ({
        student: record.studentId,
        class: classData._id,
        date: selectedDate,
        status: record.status,
        note: record.note,
      }));

      await api.post("/attendance/daily/bulk", { records });

      toast({
        title: "Berhasil!",
        description: `Absensi ${selectedDate} untuk kelas ${classData.name} tersimpan.`,
      });

      setExistingData(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal menyimpan",
        description: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Sick":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Permission":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Alpha":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const countByStatus = (status: string) => {
    return Object.values(attendance).filter((a) => a.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SystemRestart className="w-8 h-8 animate-spin text-school-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-school-navy p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-xl"
              onClick={() => navigate("/dashboard/teacher/homeroom")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-serif">
                Input Absensi Harian
              </h1>
              <p className="text-white/80 text-sm">
                Kelas {classData?.name} • {students.length} Siswa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Calendar className="w-4 h-4" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-white w-36 p-0 h-auto focus-visible:ring-0"
              />
            </div>
            {existingData && (
              <Badge className="bg-school-gold text-school-navy">
                Data Tersimpan
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-emerald-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {countByStatus("Present")}
            </p>
            <p className="text-xs text-slate-500">Hadir</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-yellow-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {countByStatus("Sick")}
            </p>
            <p className="text-xs text-slate-500">Sakit</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-blue-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {countByStatus("Permission")}
            </p>
            <p className="text-xs text-slate-500">Izin</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-red-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {countByStatus("Alpha")}
            </p>
            <p className="text-xs text-slate-500">Alpha</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Kehadiran</CardTitle>
            <CardDescription>
              Pilih status kehadiran untuk setiap siswa
            </CardDescription>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-school-navy hover:bg-school-gold hover:text-school-navy"
          >
            {submitting ? (
              <SystemRestart className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FloppyDisk className="w-4 h-4 mr-2" />
            )}
            {existingData ? "Update Absensi" : "Simpan Absensi"}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Siswa</TableHead>
                <TableHead>NISN</TableHead>
                <TableHead className="w-40">Status</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, idx) => (
                <TableRow key={student._id}>
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={student.profile?.avatar} />
                        <AvatarFallback className="bg-school-gold/20 text-school-navy text-xs">
                          {student.profile?.fullName?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {student.profile?.fullName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {student.profile?.nisn || "-"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={attendance[student._id]?.status || "Present"}
                      onValueChange={(value) =>
                        updateAttendance(student._id, "status", value)
                      }
                    >
                      <SelectTrigger
                        className={`w-32 ${getStatusColor(
                          attendance[student._id]?.status || "Present",
                        )}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Present">
                          <span className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-emerald-600" /> Hadir
                          </span>
                        </SelectItem>
                        <SelectItem value="Sick">Sakit</SelectItem>
                        <SelectItem value="Permission">Izin</SelectItem>
                        <SelectItem value="Alpha">Alpha</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Keterangan..."
                      className="bg-slate-50 border-slate-200 h-9"
                      value={attendance[student._id]?.note || ""}
                      onChange={(e) =>
                        updateAttendance(student._id, "note", e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeroomAttendancePage;
