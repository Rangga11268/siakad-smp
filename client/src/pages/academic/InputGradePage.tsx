import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save, Loader2 } from "lucide-react";
import api from '@/services/api';

interface ClassData {
  _id: string;
  name: string;
}

interface SubjectData {
  _id: string;
  name: string;
}

const InputGradePage = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [classRes, subjectRes] = await Promise.all([
                api.get('/academic/class'),
                api.get('/academic/subject')
            ]);
            setClasses(classRes.data);
            setSubjects(subjectRes.data);
        } catch (error) {
            console.error("Gagal load filter", error);
        } finally {
            setLoadingOptions(false);
        }
    };
    fetchData();
  }, []);

  // Mock Students (Replace with Real Fetch later)
  const students = [
    { id: 1, name: "Ahmad Dani", nisn: "00123456", score: 0 },
    { id: 2, name: "Budi Santoso", nisn: "00123457", score: 0 },
    { id: 3, name: "Citra Kirana", nisn: "00123458", score: 0 },
  ];

  if (loadingOptions) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Input Nilai Akademik
        </h2>
        <p className="text-muted-foreground">
          Masukan nilai formatif dan sumatif siswa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Input</CardTitle>
          <CardDescription>
            Pilih Kelas dan Mata Pelajaran untuk mulai input nilai.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Select onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kelas" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                  <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Mapel" />
            </SelectTrigger>
            <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="w-full">Muat Data Siswa</Button>
        </CardContent>
      </Card>

      {selectedClass && selectedSubject && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Daftar Siswa - {selectedClass.toUpperCase()}
              </CardTitle>
              <CardDescription>Asesmen: Sumatif 1 (Lingkaran)</CardDescription>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" /> Simpan Nilai
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead className="w-[150px]">Nilai (0-100)</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.nisn}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        className="text-center font-bold"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        Cukup Baik
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InputGradePage;
