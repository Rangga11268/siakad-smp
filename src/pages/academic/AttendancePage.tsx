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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Book,
} from "iconoir-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import { useLocation } from "react-router-dom"; // Added useLocation

const AttendancePage = () => {
  const location = useLocation(); // Hook for location state
  const [activeTab, setActiveTab] = useState("daily");

  // Shared State
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<any[]>([]);

  // Data Logic
  const [dailyAttendance, setDailyAttendance] = useState<any>({}); // The "Parent" data
  const [subjectAttendance, setSubjectAttendance] = useState<any>({}); // The "Child" data

  // Mapel Tab State
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dayName, setDayName] = useState("");
  const { toast } = useToast();

  // Handle Navigation State (Pre-fill from Journal)
  useEffect(() => {
    if (location.state) {
      const { classId, date: stateDate, subjectId } = location.state;
      if (classId) setSelectedClass(classId);
      if (stateDate) setDate(stateDate);
      if (classId || subjectId) setActiveTab("subject"); // Default to subject tab if coming from journal
    }
  }, [location.state]);

  // Auto-select Schedule if subjectId is provided (wait for schedules to load)
  useEffect(() => {
    if (location.state?.subjectId && schedules.length > 0) {
      const matchingSchedule = schedules.find(
        (s: any) =>
          (typeof s.subject === "object" ? s.subject._id : s.subject) ===
          location.state.subjectId,
      );
      if (matchingSchedule) {
        setSelectedSchedule(matchingSchedule._id);
      }
    }
  }, [schedules, location.state]);

  useEffect(() => {
    fetchClasses(date);
    // Don't reset if we have location state
    if (!location.state) {
      setStudents([]);
      setSelectedClass("");
      setSelectedSchedule("");
    }
  }, [date]);

  // Fetch Schedules when Class Changes (for Mapel Tab)
  useEffect(() => {
    if (selectedClass && date) {
      if (activeTab === "subject") fetchSchedulesForClass();
      fetchData(); // Fetch students & daily attendance
    }
  }, [selectedClass, activeTab]);

  // Fetch Subject Attendance when Schedule selection changes
  useEffect(() => {
    if (selectedSchedule && activeTab === "subject") {
      fetchSubjectData();
    }
  }, [selectedSchedule]);

  const getDayName = (dateStr: string) => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[new Date(dateStr).getDay()];
  };

  const fetchClasses = async (currentDate: string) => {
    try {
      const dayName = getDayName(currentDate);
      setDayName(dayName);

      // 1. Get all classes
      const classRes = await api.get("/academic/class");
      setClasses(classRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSchedulesForClass = async () => {
    if (!selectedClass) return;
    try {
      const day = getDayName(date);
      const res = await api.get("/schedule", {
        params: { class: selectedClass, day },
      });
      setSchedules(res.data);
    } catch (err) {
      console.error("Failed to load schedules", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get Students
      const resStudents = await api.get(
        `/academic/class/${selectedClass}/students`,
      );
      const studentList = resStudents.data;

      // 2. Get DAILY Attendance (The Base)
      const resDaily = await api.get("/attendance/daily", {
        params: { classId: selectedClass, date }, // No scheduleId = Daily
      });
      const dailyRecords = resDaily.data;

      const dailyMap: any = {};
      studentList.forEach((s: any) => {
        const record = dailyRecords.find((r: any) => r.student === s._id);
        dailyMap[s._id] = {
          status: record ? record.status : null,
          note: record ? record.note : "",
        };
      });

      setStudents(studentList);
      setDailyAttendance(dailyMap);
    } catch (error) {
      console.error("Gagal load data absensi", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data kelas/harian.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectData = async () => {
    if (!selectedSchedule) return;
    setLoading(true);
    try {
      const resSubject = await api.get("/attendance/daily", {
        params: { classId: selectedClass, date, scheduleId: selectedSchedule },
      });
      const subjectRecords = resSubject.data;

      const subjectMap: any = {};
      students.forEach((s: any) => {
        const record = subjectRecords.find((r: any) => r.student === s._id);
        // Default: If no record, inherit "Hadir" if Daily is "Hadir", else inherit Daily
        const dailyStatus = dailyAttendance[s._id]?.status;

        // Inheritance Logic
        let initialStatus = null;
        if (record) {
          initialStatus = record.status;
        } else {
          // Not recorded yet? Default to Present if Daily is Present. If Daily is Sick, default to Sick (and will be disabled)
          if (dailyStatus === "Present" || !dailyStatus) {
            initialStatus = null; // Let user choose (or auto-fill) - Let's keeping it null for 'Belum Absen' visual?
            // Or better: Auto-fill to "Present" for ease?. User prefers efficiency. Let's auto-fill Present if Daily is Present.
          } else {
            initialStatus = dailyStatus;
          }
        }

        subjectMap[s._id] = {
          status: initialStatus,
          note: record ? record.note : "",
          isInherited: dailyStatus && dailyStatus !== "Present", // Flag to disable input
        };
      });
      setSubjectAttendance(subjectMap);
    } catch (error) {
      console.error("Gagal load absensi mapel", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (
    studentId: string,
    status: string,
    type: "daily" | "subject",
  ) => {
    if (type === "daily") {
      setDailyAttendance((prev: any) => ({
        ...prev,
        [studentId]: { ...prev[studentId], status },
      }));
    } else {
      setSubjectAttendance((prev: any) => ({
        ...prev,
        [studentId]: { ...prev[studentId], status },
      }));
    }
  };

  const handleNoteChange = (
    studentId: string,
    note: string,
    type: "daily" | "subject",
  ) => {
    if (type === "daily") {
      setDailyAttendance((prev: any) => ({
        ...prev,
        [studentId]: { ...prev[studentId], note },
      }));
    } else {
      setSubjectAttendance((prev: any) => ({
        ...prev,
        [studentId]: { ...prev[studentId], note },
      }));
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    const isSubject = activeTab === "subject";
    const dataMap = isSubject ? subjectAttendance : dailyAttendance;

    try {
      const records = Object.keys(dataMap)
        .filter((studentId) => dataMap[studentId].status)
        .map((studentId) => ({
          studentId,
          status: dataMap[studentId].status,
          note: dataMap[studentId].note,
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

      const payload: any = {
        classId: selectedClass,
        date,
        records,
      };

      if (isSubject) {
        if (!selectedSchedule) {
          toast({ variant: "destructive", title: "Pilih Jadwal Dulu" });
          setSubmitting(false);
          return;
        }
        payload.scheduleId = selectedSchedule;
        // Find subject ID from schedule
        const sched = schedules.find((s) => s._id === selectedSchedule);
        if (sched) {
          payload.subjectId =
            typeof sched.subject === "object"
              ? sched.subject._id
              : sched.subject;
          payload.academicYearId = sched.academicYear;
        }
      }

      await api.post("/attendance", payload);

      toast({
        title: "Berhasil",
        description: `Absensi ${isSubject ? "Mapel" : "Harian"} tersimpan.`,
      });

      // Refresh
      if (isSubject) fetchSubjectData();
      else fetchData();
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
          Manajemen Presensi
        </h2>
        <p className="text-slate-500">
          Kelola kehadiran siswa (Harian & Mata Pelajaran).
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-1/3 border-none shadow-md bg-white h-fit">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-school-navy">
                Tanggal Absensi
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-slate-300 focus:ring-school-gold bg-slate-50"
              />
              <p className="text-xs text-slate-400 font-medium text-right">
                {dayName}, {new Date(date).toLocaleDateString("id-ID")}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-school-navy">Pilih Kelas</Label>
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
                disabled={classes.length === 0}
              >
                <SelectTrigger className="border-slate-300 focus:ring-school-gold bg-slate-50">
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

            <Button
              variant="outline"
              className="w-full mt-4 border-school-navy text-school-navy hover:bg-school-navy hover:text-white"
              onClick={() => {
                if (activeTab === "subject") fetchSchedulesForClass();
                fetchData();
              }}
            >
              <SystemRestart className="w-4 h-4 mr-2" /> Refresh Data
            </Button>
          </CardContent>
        </Card>

        <div className="w-full md:w-2/3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger
                value="daily"
                className="font-bold data-[state=active]:bg-school-navy data-[state=active]:text-school-gold"
              >
                <Calendar className="w-4 h-4 mr-2" /> Absensi Harian (Wali
                Kelas)
              </TabsTrigger>
              <TabsTrigger
                value="subject"
                className="font-bold data-[state=active]:bg-school-navy data-[state=active]:text-school-gold"
              >
                <Book className="w-4 h-4 mr-2" /> Absensi Mapel (Guru)
              </TabsTrigger>
            </TabsList>

            {/* DAILY TAB */}
            <TabsContent value="daily">
              <AttendanceTable
                type="daily"
                data={dailyAttendance}
                students={students}
                selectedClass={selectedClass}
                loading={loading || submitting}
                onStatusChange={handleStatusChange}
                onNoteChange={handleNoteChange}
                onSave={handleSave}
                statuses={statuses}
                setData={setDailyAttendance}
              />
            </TabsContent>

            {/* SUBJECT TAB */}
            <TabsContent value="subject">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Label className="font-bold text-school-navy mb-2 block">
                  Pilih Mata Pelajaran / Jadwal
                </Label>
                <Select
                  value={selectedSchedule}
                  onValueChange={setSelectedSchedule}
                  disabled={!selectedClass || schedules.length === 0}
                >
                  <SelectTrigger className="bg-white border-blue-300">
                    <SelectValue
                      placeholder={
                        !selectedClass
                          ? "Pilih Kelas Dulu"
                          : schedules.length === 0
                            ? "Tidak ada jadwal hari ini"
                            : "-- Pilih Mapel --"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {schedules.map((s, idx) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.subject?.name || "Mapel"} ({s.startTime} -{" "}
                        {s.endTime}) -{" "}
                        {s.teacher?.profile?.fullName || s.teacher?.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSchedule ? (
                <AttendanceTable
                  type="subject"
                  data={subjectAttendance}
                  students={students}
                  selectedClass={selectedClass}
                  loading={loading || submitting}
                  onStatusChange={handleStatusChange}
                  onNoteChange={handleNoteChange}
                  onSave={handleSave}
                  statuses={statuses}
                  dailyData={dailyAttendance} // Pass daily data for inheritance check
                  setData={setSubjectAttendance}
                />
              ) : (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-xl">
                  <Book className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Silakan pilih jadwal mata pelajaran terlebih dahulu.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Table
const AttendanceTable = ({
  type,
  data,
  students,
  selectedClass,
  loading,
  onStatusChange,
  onNoteChange,
  onSave,
  statuses,
  dailyData,
  setData,
}: any) => {
  const { toast } = useToast();

  if (!selectedClass)
    return (
      <div className="text-center py-12 text-slate-400">
        Pilih kelas di sidebar kiri untuk mulai.
      </div>
    );

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-lg font-serif text-school-navy">
          {type === "daily" ? "Input Absensi Harian" : "Input Absensi Per Jam"}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              const newData = { ...data };
              students.forEach((s: any) => {
                // Only set alpha if not inherited (for subject)
                const dailyStatus = dailyData?.[s._id]?.status;
                if (
                  type === "subject" &&
                  dailyStatus &&
                  dailyStatus !== "Present"
                )
                  return;

                if (!newData[s._id]?.status) {
                  newData[s._id] = { ...newData[s._id], status: "Alpha" };
                }
              });
              setData(newData);
              toast({ description: "Auto-fill Alpha applied." });
            }}
          >
            Auto-Alpha
          </Button>
          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-school-navy hover:bg-school-gold hover:text-school-navy text-white font-bold shadow-md"
          >
            {loading ? (
              <SystemRestart className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <FloppyDisk className="w-4 h-4 mr-2" />
            )}{" "}
            Simpan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[50px] text-center">No</TableHead>
              <TableHead>Nama Siswa</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Tidak ada siswa.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student: any, idx: number) => {
                // Inheritance Check
                const dailyStatus = dailyData?.[student._id]?.status;
                const isInherited =
                  type === "subject" &&
                  dailyStatus &&
                  dailyStatus !== "Present";
                const currentStatus = data[student._id]?.status;

                // If inherited, force display valid daily status, else current status. Actually, currentStatus should already be set correctly by fetchSubjectData. But let's ensure visual feedback

                return (
                  <TableRow key={student._id}>
                    <TableCell className="text-center text-slate-500">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-school-navy">
                        {student.profile?.fullName || student.username}
                      </div>
                      {isInherited && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200">
                          Izin Harian:{" "}
                          {dailyStatus === "Sick"
                            ? "Sakit"
                            : dailyStatus === "Permission"
                              ? "Izin"
                              : "Alpha"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        {statuses.map((s: any) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              if (isInherited) return; // Locked
                              onStatusChange(student._id, s.id, type);
                            }}
                            disabled={isInherited}
                            className={cn(
                              "flex items-center gap-1 px-3 py-2 rounded-md border text-xs transition-all",
                              currentStatus === s.id
                                ? s.activeClass
                                : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50",
                              isInherited &&
                                currentStatus !== s.id &&
                                "opacity-30 cursor-not-allowed", // Dim non-active if inherited
                              isInherited &&
                                currentStatus === s.id &&
                                "cursor-not-allowed contrast-125", // Highlight active inherited
                            )}
                          >
                            {s.label[0]}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={data[student._id]?.note || ""}
                        onChange={(e) =>
                          onNoteChange(student._id, e.target.value, type)
                        }
                        disabled={isInherited}
                        className="h-8 text-xs bg-slate-50"
                        placeholder={
                          isInherited ? "Sesuai Absen Harian" : "Ket..."
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AttendancePage;
