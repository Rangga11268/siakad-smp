import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/services/api";
import {
  Calendar,
  User,
  ArrowLeft,
  ShareAndroid,
  Facebook,
  Twitter,
} from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";

const NewsDetailPage = () => {
  // Page Component for News Detail
  const { slug } = useParams();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchNewsDetail();
  }, [slug]);

  const fetchNewsDetail = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/news/${slug}`);
      setNews(res.data);
    } catch (error) {
      console.error("Failed to fetch news detail", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-6 max-w-4xl">
        <Skeleton className="w-24 h-6 mb-4" />
        <Skeleton className="w-full h-12 mb-6" />
        <Skeleton className="w-full h-[400px] rounded-xl mb-8" />
        <div className="space-y-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <h2 className="text-3xl font-serif font-bold text-school-navy mb-4">
          Berita Tidak Ditemukan
        </h2>
        <p className="text-slate-500 mb-8">
          Halaman yang Anda cari mungkin telah dihapus atau URL salah.
        </p>
        <Link to="/news">
          <Button>Kembali ke Berita</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link
          to="/news"
          className="inline-flex items-center text-slate-500 hover:text-school-navy mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Berita
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <Badge className="bg-school-navy text-school-gold hover:bg-school-navy">
              {news.category}
            </Badge>
            <div className="flex items-center text-sm text-slate-500">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(news.createdAt).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center text-sm text-slate-500">
              <User className="w-4 h-4 mr-1" />
              {news.author?.profile?.fullName || "Admin"}
            </div>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-school-navy leading-tight mb-6">
            {news.title}
          </h1>
        </div>

        {/* Featured Image */}
        <div className="rounded-2xl overflow-hidden shadow-lg mb-10 aspect-video">
          <img
            src={
              news.thumbnail
                ? `http://localhost:5000${news.thumbnail}`
                : "/img/AkademikIMG.webp"
            }
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <article className="prose prose-lg prose-slate max-w-none mb-12">
          {/* Simple whitespace handling for now. Rich text renderer would be better if using WYSIWYG */}
          <div
            dangerouslySetInnerHTML={{
              __html: news.content.replace(/\n/g, "<br />"),
            }}
          />
        </article>

        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-bold text-school-navy">
            Bagikan artikel ini:
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:text-blue-600 hover:border-blue-600"
            >
              <Facebook className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:text-sky-500 hover:border-sky-500"
            >
              <Twitter className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:text-green-600 hover:border-green-600"
            >
              <ShareAndroid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
