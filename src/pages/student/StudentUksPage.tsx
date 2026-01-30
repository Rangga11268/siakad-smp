import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import {
  Heart,
  HomeHospital,
  Ruler,
  Weight,
  Activity,
  Eye,
  GitCommit,
} from "iconoir-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const StudentUksPage = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRecords, resVisits] = await Promise.all([
          api.get("/uks/records"),
          api.get("/uks/visits"),
        ]);
        setRecords(resRecords.data);
        setVisits(resVisits.data);
      } catch (error) {
        console.error("Failed to load UKS data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestRecord = records.length > 0 ? records[0] : null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-school-navy">
            Medical Health Card
          </h2>
          <p className="text-slate-500">
            Profil kesehatan digital dan rekam medis sekolah.
          </p>
        </div>
        <Badge variant="outline" className="text-sm py-1 px-3 bg-white">
          Last Updated:{" "}
          {latestRecord
            ? new Date(latestRecord.date).toLocaleDateString("id-ID", {
                dateStyle: "long",
              })
            : "-"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthMetricCard
          title="Tinggi Badan"
          value={latestRecord?.height || "-"}
          unit="cm"
          icon={<Ruler className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 border-blue-100"
        />
        <HealthMetricCard
          title="Berat Badan"
          value={latestRecord?.weight || "-"}
          unit="kg"
          icon={<Weight className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50 border-emerald-100"
        />
        <BMICard bmi={latestRecord?.bmi} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-lg w-full justify-start">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex-1 md:flex-none px-6"
              >
                Detail Fisik
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex-1 md:flex-none px-6"
              >
                Riwayat Screening
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <DetailedHealthCard record={latestRecord} />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <HealthHistoryList records={records} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full border-none shadow-lg bg-school-navy text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HomeHospital className="w-5 h-5 text-school-gold" />
                Riwayat Kunjungan
              </CardTitle>
              <CardDescription className="text-slate-300">
                Catatan berobat ke UKS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {visits.length === 0 ? (
                  <p className="text-slate-400 text-sm italic">
                    Belum ada riwayat kunjungan.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {visits.map((visit, idx) => (
                      <div
                        key={idx}
                        className="relative pl-6 border-l border-slate-600 pb-2 last:pb-0"
                      >
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-school-gold" />
                        <p className="text-xs text-slate-300 mb-1">
                          {new Date(visit.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="font-bold text-lg leading-tight">
                          {visit.complaint}
                        </p>
                        <p className="text-sm text-slate-300 mt-1">
                          {visit.treatment}
                        </p>
                        {visit.medicineGiven && (
                          <Badge
                            variant="secondary"
                            className="mt-2 text-xs bg-slate-700 hover:bg-slate-600 text-white border-none"
                          >
                            💊 {visit.medicineGiven}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const HealthMetricCard = ({ title, value, unit, icon, color }: any) => (
  <Card className={cn("border shadow-sm", color)}>
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-bold text-slate-800">{value}</span>
          <span className="text-sm text-slate-500">{unit}</span>
        </div>
      </div>
      <div className="p-3 bg-white rounded-full shadow-sm">{icon}</div>
    </CardContent>
  </Card>
);

const BMICard = ({ bmi }: { bmi: number }) => {
  const getStatus = (val: number) => {
    if (!val) return { label: "-", color: "bg-slate-100 text-slate-500" };
    if (val < 18.5)
      return { label: "Underweight", color: "bg-yellow-100 text-yellow-700" };
    if (val <= 25)
      return { label: "Normal", color: "bg-emerald-100 text-emerald-700" };
    return { label: "Overweight", color: "bg-red-100 text-red-700" };
  };

  const status = getStatus(bmi);

  return (
    <Card className="border border-purple-100 bg-purple-50 shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Body Mass Index</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-800">
              {bmi || "-"}
            </span>
            <Badge className={cn("border-none", status.color)}>
              {status.label}
            </Badge>
          </div>
        </div>
        <div className="p-3 bg-white rounded-full shadow-sm">
          <Activity className="w-6 h-6 text-purple-600" />
        </div>
      </CardContent>
    </Card>
  );
};

const DetailedHealthCard = ({ record }: { record: any }) => {
  if (!record)
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          Belum ada data rekaman kesehatan. Hubungi petugas UKS.
        </CardContent>
      </Card>
    );

  return (
    <Card className="border-school-gold border-t-4 shadow-md">
      <CardHeader>
        <CardTitle>Status Kesehatan Mata & Gigi</CardTitle>
        <CardDescription>
          Pemeriksaan oleh petugas UKS pada tanggal{" "}
          {new Date(record.date).toLocaleDateString("id-ID", {
            dateStyle: "full",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
          <div className="p-2 bg-white rounded-full shadow-sm text-blue-600">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-700">Penglihatan (Visus)</h4>
            <div className="mt-2 text-sm space-y-1">
              <div className="flex justify-between w-32">
                <span className="text-slate-500">Kiri (OS):</span>
                <span
                  className={cn(
                    "font-medium",
                    record.visionLeft !== "Normal"
                      ? "text-red-500"
                      : "text-emerald-600",
                  )}
                >
                  {record.visionLeft}
                </span>
              </div>
              <div className="flex justify-between w-32">
                <span className="text-slate-500">Kanan (OD):</span>
                <span
                  className={cn(
                    "font-medium",
                    record.visionRight !== "Normal"
                      ? "text-red-500"
                      : "text-emerald-600",
                  )}
                >
                  {record.visionRight}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
          <div className="p-2 bg-white rounded-full shadow-sm text-orange-600">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-700">Kesehatan Gigi</h4>
            <div className="mt-2">
              <Badge
                className={cn(
                  "text-sm px-3",
                  record.dentalHealth === "Sehat"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200",
                )}
              >
                {record.dentalHealth}
              </Badge>
              {record.notes && (
                <p className="mt-2 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200 italic">
                  "{record.notes}"
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const HealthHistoryList = ({ records }: { records: any[] }) => {
  if (records.length === 0)
    return (
      <div className="text-center py-10 text-slate-400">Tidak ada riwayat.</div>
    );

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-medium">Tanggal</th>
              <th className="px-6 py-3 font-medium">TB / BB</th>
              <th className="px-6 py-3 font-medium">Mata</th>
              <th className="px-6 py-3 font-medium">Gigi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r._id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-700">
                  {new Date(r.date).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4">
                  {r.height}cm / {r.weight}kg
                </td>
                <td className="px-6 py-4">
                  L:{r.visionLeft} R:{r.visionRight}
                </td>
                <td className="px-6 py-4">{r.dentalHealth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default StudentUksPage;
