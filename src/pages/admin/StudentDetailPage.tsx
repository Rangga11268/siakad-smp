import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  BookStack,
  Coins,
  Calendar,
  ArrowLeft,
  SystemRestart,
  WarningTriangle,
  CheckCircle,
} from "iconoir-react";
import { useToast } from "@/components/ui/use-toast";

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);

  // Tab Data States
  const [grades, setGrades] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const profileLet = await api.get(`/academic/students/${id}`);
      setStudent(profileLet.data);

      // 2. Fetch Grades
      const gradeRes = await api.get(`/academic/student-grades/${id}`);
      setGrades(gradeRes.data);

      // 3. Fetch Bills
      const billRes = await api.get(`/finance?student=${id}`);
      setBills(billRes.data);

      // 4. Fetch Attendance
      const attRes = await api.get(`/attendance/stats/${id}`);
      setAttendance(attRes.data);
    } catch (error) {
      console.error("Gagal ambil data siswa", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data lengkap siswa.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <SystemRestart className="animate-spin w-10 h-10 text-school-gold" />
      </div>
    );
  }

  if (!student) return <div>Data tidak ditemukan.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali
        </Button>
        <div>
          <h2 className="text-2xl font-bold font-serif text-school-navy">
            Profil Siswa 360°
          </h2>
          <p className="text-slate-500">Detail lengkap perkembangan siswa.</p>
        </div>
      </div>

      {/* Header Profile Card */}
      <Card className="bg-school-navy text-white border-none shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-school-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-4 border-school-gold text-4xl font-bold">
            {student.profile?.fullName?.charAt(0) || "S"}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold font-serif mb-2">
              {student.profile?.fullName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Badge className="bg-school-gold text-school-navy hover:bg-school-gold/90">
                {student.profile?.nisn}
              </Badge>
              <Badge variant="outline" className="text-white border-white/20">
                Kelas {student.profile?.class || "Belum Ada"}
              </Badge>
              <Badge
                variant="outline"
                className="text-white border-white/20 uppercase"
              >
                {student.profile?.gender === "L" ? "Laki-laki" : "Perempuan"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" /> Profil
          </TabsTrigger>
          <TabsTrigger value="academic">
            <BookStack className="w-4 h-4 mr-2" /> Akademik
          </TabsTrigger>
          <TabsTrigger value="finance">
            <Coins className="w-4 h-4 mr-2" /> Keuangan
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Calendar className="w-4 h-4 mr-2" /> Kehadiran
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PROFILE */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Biodata Lengkap</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold text-school-navy border-b pb-2">
                  Identitas Diri
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-500">Tempat Lahir</span>
                  <span className="font-medium">
                    {student.profile?.birthPlace || "-"}
                  </span>
                  <span className="text-slate-500">Tanggal Lahir</span>
                  <span className="font-medium">
                    {student.profile?.birthDate
                      ? new Date(student.profile.birthDate).toLocaleDateString()
                      : "-"}
                  </span>
                  <span className="text-slate-500">Alamat</span>
                  <span className="font-medium">
                    {student.profile?.address || "-"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-school-navy border-b pb-2">
                  Data Keluarga
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-500">Nama Ayah</span>
                  <span className="font-medium">
                    {student.profile?.family?.fatherName || "-"}
                  </span>
                  <span className="text-slate-500">Nama Ibu</span>
                  <span className="font-medium">
                    {student.profile?.family?.motherName || "-"}
                  </span>
                  <span className="text-slate-500">Pekerjaan</span>
                  <span className="font-medium">
                    {student.profile?.family?.parentJob || "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ACADEMIC */}
        <TabsContent value="academic" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {grades.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-500">
                Belum ada data nilai.
              </div>
            ) : (
              grades.map((g: any, idx: number) => (
                <Card key={idx} className="border-l-4 border-l-school-gold">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-school-navy">
                      {g.subject}
                    </CardTitle>
                    <CardDescription>Rata-rata: {g.average}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">
                        Tugas ({g.assignmentAvg})
                      </span>
                      <div className="h-2 bg-slate-100 w-1/2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${g.assignmentAvg}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Ujian ({g.examAvg})
                      </span>
                      <div className="h-2 bg-slate-100 w-1/2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${g.examAvg}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB 3: FINANCE */}
        <TabsContent value="finance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Tagihan</CardTitle>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <p className="text-center text-slate-500 my-4">
                  Tidak ada riwayat tagihan.
                </p>
              ) : (
                <div className="space-y-4">
                  {bills.map((bill: any) => (
                    <div
                      key={bill._id}
                      className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50"
                    >
                      <div>
                        <h4 className="font-bold text-school-navy">
                          {bill.title}
                        </h4>
                        <p className="text-sm text-slate-500">
                          Jatuh Tempo:{" "}
                          {bill.dueDate
                            ? new Date(bill.dueDate).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          Rp {bill.amount.toLocaleString()}
                        </p>
                        <Badge
                          className={
                            bill.status === "paid"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : bill.status === "pending"
                                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                : "bg-red-100 text-red-700"
                          }
                        >
                          {bill.status === "paid"
                            ? "Lunas"
                            : bill.status === "pending"
                              ? "Belum Bayar"
                              : "Gagal"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: ATTENDANCE */}
        <TabsContent value="attendance" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-green-800 font-bold mb-2">Hadir</h3>
                <p className="text-3xl font-bold text-green-600">
                  {attendance?.Present || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-yellow-800 font-bold mb-2">Sakit</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {attendance?.Sick || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-blue-800 font-bold mb-2">Izin</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {attendance?.Permission || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-red-800 font-bold mb-2">Alpha</h3>
                <p className="text-3xl font-bold text-red-600">
                  {attendance?.Alpha || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetailPage;
