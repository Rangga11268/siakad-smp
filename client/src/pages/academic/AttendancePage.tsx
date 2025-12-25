import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Calendar, Save } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

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
      // 1. Get Students in Class
      const resStudents = await api.get(
        `/academic/class/${selectedClass}/students`
      );
      const studentList = resStudents.data;

      // 2. Get Existing Attendance
      const resAttendance = await api.get("/attendance/daily", {
        params: { classId: selectedClass, date },
      });
      const existingRecords = resAttendance.data;

      // 3. Merge Data (Default "Present" if no record)
      const initialData: any = {};
      studentList.forEach((s: any) => {
        const record = existingRecords.find((r: any) => r.student === s._id);
        initialData[s._id] = {
          status: record ? record.status : "Present",
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
      const records = Object.keys(attendanceData).map((studentId) => ({
        studentId,
        status: attendanceData[studentId].status,
        note: attendanceData[studentId].note,
      }));

      await api.post("/attendance", {
        classId: selectedClass,
        date,
        records,
        // academicYearId: "..." // Optional if backend infers or we select it
        // For now, simplify. Backend handles or ignores if not strictly required
      });

      toast({ title: "Berhasil", description: "Data absensi tersimpan." });
      fetchData(); // Refresh to confirm
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Absensi Harian</h2>
        <p className="text-muted-foreground">
          Catat kehadiran siswa per kelas.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/3">
              <Label>Pilih Kelas</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kelas" />
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
            <div className="w-full md:w-1/3">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/3 flex items-end">
              <Button onClick={fetchData} variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" /> Refresh Data
              </Button>
            </div>
          </div>

          {selectedClass && (
            <>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead className="text-center">
                        Status Kehadiran
                      </TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Tidak ada siswa di kelas ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student, idx) => (
                        <TableRow key={student._id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">
                            {student.profile.fullName}
                            <div className="text-xs text-muted-foreground">
                              {student.username}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              {["Present", "Sick", "Permission", "Alpha"].map(
                                (status) => (
                                  <div
                                    key={status}
                                    onClick={() =>
                                      handleStatusChange(student._id, status)
                                    }
                                    className={`
                                                            cursor-pointer px-3 py-2 rounded-md border text-sm font-medium transition-all
                                                            ${
                                                              attendanceData[
                                                                student._id
                                                              ]?.status ===
                                                              status
                                                                ? getStatusColor(
                                                                    status
                                                                  )
                                                                : "bg-background hover:bg-muted text-muted-foreground"
                                                            }
                                                        `}
                                  >
                                    {status === "Present" && "Hadir"}
                                    {status === "Sick" && "Sakit"}
                                    {status === "Permission" && "Izin"}
                                    {status === "Alpha" && "Alpha"}
                                  </div>
                                )
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Catatan..."
                              value={attendanceData[student._id]?.note || ""}
                              onChange={(e) =>
                                handleNoteChange(student._id, e.target.value)
                              }
                              className="h-8 w-[200px]"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  size="lg"
                  onClick={handleSave}
                  disabled={submitting || students.length === 0}
                >
                  {submitting ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Simpan Absensi
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper for UI Data
const getStatusColor = (status: string) => {
  switch (status) {
    case "Present":
      return "bg-green-100 border-green-500 text-green-700";
    case "Sick":
      return "bg-yellow-100 border-yellow-500 text-yellow-700";
    case "Permission":
      return "bg-blue-100 border-blue-500 text-blue-700";
    case "Alpha":
      return "bg-red-100 border-red-500 text-red-700";
    default:
      return "bg-gray-100";
  }
};

export default AttendancePage;
