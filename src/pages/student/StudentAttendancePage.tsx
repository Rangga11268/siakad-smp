import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  CheckCircle,
  MapPin,
  SystemRestart,
  XmarkCircle,
} from "iconoir-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const StudentAttendancePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedDay, setSelectedDay] = useState("Senin");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState("");

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  // Manual Day Mapping to ensure compatibility across browsers/locales
  const dayMap: { [key: string]: string } = {
    sunday: "Minggu",
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    minggu: "Minggu",
    senin: "Senin",
    selasa: "Selasa",
    rabu: "Rabu",
    kamis: "Kamis",
    jumat: "Jumat",
    sabtu: "Sabtu",
  };

  const [todayName, setTodayName] = useState("Senin");

  useEffect(() => {
    // Robust day detection using index (0-6)
    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const d = new Date();
    const dayIndex = d.getDay(); // 0 = Sunday
    const indoDay = dayNames[dayIndex];

    setTodayName(indoDay);
    if (dayNames.includes(indoDay)) setSelectedDay(indoDay);
  }, []);

  useEffect(() => {
    const userAny = user as any;
    if (userAny && userAny.profile?.class) {
      fetchMyClass(userAny);
    }
  }, [selectedDay]);

  const fetchMyClass = async (currentUser: any) => {
    try {
      const clsName = currentUser?.profile?.class;
      if (!clsName) return;

      const res = await api.get("/academic/class");

      // Case-insensitive match
      const myClass = res.data.find(
        (c: any) =>
          c.name.trim().toLowerCase() === clsName.trim().toLowerCase(),
      );

      if (myClass) {
        fetchSchedules(myClass._id);
      } else {
        toast({
          variant: "destructive",
          title: "Data Kelas Error",
          description: `Kelas ${clsName} tidak ditemukan sistem.`,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSchedules = async (classId: string) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/schedule?classId=${classId}&day=${selectedDay}`,
      );
      setSchedules(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttend = async (scheduleId: string) => {
    setProcessing(scheduleId);
    try {
      await api.post("/attendance/subject", {
        scheduleId,
        status: "Present",
        // academicYear removed, backend handles it if missing
        date: new Date().toISOString(), // Send explicit date to avoid timezone issues
      });
      toast({ title: "Berhasil", description: "Hadir!" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.message || "Gagal absen",
      });
    } finally {
      setProcessing("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Absensi Pelajaran
          </h2>
          <p className="text-muted-foreground">
            Pilih hari dan kelas untuk melakukan absensi.
          </p>
        </div>
        <div className="w-full md:w-48">
          <Select onValueChange={setSelectedDay} value={selectedDay}>
            <SelectTrigger className="bg-white">
              <SelectValue />
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

      <div className="grid gap-6">
        {loading ? (
          <p>Loading jadwal...</p>
        ) : schedules.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-4 opacity-20" />
              <p>Tidak ada jadwal untuk hari {selectedDay}.</p>
            </CardContent>
          </Card>
        ) : (
          schedules.map((s) => (
            <Card
              key={s._id}
              className="relative overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500" />
              <CardContent className="p-6 pl-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">
                    {s.subject?.name || "Mapel"}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {s.startTime} - {s.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {s.class?.name || "Kelas"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Guru: {s.teacher?.profile?.fullName || "Guru"}
                  </p>
                </div>
                {(() => {
                  // Safety check for time format
                  if (!s.startTime || !s.endTime) return null;

                  if (selectedDay !== todayName) {
                    return (
                      <Button disabled className="bg-slate-300">
                        <CheckCircle className="mr-2 h-4 w-4" /> Lihat Saja
                      </Button>
                    );
                  }

                  const now = new Date();

                  // Helper to parse time safely
                  const parseTime = (timeStr: string) => {
                    const parts = timeStr.split(":");
                    return {
                      h: parseInt(parts[0]) || 0,
                      m: parseInt(parts[1]) || 0,
                    };
                  };

                  const start = parseTime(s.startTime);
                  const end = parseTime(s.endTime);

                  const startTime = new Date();
                  startTime.setHours(start.h, start.m, 0, 0);
                  const startTimeAllowed = new Date(startTime);
                  startTimeAllowed.setMinutes(
                    startTimeAllowed.getMinutes() - 15,
                  );

                  const endTime = new Date();
                  endTime.setHours(end.h, end.m, 0, 0);

                  const isTooEarly = now < startTimeAllowed;
                  const isActive = now >= startTimeAllowed && now <= endTime;
                  const isExpired = now > endTime;

                  return (
                    <Button
                      onClick={() => handleAttend(s._id)}
                      disabled={processing === s._id || !isActive}
                      className={cn(
                        "transition-all font-bold",
                        isActive
                          ? "bg-blue-600 hover:bg-blue-700 shadow-md text-white"
                          : isExpired
                            ? "bg-red-100 text-red-600 border border-red-200 hover:bg-red-200"
                            : "bg-slate-200 text-slate-500",
                      )}
                    >
                      {processing === s._id ? (
                        <SystemRestart className="mr-2 h-4 w-4 animate-spin" />
                      ) : isExpired ? (
                        <XmarkCircle className="mr-2 h-4 w-4" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      {isActive
                        ? "Absen Masuk"
                        : isTooEarly
                          ? "Belum Mulai"
                          : "Waktu Habis"}
                    </Button>
                  );
                })()}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAttendancePage;
