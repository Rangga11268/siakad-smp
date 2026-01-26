import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import { Calendar, User, Search, ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const NewsPage = () => {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Berita", "Pengumuman", "Prestasi", "Artikel"];

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, searchQuery]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params: any = { isPublished: true };
      if (selectedCategory !== "All") params.category = selectedCategory;
      // In a real app, backend should handle search. For now we might filter here or if backend supports it.
      // Assuming backend doesn't support search q yet based on my previous code, but let's assume I might add it or filter client side for now if needed.
      // But newsController.getAllNews used News.find(query).
      // I'll filter client side for search if the API doesn't support 'search' param yet,
      // OR I can quickly add search support to the controller.
      // For now, I'll just fetch by category and filter title client-side for simplicity unless list is huge.

      const res = await api.get("/news", { params });
      let data = res.data;

      if (searchQuery) {
        data = data.filter((n: any) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      setNewsList(data);
    } catch (error) {
      console.error("Failed to fetch news", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 md:pt-28 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-school-navy text-white py-12 md:py-20 mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Berita & Informasi
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg font-light">
            Dapatkan update terbaru mengenai kegiatan sekolah, prestasi siswa,
            dan pengumuman penting lainnya.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 mb-24">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full ${selectedCategory === cat ? "bg-school-navy text-school-gold hover:bg-school-navy/90" : "border-slate-300 text-slate-600"}`}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Input
              placeholder="Cari berita..."
              className="pl-10 bg-white border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Memuat berita...
          </div>
        ) : newsList.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-slate-100 italic">
            Tidak ada berita yang ditemukan.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {newsList.map((news) => (
              <div
                key={news._id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={
                      news.thumbnail
                        ? `http://localhost:5000${news.thumbnail}`
                        : "/img/AkademikIMG.webp"
                    }
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-school-gold text-school-navy hover:bg-school-gold font-bold">
                      {news.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-xs text-slate-400 mb-3 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {new Date(news.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1" />
                      {news.author?.profile?.fullName || "Admin"}
                    </div>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-school-navy mb-3 leading-snug group-hover:text-school-gold transition-colors line-clamp-2">
                    <Link to={`/news/${news.slug}`}>{news.title}</Link>
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {news.summary || news.content.substring(0, 100) + "..."}
                  </p>
                  <Link
                    to={`/news/${news.slug}`}
                    className="inline-flex items-center text-sm font-bold text-school-navy hover:text-school-gold transition-colors"
                  >
                    Baca Selengkapnya <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
