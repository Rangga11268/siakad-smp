import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import { Heart, HomeHospital } from "iconoir-react";

const StudentUksPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-school-navy">
          Pusat Kesehatan (UKS)
        </h2>
        <p className="text-slate-500">
          Riwayat kesehatan dan kunjungan UKS Anda.
        </p>
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="w-4 h-4" /> Data Kesehatan
          </TabsTrigger>
          <TabsTrigger value="visits" className="flex items-center gap-2">
            <HomeHospital className="w-4 h-4" /> Riwayat Kunjungan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <HealthRecordsTab />
        </TabsContent>
        <TabsContent value="visits">
          <VisitsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const HealthRecordsTab = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/uks/records").then((res) => {
      setRecords(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catatan Kesehatan Periodik</CardTitle>
        <CardDescription>
          Pemeriksaan rutin tinggi/berat badan dan kesehatan umum.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Tinggi (cm)</TableHead>
              <TableHead>Berat (kg)</TableHead>
              <TableHead>Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Memuat...</TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>Belum ada data kesehatan.</TableCell>
              </TableRow>
            ) : (
              records.map((r: any) => (
                <TableRow key={r._id}>
                  <TableCell>
                    {new Date(r.date).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>{r.height}</TableCell>
                  <TableCell>{r.weight}</TableCell>
                  <TableCell>{r.notes || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const VisitsTab = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/uks/visits").then((res) => {
      setVisits(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Kunjungan</CardTitle>
        <CardDescription>Catatan kunjungan ke ruang UKS.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Keluhan</TableHead>
              <TableHead>Penanganan</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Memuat...</TableCell>
              </TableRow>
            ) : visits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>Belum ada riwayat kunjungan.</TableCell>
              </TableRow>
            ) : (
              visits.map((v: any) => (
                <TableRow key={v._id}>
                  <TableCell>
                    {new Date(v.date).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell className="font-medium">{v.complaint}</TableCell>
                  <TableCell>{v.treatment}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{v.status || "Selesai"}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StudentUksPage;
