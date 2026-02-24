import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Book,
  CheckCirle,
  Eye,
  WarningTriangle,
  SystemRestart,
} from "iconoir-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface ChildData {
  _id: string;
  fullName: string;
  class: string;
  avatar?: string;
  attendanceStats: {
    present: number;
    absent: number;
  };
  taskStats: {
    pending: number;
    graded: number;
  };
}

interface UpcomingTask {
  _id: string;
  title: string;
  subject: { name: string };
  type: string;
  deadline: string;
}

const ParentDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/parent/dashboard");
      setChildren(res.data.children || []);
      setUpcomingTasks(res.data.upcomingTasks || []);
    } catch (error) {
      console.error("Failed to load parent dashboard", error);
    } finally {
      setLoading(false);
    }
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
      <div className="bg-school-navy p-6 rounded-3xl text-white shadow-xl">
        <h1 className="text-2xl font-bold font-serif">
          Selamat Datang, Bapak/Ibu {user?.profile?.fullName}
        </h1>
        <p className="text-white/80 mt-1 flex items-center gap-2">
          Pantau perkembangan akademik dan presensi putra-putri Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Section: Children Overview */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-school-navy flex items-center gap-2">
            <Eye className="w-6 h-6 text-school-gold" />
            Putra - Putri Anda
          </h2>

          {children.length === 0 ? (
            <Card className="border-dashed shadow-none bg-slate-50">
              <CardContent className="flex flex-col items-center justify-center py-10 text-slate-500">
                <WarningTriangle className="w-10 h-10 text-amber-500 mb-3" />
                <p className="font-bold text-slate-700 text-lg">
                  Belum Terhubung
                </p>
                <p className="text-sm">
                  Akun Anda belum dihubungkan dengan data siswa. Silakan hubungi
                  admin sekolah.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {children.map((child) => (
                <Card
                  key={child._id}
                  className="border-none shadow-md overflow-hidden"
                >
                  <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                        <AvatarImage src={child.avatar} />
                        <AvatarFallback className="bg-school-navy text-white font-bold">
                          {child.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-school-navy text-lg">
                          {child.fullName}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">
                          Kelas {child.class}
                        </p>
                      </div>
                    </div>
                    {/* Add detailed view link later when child detail page is made */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:inline-flex"
                    >
                      Lihat Rapor
                    </Button>
                  </div>
                  <CardContent className="p-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                        <p className="text-2xl font-bold text-emerald-600">
                          {child.attendanceStats.present}
                        </p>
                        <p className="text-xs text-slate-500">
                          Hadir (Bulan Ini)
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-rose-50 border border-rose-100">
                        <p className="text-2xl font-bold text-rose-600">
                          {child.attendanceStats.absent}
                        </p>
                        <p className="text-xs text-slate-500">
                          Absen (Bulan Ini)
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-100">
                        <p className="text-2xl font-bold text-amber-600">
                          {child.taskStats.pending}
                        </p>
                        <p className="text-xs text-slate-500">Tugas Pending</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <p className="text-2xl font-bold text-blue-600">
                          {child.taskStats.graded}
                        </p>
                        <p className="text-xs text-slate-500">Tugas Dinilai</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-school-navy text-white rounded-t-xl pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-school-gold" /> Agenda
                Terdekat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingTasks.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  Tidak ada agenda / tugas terdekat.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-school-navy text-sm font-sans">
                          {task.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-white"
                        >
                          {task.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {task.subject?.name}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-rose-600 font-medium">
                        <WarningTriangle className="w-3 h-3" /> Deadline:{" "}
                        {new Date(task.deadline).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboardPage;
