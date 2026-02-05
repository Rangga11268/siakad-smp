import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import { SystemRestart } from "iconoir-react";

interface StudentAttendance {
  student: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  present: number;
  sick: number;
  permission: number;
  absent: number;
  total: number;
}

const HomeroomAttendanceSummary = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentAttendance[]>([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get("/homeroom/attendance-summary");
      if (res.data && res.data.students) {
        setData(res.data.students);
      }
    } catch (error) {
      console.error("Failed to load attendance summary", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <SystemRestart className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Siswa</TableHead>
            <TableHead className="text-center w-16 text-emerald-600">
              Hadir
            </TableHead>
            <TableHead className="text-center w-16 text-yellow-600">
              Sakit
            </TableHead>
            <TableHead className="text-center w-16 text-blue-600">
              Izin
            </TableHead>
            <TableHead className="text-center w-16 text-red-600">
              Alpha
            </TableHead>
            <TableHead className="text-center w-20">Kehadiran</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const percentage =
              item.total > 0
                ? Math.round((item.present / item.total) * 100)
                : 0;

            return (
              <TableRow key={item.student._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={item.student.avatar} />
                      <AvatarFallback className="bg-slate-100 text-slate-500 text-xs">
                        {item.student.fullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-slate-700">
                      {item.student.fullName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold text-emerald-600 bg-emerald-50/50">
                  {item.present}
                </TableCell>
                <TableCell className="text-center font-medium text-yellow-600">
                  {item.sick}
                </TableCell>
                <TableCell className="text-center font-medium text-blue-600">
                  {item.permission}
                </TableCell>
                <TableCell className="text-center font-bold text-red-600 bg-red-50/50">
                  {item.absent}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={percentage < 75 ? "destructive" : "secondary"}
                  >
                    {percentage}%
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-slate-500 italic"
              >
                Belum ada data absensi semester ini.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default HomeroomAttendanceSummary;
