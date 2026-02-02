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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Page,
  Download,
  Search,
  Book,
  MediaVideo,
  BookStack,
  ClipboardCheck,
  Play,
  Link as LinkIcon,
  AppWindow,
  SystemRestart,
  Eye,
} from "iconoir-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface Material {
  _id: string;
  title: string;
  type: string;
  description: string;
  fileUrl?: string;
  externalUrl?: string;
  sourceType: string;
  subject: { _id: string; name: string };
  gradeLevel: string;
  teacher: { profile: { fullName: string } };
  createdAt: string;
}

const API_BASE = "http://localhost:5000";

const StudentMaterialPage = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/academic/subjects");
      setSubjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const userAny = user as any;
      const clsName = userAny?.profile?.class || "";

      // Extract grade level robustly
      let studentGrade = 0;
      const cleanClass = clsName.toUpperCase().trim();

      // Check VIII first (longest roman), then VII.
      // Also check specific numbers.
      if (cleanClass.includes("VIII") || cleanClass.includes("8")) {
        studentGrade = 8;
      } else if (cleanClass.includes("VII") || cleanClass.includes("7")) {
        studentGrade = 7;
      } else if (cleanClass.includes("IX") || cleanClass.includes("9")) {
        studentGrade = 9;
      }

      const params: any = {};
      if (studentGrade > 0) {
        params.gradeLevel = studentGrade;
      }

      if (searchQuery) params.search = searchQuery;
      if (selectedSubject && selectedSubject !== "all")
        params.subjectId = selectedSubject;
      if (selectedType && selectedType !== "all") params.type = selectedType;

      const res = await api.get("/learning-material", { params });
      setMaterials(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on filter change
  useEffect(() => {
    if (user) fetchMaterials();
  }, [user, selectedSubject, selectedType]);

  // Search debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (user) fetchMaterials();
    }, 500);
    return () => clearTimeout(handler);
  }, [user, searchQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Materi":
        return <Book className="w-5 h-5" />;
      case "Tugas":
        return <ClipboardCheck className="w-5 h-5" />;
      case "Latihan":
        return <BookStack className="w-5 h-5" />;
      case "Video":
        return <MediaVideo className="w-5 h-5" />;
      default:
        return <Page className="w-5 h-5" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      Materi: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Tugas: "bg-orange-100 text-orange-700 border-orange-200",
      Latihan: "bg-purple-100 text-purple-700 border-purple-200",
      Video: "bg-rose-100 text-rose-700 border-rose-200",
      Lainnya: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return styles[type] || styles.Lainnya;
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "youtube":
        return <Play className="w-4 h-4 text-red-500" />;
      case "link":
        return <LinkIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <Page className="w-4 h-4 text-slate-500" />;
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const getCardGradient = (type: string) => {
    switch (type) {
      case "Materi":
        return "from-emerald-500 to-teal-500";
      case "Tugas":
        return "from-orange-500 to-amber-500";
      case "Latihan":
        return "from-purple-500 to-violet-500";
      case "Video":
        return "from-rose-500 to-pink-500";
      default:
        return "from-slate-500 to-gray-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-school-navy via-blue-900 to-indigo-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('/img/pattern-grid.svg')] opacity-10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-school-gold/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur">
              <BookStack className="w-8 h-8 text-school-gold" />
            </div>
            Bahan Ajar & Modul
          </h1>
          <p className="text-white/70 text-lg">
            Akses materi pembelajaran, modul, tugas, dan video dari guru.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari judul materi..."
                className="pl-10 bg-slate-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-44 bg-slate-50">
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
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-36 bg-slate-50">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="Materi">📘 Materi</SelectItem>
                <SelectItem value="Tugas">📝 Tugas</SelectItem>
                <SelectItem value="Latihan">📋 Latihan</SelectItem>
                <SelectItem value="Video">🎬 Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <SystemRestart className="w-8 h-8 animate-spin text-school-gold" />
        </div>
      ) : materials.length === 0 ? (
        <Card className="border-none shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Book className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium">
              Belum ada materi pembelajaran.
            </p>
            <p className="text-sm">
              Materi akan muncul di sini setelah guru mengupload.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => (
            <Card
              key={m._id}
              className="border-none shadow-lg hover:shadow-xl transition-all group overflow-hidden cursor-pointer"
              onClick={() => setPreviewMaterial(m)}
            >
              {/* Top Gradient Bar */}
              <div
                className={`h-2 bg-gradient-to-r ${getCardGradient(m.type)}`}
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className={getTypeBadge(m.type)}>
                    {getTypeIcon(m.type)}
                    <span className="ml-1">{m.type}</span>
                  </Badge>
                  <div className="flex items-center gap-1 text-slate-400">
                    {getSourceIcon(m.sourceType)}
                  </div>
                </div>
                <CardTitle className="text-lg text-school-navy line-clamp-2 mt-2 group-hover:text-school-gold transition-colors">
                  {m.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {m.description || "Tidak ada deskripsi."}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">{m.subject?.name}</Badge>
                  <Badge variant="secondary">Kelas {m.gradeLevel}</Badge>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <p className="text-xs text-slate-400">
                    Oleh: {m.teacher?.profile?.fullName}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-school-navy border-school-navy hover:bg-school-navy hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewMaterial(m);
                    }}
                  >
                    <Eye className="mr-1 h-3 w-3" /> Lihat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Dialog
        open={!!previewMaterial}
        onOpenChange={() => setPreviewMaterial(null)}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-school-navy flex items-center gap-2">
              {previewMaterial && getTypeIcon(previewMaterial.type)}
              {previewMaterial?.title}
            </DialogTitle>
            <DialogDescription>
              {previewMaterial?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {previewMaterial?.sourceType === "youtube" &&
            previewMaterial?.externalUrl ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(previewMaterial.externalUrl) || ""}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : previewMaterial?.sourceType === "link" &&
              previewMaterial?.externalUrl ? (
              <div className="text-center py-8">
                <LinkIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">
                  Materi ini merupakan tautan eksternal.
                </p>
                <a
                  href={previewMaterial.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <AppWindow className="mr-2 h-4 w-4" /> Buka Link
                  </Button>
                </a>
              </div>
            ) : previewMaterial?.fileUrl ? (
              <div className="text-center py-8">
                <Page className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">
                  File: {previewMaterial.fileUrl.split("/").pop()}
                </p>
                <a
                  href={`${API_BASE}${previewMaterial.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy">
                    <Download className="mr-2 h-4 w-4" /> Unduh File
                  </Button>
                </a>
              </div>
            ) : null}
          </div>

          {/* Material Info */}
          <div className="border-t pt-4 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={getTypeBadge(previewMaterial?.type || "")}
            >
              {previewMaterial?.type}
            </Badge>
            <Badge variant="secondary">{previewMaterial?.subject?.name}</Badge>
            <Badge variant="secondary">
              Kelas {previewMaterial?.gradeLevel}
            </Badge>
            <span className="text-xs text-slate-400 ml-auto">
              Oleh: {previewMaterial?.teacher?.profile?.fullName}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentMaterialPage;
