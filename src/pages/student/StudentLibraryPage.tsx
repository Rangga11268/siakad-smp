import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  BookStack,
  Book,
  User as UserIcon,
  Calendar,
  Clock,
  ScanBarcode,
  CheckCircle,
  OpenBook,
  WarningTriangle,
} from "iconoir-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const StudentLibraryPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  // Detail Dialog State
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  useEffect(() => {
    fetchBooks();
    fetchMyLoans();
  }, []);

  useEffect(() => {
    let result = books;

    // Filter by Search Term
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(lower) ||
          b.author.toLowerCase().includes(lower),
      );
    }

    // Filter by Category
    if (selectedCategory !== "Semua") {
      result = result.filter((b) => b.category === selectedCategory);
    }

    setFilteredBooks(result);
  }, [searchQuery, selectedCategory, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/library/books");
      setBooks(res.data);
      setFilteredBooks(res.data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal memuat katalog buku.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyLoans = async () => {
    try {
      setLoadingLoans(true);
      const res = await api.get("/library/my-loans");
      setMyLoans(res.data);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal memuat data peminjaman.",
      });
    } finally {
      setLoadingLoans(false);
    }
  };

  const handleBorrow = async (bookId: string, bookTitle: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Anda harus login untuk meminjam buku.",
      });
      return;
    }
    setLoadingAction(true);
    try {
      await api.post("/library/borrow", { bookId });
      toast({
        title: "Berhasil",
        description: `Permintaan peminjaman "${bookTitle}" berhasil diajukan!`,
      });
      // Refresh data
      fetchBooks();
      fetchMyLoans();
      setSelectedBook(null); // Close dialog if open
    } catch (error: any) {
      console.error("Failed to borrow book:", error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal mengajukan peminjaman.",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Decoration */}
      <div className="bg-school-navy h-48 w-full absolute top-0 left-0 z-0 rounded-b-[40px] shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-school-gold/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-8 max-w-6xl">
        {/* Profile Header Card */}
        <div className="flex flex-col md:flex-row gap-6 items-end mb-10">
          <Card className="flex-1 border-none shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200">
                  <img
                    src={
                      // @ts-ignore
                      user?.profile?.photo ||
                      `https://ui-avatars.com/api/?name=${user?.username}&background=0D47A1&color=fff`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-serif font-bold text-school-navy mb-1">
                  Halo,{" "}
                  {
                    // @ts-ignore
                    user?.profile?.fullName || user?.username
                  }
                  ! 👋
                </h1>
                <p className="text-slate-500 mb-3">
                  Anggota Perpustakaan •{" "}
                  <span className="font-mono text-school-gold font-bold">
                    ID:{" "}
                    {
                      // @ts-ignore
                      user?.profile?.nisn || user?._id?.substring(0, 8)
                    }
                  </span>
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Badge className="bg-school-navy/10 text-school-navy hover:bg-school-navy/20">
                    <Book className="w-3 h-3 mr-1" /> Pelajar Aktif
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" /> Bebas Pustaka
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="w-full md:w-64 border-none shadow-lg bg-school-gold text-school-navy overflow-hidden relative group cursor-pointer hover:-translate-y-1 transition-transform">
            <div className="absolute -right-4 -top-4 bg-white/20 w-24 h-24 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
            <CardContent className="p-6 relative">
              <p className="text-sm font-semibold opacity-80 mb-1">
                Buku Dipinjam
              </p>
              <div className="flex items-end justify-between">
                <h3 className="text-4xl font-bold">
                  {
                    myLoans.filter(
                      (l: any) =>
                        l.status === "Borrowed" || l.status === "Pending",
                    ).length
                  }
                </h3>
                <BookStack className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="catalog" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-full shadow-sm border border-slate-100 w-full sm:w-auto overflow-x-auto justify-start">
            <TabsTrigger
              value="catalog"
              className="rounded-full px-6 data-[state=active]:bg-school-navy data-[state=active]:text-white transition-all"
            >
              <Search className="w-4 h-4 mr-2" />
              Katalog Buku
            </TabsTrigger>
            <TabsTrigger
              value="my-loans"
              className="rounded-full px-6 data-[state=active]:bg-school-navy data-[state=active]:text-white transition-all"
            >
              <BookStack className="w-4 h-4 mr-2" />
              Peminjaman Saya
              {myLoans.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white h-5 px-1.5 rounded-full text-[10px]">
                  {myLoans.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="catalog"
            className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"
          >
            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Cari judul buku, penulis, atau kategori..."
                  className="pl-10 bg-slate-50 border-slate-200 rounded-xl focus:ring-school-navy"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                {["Semua", "Fiksi", "Pelajaran", "Sains"].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg ${selectedCategory === cat ? "bg-school-navy text-white" : "text-slate-500 hover:text-school-navy"}`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Book Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {loading ? (
                // Skeletons
                [...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
                    <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
                  </div>
                ))
              ) : filteredBooks.length === 0 ? (
                <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-400">
                  <Search className="w-12 h-12 mb-2 opacity-20" />
                  <p>Buku tidak ditemukan.</p>
                </div>
              ) : (
                filteredBooks.map((book: any) => (
                  <div
                    key={book._id}
                    className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                  >
                    <div
                      className="aspect-[2/3] bg-slate-100 relative overflow-hidden cursor-pointer"
                      onClick={() => setSelectedBook(book)}
                    >
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-school-navy/5 text-school-navy/30">
                          <Book className="w-12 h-12" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <span className="text-white text-xs font-bold bg-school-gold px-2 py-1 rounded-md self-start mb-2 backdrop-blur-sm">
                          Lihat Detail
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge
                          className={`${
                            book.available > 0
                              ? "bg-green-500/90 text-white"
                              : "bg-red-500/90 text-white"
                          } backdrop-blur-sm border-none shadow-sm`}
                        >
                          {book.available > 0 ? "Tersedia" : "Habis"}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <div className="mb-2">
                        <Badge
                          variant="outline"
                          className="mb-2 text-[10px] text-school-navy border-school-navy/20"
                        >
                          {book.category}
                        </Badge>
                        <h3
                          className="font-bold text-school-navy leading-tight line-clamp-2 mb-1 group-hover:text-school-gold transition-colors"
                          title={book.title}
                        >
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {book.author}
                        </p>
                      </div>

                      <div className="mt-auto pt-3 border-t border-slate-50">
                        {book.pdfUrl ? (
                          <Button
                            className="w-full bg-school-navy hover:bg-school-gold hover:text-school-navy text-xs h-8 shadow-sm"
                            onClick={() => window.open(book.pdfUrl, "_blank")}
                          >
                            Baca E-Book
                          </Button>
                        ) : book.available > 0 ? (
                          <div className="flex gap-2 w-full">
                            <Button
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-school-navy text-xs h-8 border border-slate-200"
                              variant="ghost"
                              onClick={() => setSelectedBook(book)}
                            >
                              Detail
                            </Button>
                            <Button
                              className="flex-1 bg-school-navy hover:bg-school-gold hover:text-school-navy text-xs h-8 shadow-sm"
                              onClick={() => handleBorrow(book._id, book.title)}
                              disabled={loadingAction}
                            >
                              Pinjam
                            </Button>
                          </div>
                        ) : (
                          <Button
                            disabled
                            className="w-full h-8 text-xs bg-slate-100 text-slate-400"
                          >
                            Stok Habis
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="my-loans"
            className="animate-in slide-in-from-right-4 duration-500"
          >
            {myLoans.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <BookStack className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-school-navy mb-2">
                  Belum Ada Peminjaman
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Anda belum meminjam buku apapun. Yuk mulai eksplorasi katalog
                  buku kami dan temukan bacaan menarik!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myLoans.map((loan: any) => (
                  <div
                    key={loan._id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4 hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div
                      className={`absolute top-0 left-0 w-1 h-full ${
                        loan.status === "Returned"
                          ? "bg-slate-300"
                          : loan.status === "Overdue"
                            ? "bg-red-500"
                            : loan.status === "Pending"
                              ? "bg-yellow-400"
                              : "bg-green-500"
                      }`}
                    />

                    <div className="w-24 h-32 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden shadow-sm">
                      {loan.book?.coverImage ? (
                        <img
                          src={loan.book.coverImage}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Book className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 py-1">
                      <div className="flex justify-between items-start mb-1">
                        <Badge
                          className={`
                                ${
                                  loan.status === "Returned"
                                    ? "bg-slate-100 text-slate-600"
                                    : loan.status === "Overdue"
                                      ? "bg-red-100 text-red-700"
                                      : loan.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                }
                                border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                            `}
                        >
                          {loan.status === "Pending"
                            ? "Menunggu Persetujuan"
                            : loan.status === "Borrowed"
                              ? "Sedang Dipinjam"
                              : loan.status === "Overdue"
                                ? "Terlambat"
                                : loan.status}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-lg text-school-navy leading-tight mb-3 line-clamp-2">
                        {loan.book?.title || "Judul Buku"}
                      </h3>

                      <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>
                            Pinjam:{" "}
                            <span className="font-semibold text-school-navy">
                              {new Date(loan.borrowDate).toLocaleDateString(
                                "id-ID",
                                { day: "numeric", month: "short" },
                              )}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>
                            Kembali:{" "}
                            <span
                              className={`font-semibold ${new Date(loan.dueDate) < new Date() && loan.status !== "Returned" ? "text-red-500" : "text-school-navy"}`}
                            >
                              {new Date(loan.dueDate).toLocaleDateString(
                                "id-ID",
                                { day: "numeric", month: "short" },
                              )}
                            </span>
                          </span>
                        </div>
                      </div>

                      {loan.status === "Overdue" && (
                        <div className="mt-3 bg-red-50 text-red-600 text-xs p-2 rounded-lg flex items-center gap-2">
                          <WarningTriangle className="w-4 h-4" />
                          <span>Denda keterlambatan berlaku.</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Book Detail Dialog */}
      <Dialog
        open={!!selectedBook}
        onOpenChange={(open) => !open && setSelectedBook(null)}
      >
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-none shadow-2xl">
          {selectedBook && (
            <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
              {/* Cover Section */}
              <div className="w-full md:w-2/5 bg-slate-100 relative min-h-[300px]">
                {selectedBook.coverImage ? (
                  <img
                    src={selectedBook.coverImage}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Book className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 backdrop-blur shadow-sm text-school-navy font-bold"
                  >
                    {selectedBook.category}
                  </Badge>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-serif font-bold text-school-navy leading-tight mb-2">
                    {selectedBook.title}
                  </DialogTitle>
                  <p className="text-slate-500 font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-school-gold/20 text-school-navy flex items-center justify-center text-xs">
                      A
                    </span>
                    {selectedBook.author}
                  </p>
                </DialogHeader>

                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex gap-4 text-sm border-y border-slate-100 py-3">
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">
                        Stok Tersedia
                      </p>
                      <p className="font-bold text-green-600 text-lg">
                        {selectedBook.available}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          buku
                        </span>
                      </p>
                    </div>
                    <div className="w-px bg-slate-100" />
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">
                        Tahun Terbit
                      </p>
                      <p className="font-bold text-school-navy text-lg">
                        {selectedBook.year || "-"}
                      </p>
                    </div>
                    <div className="w-px bg-slate-100" />
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">
                        Lokasi Rak
                      </p>
                      <p className="font-bold text-school-navy text-lg">
                        {selectedBook.location || "Umum"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-school-navy mb-2 text-sm uppercase tracking-wide">
                      Sinopsis
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-sm text-justify">
                      {selectedBook.synopsis ||
                        "Tidak ada deskripsi untuk buku ini."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 mt-auto border-t border-slate-50">
                  {selectedBook.pdfUrl ? (
                    <Button
                      className="flex-1 bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold h-12"
                      onClick={() => window.open(selectedBook.pdfUrl, "_blank")}
                    >
                      <OpenBook className="mr-2 w-5 h-5" /> Baca Sekarang
                    </Button>
                  ) : selectedBook.available > 0 ? (
                    <Button
                      className="flex-1 bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold h-12 shadow-lg shadow-school-navy/20"
                      onClick={() => {
                        handleBorrow(selectedBook._id, selectedBook.title);
                      }}
                      disabled={loadingAction}
                    >
                      <BookStack className="mr-2 w-5 h-5" /> Pinjam Buku Ini
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="flex-1 bg-slate-100 text-slate-400 font-bold h-12"
                    >
                      Stok Habis
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentLibraryPage;
