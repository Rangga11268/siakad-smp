import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, BookOpen, AlertTriangle, Wallet } from "lucide-react";

const DashboardPage = () => {
  const stats = [
    {
      title: "Total Siswa",
      value: "350",
      icon: Users,
      desc: "Aktif Tahun Ini",
      color: "text-blue-600",
    },
    {
      title: "Rata-rata Nilai",
      value: "82.5",
      icon: BookOpen,
      desc: "Semester Ganjil",
      color: "text-green-600",
    },
    {
      title: "Laporan Insiden",
      value: "5",
      icon: AlertTriangle,
      desc: "Perlu Penanganan",
      color: "text-orange-600",
    },
    {
      title: "Tagihan Belum Lunas",
      value: "Rp 15jt",
      icon: Wallet,
      desc: "Bulan Januari",
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground">
          Selamat Datang di Sistem Informasi Manajemen Sekolah.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Statistik Akademik</CardTitle>
            <CardDescription>
              Grafik rata-rata nilai per mata pelajaran kelas 7, 8, 9.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md">
              Chart Placeholder (Recharts)
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Kehadiran Hari Ini</CardTitle>
            <CardDescription>
              Persentase kehadiran siswa & guru.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Kelas 7A</p>
                  <p className="text-sm text-muted-foreground">28/30 Hadir</p>
                </div>
                <div className="ml-auto font-medium text-green-600">93%</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Kelas 8B</p>
                  <p className="text-sm text-muted-foreground">29/30 Hadir</p>
                </div>
                <div className="ml-auto font-medium text-green-600">96%</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Kelas 9C</p>
                  <p className="text-sm text-muted-foreground">25/30 Hadir</p>
                </div>
                <div className="ml-auto font-medium text-orange-600">83%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
