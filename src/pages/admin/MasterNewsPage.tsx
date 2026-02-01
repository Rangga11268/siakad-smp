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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHoriz,
  EditPencil,
  Trash,
  SystemRestart,
  Journal,
  Calendar,
} from "iconoir-react";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface News {
  _id: string;
  title: string;
  category: string;
  author: {
    profile?: {
      fullName: string;
    };
  };
  createdAt: string;
  isPublished: boolean;
  thumbnail: string;
}

const MasterNewsPage = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: string;
    thumbnail: File | null;
  }>({
    title: "",
    content: "",
    category: "Berita",
    thumbnail: null,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Use isPublished=false/true filters if needed, or get all usually. Admin should see all.
      const res = await api.get("/news");
      setNewsList(res.data);
    } catch (error) {
      console.error("Gagal load berita", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data berita.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "Berita",
      thumbnail: null,
    });
    setEditingNews(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleOpenEdit = async (news: News) => {
    setEditingNews(news);
    // Fetch detail needed? Or just use what we have? Only basics. Ideally fetch full detail for content.
    try {
      const res = await api.get(`/news/${news._id}`); // Should be slug or ID
      const detail = res.data;
      setFormData({
        title: detail.title,
        content: detail.content,
        category: detail.category,
        thumbnail: null, // Don't prefill file input
      });
      setOpenDialog(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat detail berita.",
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Judul dan Konten wajib diisi.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("category", formData.category);
      if (formData.thumbnail) {
        data.append("thumbnail", formData.thumbnail);
      }

      if (editingNews) {
        await api.put(`/news/${editingNews._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({
          title: "Berhasil",
          description: "Berita berhasil diperbarui.",
        });
      } else {
        await api.post("/news", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({
          title: "Berhasil",
          description: "Berita baru berhasil diterbitkan.",
        });
      }

      setOpenDialog(false);
      resetForm();
      fetchNews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description:
          error.response?.data?.message || "Terjadi kesalahan saat menyimpan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus berita ini?")) return;

    try {
      await api.delete(`/news/${id}`);
      toast({
        title: "Berhasil",
        description: "Berita berhasil dihapus.",
      });
      fetchNews();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menghapus berita.",
      });
    }
  };

  const filteredNews = newsList.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            Manajemen Konten
          </h2>
          <p className="text-slate-500">
            Kelola berita, pengumuman, dan artikel sekolah.
          </p>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari Judul Berita..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={handleOpenCreate}
              className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> Buat Berita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-school-navy">
                {editingNews ? "Edit Berita" : "Tulis Berita Baru"}
              </DialogTitle>
              <DialogDescription>
                Isi formulir di bawah ini untuk memublikasikan konten baru.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Judul <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Judul Berita..."
                    className="bg-slate-50"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-school-navy">
                    Kategori
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData({ ...formData, category: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Berita">Berita</SelectItem>
                      <SelectItem value="Pengumuman">Pengumuman</SelectItem>
                      <SelectItem value="Prestasi">Prestasi</SelectItem>
                      <SelectItem value="Artikel">Artikel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-school-navy">
                  Thumbnail Gambar
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  className="bg-slate-50"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({
                        ...formData,
                        thumbnail: e.target.files[0],
                      });
                    }
                  }}
                />
                {editingNews &&
                  editingNews.thumbnail &&
                  !formData.thumbnail && (
                    <p className="text-xs text-slate-500">
                      Gambar saat ini:{" "}
                      <a
                        href={`http://localhost:5000${editingNews.thumbnail}`}
                        target="_blank"
                        className="text-blue-500 underline"
                      >
                        Lihat
                      </a>
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-school-navy">
                  Konten <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Tulis konten berita di sini..."
                  className="bg-slate-50 min-h-[200px]"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full font-bold"
              >
                {submitting ? (
                  <>
                    <SystemRestart className="mr-2 animate-spin" /> Menyimpan...
                  </>
                ) : editingNews ? (
                  "Simpan Perubahan"
                ) : (
                  "Terbitkan"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <CardTitle className="font-serif text-lg text-school-navy flex items-center gap-2">
            <Journal className="w-5 h-5 text-school-gold" /> Daftar Berita
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-school-navy">
              <TableRow className="hover:bg-school-navy">
                <TableHead className="text-white font-bold">Tanggal</TableHead>
                <TableHead className="text-white font-bold">Judul</TableHead>
                <TableHead className="text-white font-bold">Kategori</TableHead>
                <TableHead className="text-white font-bold">Penulis</TableHead>
                <TableHead className="text-white font-bold text-center">
                  Status
                </TableHead>
                <TableHead className="text-white font-bold text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <div className="flex flex-col items-center justify-center text-school-gold">
                      <SystemRestart className="h-6 w-6 animate-spin mb-2" />
                      <p className="text-sm text-slate-500">
                        Memuat data berita...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredNews.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-slate-500"
                  >
                    {searchQuery
                      ? "Berita tidak ditemukan."
                      : "Belum ada berita yang diterbitkan."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredNews.map((news) => (
                  <TableRow
                    key={news._id}
                    className="hover:bg-slate-50 border-b border-slate-100"
                  >
                    <TableCell className="text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(news.createdAt).toLocaleDateString("id-ID")}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-700">
                      {news.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-school-navy border-school-navy"
                      >
                        {news.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {news.author?.profile?.fullName || "Admin"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          news.isPublished
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-500 hover:bg-yellow-600"
                        }
                      >
                        {news.isPublished ? "Terbit" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHoriz className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(news)}
                            className="cursor-pointer"
                          >
                            <EditPencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(news._id)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterNewsPage;
