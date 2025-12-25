import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Trash2, Loader2 } from "lucide-react";
import api from "@/services/api";

interface Subject {
  _id: string;
  code: string;
  name: string;
  level: number;
  kktpType: string;
}

const MasterSubjectPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/academic/subject");
      setSubjects(res.data);
    } catch (error) {
      console.error("Gagal ambil mapel", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Todo: Show Dialog Form
    alert("Fitur Tambah Mapel akan menggunakan Dialog Form (Next Step)");
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Master Data Mata Pelajaran
          </h2>
          <p className="text-muted-foreground">
            Kelola mata pelajaran dan Tujuan Pembelajaran (TP).
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleCreate}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Mapel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Mata Pelajaran</CardTitle>
            <div className="w-1/3 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari mapel..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Mapel</TableHead>
                  <TableHead>Tingkat</TableHead>
                  <TableHead>Jenis Asesmen</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Belum ada data mata pelajaran.
                    </TableCell>
                  </TableRow>
                )}
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell className="font-medium">
                      {subject.code}
                    </TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>Kelas {subject.level}</TableCell>
                    <TableCell>{subject.kktpType}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterSubjectPage;
