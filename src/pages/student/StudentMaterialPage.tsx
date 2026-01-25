import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Page, Download, Search, Book, VideoCamera } from "iconoir-react";
import api from "@/services/api";

const StudentMaterialPage = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSubjects();
    fetchMaterials();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/academic/subject");
      setSubjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get("/learning-material");
      setMaterials(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchSubject =
      selectedSubject === "all" || m.subject?._id === selectedSubject;
    const matchSearch = m.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  const getIcon = (type: string) => {
    if (type === "Video")
      return <VideoCamera className="h-6 w-6 text-red-500" />;
    return <Page className="h-6 w-6 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Bahan Ajar & Modul
        </h2>
        <p className="text-muted-foreground">
          Akses materi pembelajaran yang diupload oleh guru.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <Label>Cari Materi</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Judul materi..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="md:w-1/3">
          <Label>Mata Pelajaran</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Mapel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Mapel</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Loading...</p>
        ) : filteredMaterials.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-slate-50 border border-dashed rounded-lg text-muted-foreground">
            Belum ada materi yang tersedia.
          </div>
        ) : (
          filteredMaterials.map((m) => (
            <Card key={m._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg h-fit">
                    {getIcon(m.type)}
                  </div>
                  <div>
                    <CardTitle
                      className="text-base font-semibold line-clamp-1"
                      title={m.title}
                    >
                      {m.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {m.subject?.name} • Kelas {m.gradeLevel}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                  {m.description || "Tidak ada deskripsi."}
                </p>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Oleh: {m.teacher?.profile?.fullName}
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={`http://localhost:5000${m.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-3 w-4" /> Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentMaterialPage;
