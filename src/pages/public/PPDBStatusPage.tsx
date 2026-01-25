import { useState } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PPDBStatusPage = () => {
  const [nisn, setNisn] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!nisn) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.get(`/ppdb/status/${nisn}`);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Data tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-600 text-lg px-4 py-2">
            <CheckCircle className="mr-2" /> LULUS SELEKSI
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-600 text-lg px-4 py-2">
            <XCircle className="mr-2" /> TIDAK LULUS
          </Badge>
        );
      case "verified":
        return (
          <Badge className="bg-blue-600 text-lg px-4 py-2">
            <CheckCircle className="mr-2" /> TERVERIFIKASI
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-600 text-lg px-4 py-2">
            <Clock className="mr-2" /> MENUNGGU VERIFIKASI
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Cek Status PPDB</CardTitle>
          <CardDescription>
            Masukkan NISN untuk melihat hasil seleksi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="Nomor Induk Siswa Nasional (NISN)"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {loading && (
            <div className="text-center text-muted-foreground">
              Mencari data...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 font-medium bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="p-4 bg-white border rounded-xl shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">
                  Nama Calon Siswa
                </p>
                <h3 className="text-xl font-bold">{result.fullname}</h3>
              </div>

              <div className="py-4">{getStatusBadge(result.status)}</div>

              {result.notes && (
                <div className="text-sm bg-yellow-50 p-3 rounded text-yellow-800">
                  <strong>Catatan Panitia:</strong>
                  <br />
                  {result.notes}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PPDBStatusPage;
