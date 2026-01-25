import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
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
  Book,
  Refresh,
  Plus,
  Search,
  BookStack,
  SystemRestart,
  ArrowRight,
} from "iconoir-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const LibraryDashboard = () => {
  const { user } = useAuth();
  // const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [students, setStudents] = useState([]); // For borrowing
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dialogs
  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [openLoanDialog, setOpenLoanDialog] = useState(false);

  // Forms
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    publisher: "",
    category: "Fiksi",
    stock: "1",
    location: "",
    pdfUrl: "",
    synopsis: "",
    coverImage: "",
  });

  const [loanForm, setLoanForm] = useState({
    studentId: "",
    bookId: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchData();
      if (user.role !== "student") {
        fetchStudents();
      }
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const isStudent = user?.role === "student";
      const loansEndpoint = isStudent ? "/library/my-loans" : "/library/loans";

      const [resBooks, resLoans] = await Promise.all([
        api.get("/library/books"),
        api.get(loansEndpoint),
      ]);
      setBooks(resBooks.data);
      setLoans(resLoans.data);
    } catch (error) {
      console.error("Gagal load data perpustakaan", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/academic/students");
      setStudents(res.data);
    } catch (error) {
      console.error("Gagal load siswa", error);
    }
  };

  const handleAddBook = async () => {
    if (!bookForm.title || !bookForm.author) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Judul dan Penulis buku wajib diisi.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/library/books", {
        ...bookForm,
        stock: parseInt(bookForm.stock),
        year: 2024, // default
      });
      setOpenBookDialog(false);
      setBookForm({
        title: "",
        author: "",
        publisher: "",
        category: "Fiksi",
        stock: "1",
        location: "",
        pdfUrl: "",
        synopsis: "",
        coverImage: "",
      });
      fetchData();
      toast({
        title: "Berhasil",
        description: "Buku baru ditambahkan ke katalog.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal tambah buku.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBorrow = async () => {
    if (!loanForm.studentId || !loanForm.bookId) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Pilih siswa dan buku yang dipinjam.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/library/borrow", loanForm);
      setOpenLoanDialog(false);
      setLoanForm({ studentId: "", bookId: "" });
      fetchData();
      toast({
        title: "Peminjaman Berhasil",
        description: "Buku berhasil dipinjam.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Stok buku habis atau siswa masih meminjam.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (loanId: string) => {
    try {
      await api.post("/library/return", { loanId });
      fetchData();
      toast({
        title: "Pengembalian Berhasil",
        description: "Buku telah dikembalikan ke stok.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal kembalikan buku.",
      });
    }
  };

  const submitQuickBorrow = async (bookId: string) => {
    if (!user) return;
    const confirm = window.confirm(
      "Apakah Anda yakin ingin mengajukan peminjaman buku ini? Silakan ambil buku di perpustakaan setelah disetujui.",
    );
    if (!confirm) return;

    setSubmitting(true);
    try {
      const currentUser = user as any;
      await api.post("/library/borrow", {
        studentId: currentUser.id || currentUser._id,
        bookId: bookId,
      });
      fetchData();
      toast({
        title: "Pengajuan Berhasil",
        description: "Silakan tunggu konfirmasi dari petugas perpustakaan.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.message || "Gagal meminjam buku.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (loanId: string) => {
    try {
      await api.post("/library/approve", { loanId });
      fetchData();
      toast({ title: "Berhasil", description: "Peminjaman disetujui." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menyetujui.",
      });
    }
  };

  const handleReject = async (loanId: string) => {
    if (!window.confirm("Tolak peminjaman ini?")) return;
    try {
      await api.post("/library/reject", { loanId });
      fetchData();
      toast({ title: "Berhasil", description: "Peminjaman ditolak." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menolak.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-school-navy">
            E-Library & Literasi
          </h2>
          <p className="text-slate-500">
            Katalog buku digital, manajemen stok, dan sirkulasi peminjaman.
          </p>
        </div>
      </div>

      <Tabs defaultValue="books" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger
            value="books"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white px-6"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Katalog Buku
          </TabsTrigger>
          <TabsTrigger
            value="loans"
            className="data-[state=active]:bg-school-navy data-[state=active]:text-white px-6"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Sirkulasi
          </TabsTrigger>
          {user?.role !== "student" && (
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-school-navy data-[state=active]:text-white px-6"
            >
              <BookStack className="mr-2 h-4 w-4" />
              Permintaan
              {loans.filter((l: any) => l.status === "Pending").length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] animate-pulse"
                >
                  {loans.filter((l: any) => l.status === "Pending").length}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="books" className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 w-full max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari Judul / Penulis..."
                  className="pl-9 bg-slate-50 border-slate-200"
                />
              </div>
            </div>
            {user?.role !== "student" && (
              <Dialog open={openBookDialog} onOpenChange={setOpenBookDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold shadow-md transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Koleksi Buku
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-school-navy">
                      Tambah Koleksi Buku
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Judul Buku
                        </Label>
                        <Input
                          value={bookForm.title}
                          onChange={(e) =>
                            setBookForm({ ...bookForm, title: e.target.value })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Penulis
                        </Label>
                        <Input
                          value={bookForm.author}
                          onChange={(e) =>
                            setBookForm({ ...bookForm, author: e.target.value })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Kategori
                        </Label>
                        <Select
                          value={bookForm.category}
                          onValueChange={(v) =>
                            setBookForm({ ...bookForm, category: v })
                          }
                        >
                          <SelectTrigger className="bg-slate-50">
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fiksi">Fiksi / Novel</SelectItem>
                            <SelectItem value="Pelajaran">
                              Buku Pelajaran
                            </SelectItem>
                            <SelectItem value="Sains">
                              Sains & Teknologi
                            </SelectItem>
                            <SelectItem value="Sejarah">Sejarah</SelectItem>
                            <SelectItem value="Agama">Agama</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Stok
                        </Label>
                        <Input
                          type="number"
                          value={bookForm.stock}
                          onChange={(e) =>
                            setBookForm({ ...bookForm, stock: e.target.value })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold text-school-navy">
                        Cover Buku (Image)
                      </Label>
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setBookForm({
                                    ...bookForm,
                                    coverImage: reader.result as string,
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="cursor-pointer file:bg-school-navy file:text-white file:border-0 file:rounded-md file:px-2 file:text-sm hover:file:bg-school-gold hover:file:text-school-navy transition-all"
                          />
                        </div>
                        {bookForm.coverImage && (
                          <img
                            src={bookForm.coverImage}
                            alt="Preview"
                            className="h-20 w-16 object-cover rounded shadow-sm border"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleAddBook}
                      disabled={submitting}
                      className="bg-school-navy hover:bg-school-gold hover:text-school-navy w-full font-bold"
                    >
                      {submitting ? (
                        <>
                          <SystemRestart className="mr-2 animate-spin" />{" "}
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Buku"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {loading ? (
              <div className="col-span-full h-40 flex items-center justify-center text-school-gold">
                <SystemRestart className="w-8 h-8 animate-spin" />
              </div>
            ) : books.length === 0 ? (
              <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-400">
                <BookStack className="w-12 h-12 mb-2 opacity-20" />
                <p>Belum ada koleksi buku.</p>
              </div>
            ) : (
              books.map((book: any) => (
                <Card
                  key={book._id}
                  className="flex flex-col h-full border-none shadow-md hover:shadow-xl transition-shadow bg-white overflow-hidden group"
                >
                  <div className="aspect-[2/3] w-full bg-slate-100 relative overflow-hidden">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/400x600/1e293b/FFF?text=No+Cover";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-200 text-slate-400">
                        <Book className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={`${book.available > 0 ? "bg-green-600" : "bg-red-600"} shadow-sm`}
                      >
                        {book.available > 0 ? "Tersedia" : "Habis"}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h4
                        className="font-bold text-school-navy line-clamp-2 leading-tight mb-1"
                        title={book.title}
                      >
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-2">
                        {book.author}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs border-school-navy text-school-navy mb-3"
                      >
                        {book.category}
                      </Badge>
                      {book.synopsis && (
                        <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                          {book.synopsis}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto pt-4 flex gap-2 w-full">
                      {book.pdfUrl ? (
                        <Button
                          className="flex-1 bg-school-navy hover:bg-school-gold hover:text-school-navy"
                          size="sm"
                          onClick={() => window.open(book.pdfUrl, "_blank")}
                        >
                          Baca PDF
                        </Button>
                      ) : (
                        <Button
                          className="flex-1 bg-slate-100 text-slate-400 hover:bg-slate-200"
                          size="sm"
                          disabled
                        >
                          Fisik Only
                        </Button>
                      )}

                      {user?.role === "student" &&
                        book.available > 0 &&
                        !book.pdfUrl && (
                          <Button
                            className="flex-1 border-school-navy text-school-navy hover:bg-school-navy hover:text-white"
                            variant="outline"
                            size="sm"
                            onClick={() => submitQuickBorrow(book._id)}
                            disabled={submitting}
                          >
                            Pinjam
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-4">
          {/* Circulation Table with Navy Header */}
          <Card className="border-t-4 border-t-school-gold shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-serif text-lg text-school-navy">
                  Riwayat Sirkulasi
                </CardTitle>
              </div>
              {user?.role !== "student" && (
                <Dialog open={openLoanDialog} onOpenChange={setOpenLoanDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold">
                      <Plus className="mr-2 h-4 w-4" /> Input Peminjaman
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-serif text-2xl text-school-navy">
                        Form Peminjaman Manual
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Siswa Peminjam
                        </Label>
                        <Select
                          onValueChange={(v) =>
                            setLoanForm({ ...loanForm, studentId: v })
                          }
                        >
                          <SelectTrigger className="bg-slate-50">
                            <SelectValue placeholder="Pilih Siswa" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((s: any) => (
                              <SelectItem key={s._id} value={s._id}>
                                {s.profile?.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold text-school-navy">
                          Buku
                        </Label>
                        <Select
                          onValueChange={(v) =>
                            setLoanForm({ ...loanForm, bookId: v })
                          }
                        >
                          <SelectTrigger className="bg-slate-50">
                            <SelectValue placeholder="Pilih Buku dari Katalog" />
                          </SelectTrigger>
                          <SelectContent>
                            {books
                              .filter((b: any) => b.available > 0)
                              .map((b: any) => (
                                <SelectItem key={b._id} value={b._id}>
                                  {b.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleBorrow}
                        disabled={submitting}
                        className="w-full bg-school-navy hover:bg-school-gold hover:text-school-navy font-bold"
                      >
                        Proses Peminjaman
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-school-navy">
                  <TableRow className="hover:bg-school-navy">
                    <TableHead className="text-white font-bold">
                      Tanggal Pinjam
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Peminjam
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Judul Buku
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Jatuh Tempo
                    </TableHead>
                    <TableHead className="text-white font-bold text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-white font-bold text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan: any) => (
                    <TableRow
                      key={loan._id}
                      className="hover:bg-slate-50 border-b border-slate-100"
                    >
                      <TableCell>
                        {new Date(loan.borrowDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-bold text-school-navy">
                        {loan.student?.profile?.fullName}
                      </TableCell>
                      <TableCell className="font-medium">
                        {loan.book?.title}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            loan.status === "Returned"
                              ? "secondary"
                              : loan.status === "Overdue" ||
                                  loan.status === "Rejected"
                                ? "destructive"
                                : loan.status === "Pending"
                                  ? "outline"
                                  : "default"
                          }
                          className={
                            loan.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : loan.status === "Returned"
                                ? "bg-slate-200 text-slate-600"
                                : ""
                          }
                        >
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {loan.status === "Borrowed" &&
                          user?.role !== "student" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-green-600 text-green-600 hover:bg-green-50"
                              onClick={() => handleReturn(loan._id)}
                            >
                              <Refresh className="w-3 h-3 mr-1" /> Kembalikan
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {loans.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center h-24 text-slate-500"
                      >
                        Belum ada data sirkulasi.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="font-serif text-lg text-school-navy">
                Permintaan Peminjaman Online
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-school-navy">
                  <TableRow className="hover:bg-school-navy">
                    <TableHead className="text-white font-bold">
                      Tanggal Request
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      Siswa
                    </TableHead>
                    <TableHead className="text-white font-bold">Buku</TableHead>
                    <TableHead className="text-white font-bold text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.filter((l: any) => l.status === "Pending").length ===
                  0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Tidak ada permintaan baru.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loans
                      .filter((l: any) => l.status === "Pending")
                      .map((loan: any) => (
                        <TableRow
                          key={loan._id}
                          className="hover:bg-slate-50 border-b border-slate-100"
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {new Date(loan.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(loan.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-school-navy">
                            {loan.student?.profile?.fullName}
                          </TableCell>
                          <TableCell>{loan.book?.title}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 h-8"
                                onClick={() => handleApprove(loan._id)}
                              >
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8"
                                onClick={() => handleReject(loan._id)}
                              >
                                Tolak
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LibraryDashboard;
