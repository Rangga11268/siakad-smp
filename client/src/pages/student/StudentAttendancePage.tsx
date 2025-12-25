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
  CalendarCheck,
  Clock,
  CheckCircle2,
  MapPin,
  Loader2,
} from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const StudentAttendancePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedDay, setSelectedDay] = useState("Senin");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState("");

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  // Get current day name in Indonesian
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });

  useEffect(() => {
    // Auto select today if in list, else Senin
    if (days.includes(today)) setSelectedDay(today);
  }, []);

  useEffect(() => {
    const userAny = user as any;
    if (userAny && userAny.profile?.class) {
      // We need Class ID.
      // Ideal: user.profile.class is just name. Need to fetch Class ID first or backend handles name lookup.
      // Backend getSchedules checks `classId` param.
      // Let's first fetch "My Class ID" via `/api/auth/me` or just filter schedules logic.
      // Actually, let's fetch my class object first.
      fetchMyClass(userAny);
    }
  }, [selectedDay]);

  const fetchMyClass = async (currentUser: any) => {
    try {
      // Assuming we know class name from profile
      const clsName = currentUser?.profile?.class;
      if (!clsName) return;

      const res = await api.get("/academic/class");
      const myClass = res.data.find((c: any) => c.name === clsName);

      if (myClass) fetchSchedules(myClass._id);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSchedules = async (classId: string) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/schedule?classId=${classId}&day=${selectedDay}`
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
        academicYear: "676bd6ef259300302c09ef7a", // Dummy, assume active year middleware exists but sending for safety
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
              <CalendarCheck className="h-12 w-12 mb-4 opacity-20" />
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
                  <h3 className="text-xl font-bold">{s.subject?.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {s.startTime} - {s.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {s.class?.name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Guru: {s.teacher?.profile?.fullName}
                  </p>
                </div>
                <Button
                  onClick={() => handleAttend(s._id)}
                  disabled={processing === s._id || selectedDay !== today}
                  className={`${
                    selectedDay === today ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  {processing === s._id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {selectedDay === today ? "Absen Masuk" : "Lihat Saja"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAttendancePage;
