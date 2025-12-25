import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Loader2, Calendar } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const JournalPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Data Lists
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [myJournals, setMyJournals] = useState<any[]>([]);
  const [allJournals, setAllJournals] = useState<any[]>([]); // For admin
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "07:00",
    endTime: "08:20",
    topic: "",
    method: "Ceramah & Diskusi",
    studentActivity: "",
    notes: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMasterData();
    fetchMyJournals();
    if (user?.role === "admin") fetchAllJournals();
  }, [user]);

  const fetchMasterData = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        api.get("/academic/class"),
        api.get("/academic/subject"),
      ]);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMyJournals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/journal/mine");
      setMyJournals(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllJournals = async () => {
    try {
      const res = await api.get("/journal");
      setAllJournals(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });
    if (file) {
      submitData.append("attachment", file);
    }

    try {
      await api.post("/journal", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({ title: "Berhasil", description: "Jurnal mengajar tersimpan!" });

      // Reset essential fields
      setFormData((prev) => ({
        ...prev,
        topic: "",
        notes: "",
        studentActivity: "",
      }));
      setFile(null);

      fetchMyJournals();
      if (user?.role === "admin") fetchAllJournals();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menyimpan jurnal.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Jurnal Mengajar</h2>
        <p className="text-muted-foreground">
          Catat aktivitas belajar mengajar harian.
        </p>
      </div>

      <Tabs defaultValue="entry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entry">Entri Jurnal</TabsTrigger>
          <TabsTrigger value="history">Riwayat Saya</TabsTrigger>
          {user?.role === "admin" && (
            <TabsTrigger value="monitoring">Monitoring (Admin)</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="entry">
          <Card>
            <CardHeader>
              <CardTitle>Form Jurnal Kelas</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Jam Mulai</Label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Jam Selesai</Label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Kelas</Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, classId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mata Pelajaran</Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, subjectId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Mapel" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name} ({s.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Topik / Materi Pembelajaran</Label>
                  <Input
                    placeholder="Contoh: Aljabar Linear - Pertemuan 1"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Metode Pembelajaran</Label>
                    <Input
                      value={formData.method}
                      onChange={(e) =>
                        setFormData({ ...formData, method: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Aktivitas Siswa</Label>
                    <Input
                      placeholder="Contoh: Diskusi Kelompok"
                      value={formData.studentActivity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studentActivity: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Catatan / Kejadian Khusus</Label>
                  <Textarea
                    placeholder="Kendala teknis, siswa sakit, dll."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lampiran (PDF/Gambar/Doc)</Label>
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files) setFile(e.target.files[0]);
                    }}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <SaveIcon className="mr-2 h-4 w-4" />
                    )}
                    Simpan Jurnal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Jurnal Mengajar</CardTitle>
            </CardHeader>
            <CardContent>
              <JournalTable journals={myJournals} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === "admin" && (
          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Semua Jurnal</CardTitle>
              </CardHeader>
              <CardContent>
                <JournalTable
                  journals={allJournals}
                  loading={false}
                  showTeacher
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Sub-component for Table
const JournalTable = ({
  journals,
  loading,
  showTeacher = false,
}: {
  journals: any[];
  loading: boolean;
  showTeacher?: boolean;
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead>Jam</TableHead>
          {showTeacher && <TableHead>Guru</TableHead>}
          <TableHead>Kelas</TableHead>
          <TableHead>Mapel</TableHead>
          <TableHead>Materi</TableHead>
          <TableHead>Lampiran</TableHead>
          <TableHead>Catatan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              Loading...
            </TableCell>
          </TableRow>
        ) : journals.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              Belum ada data.
            </TableCell>
          </TableRow>
        ) : (
          journals.map((j: any) => (
            <TableRow key={j._id}>
              <TableCell className="whitespace-nowrap font-medium">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-3 w-3" />{" "}
                  {new Date(j.date).toLocaleDateString("id-ID")}
                </div>
              </TableCell>
              <TableCell>
                {j.startTime} - {j.endTime}
              </TableCell>
              {showTeacher && (
                <TableCell>
                  {j.teacher?.profile?.fullName || j.teacher?.username}
                </TableCell>
              )}
              <TableCell>{j.class?.name}</TableCell>
              <TableCell>{j.subject?.name}</TableCell>
              <TableCell>{j.topic}</TableCell>
              <TableCell>
                {j.attachment ? (
                  <a
                    href={`http://localhost:5000${j.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs"
                  >
                    Unduh
                  </a>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="max-w-[200px] truncate" title={j.notes}>
                {j.notes || "-"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

function SaveIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export default JournalPage;
