import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { BookOpen, RefreshCw, Plus, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const LibraryDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("books");
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
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Gagal memuat data perpustakaan. Pastikan Anda memiliki akses.",
      });
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
    // Direct borrow for logged in student
    if (!user) return;

    const confirm = window.confirm(
      "Apakah Anda yakin ingin mengajukan peminjaman buku ini? Silakan ambil buku di perpustakaan setelah disetujui."
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          E-Library & Literasi
        </h2>
        <p className="text-muted-foreground">
          Katalog buku digital dan sirkulasi peminjaman.
        </p>
      </div>

      <Tabs
        defaultValue="books"
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="books">
            <BookOpen className="mr-2 h-4 w-4" />
            Katalog Buku
          </TabsTrigger>
          <TabsTrigger value="loans">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sirkulasi
          </TabsTrigger>
          {user?.role !== "student" && (
            <TabsTrigger value="requests">
              <RefreshCw className="mr-2 h-4 w-4" />
              Permintaan
              {loans.filter((l: any) => l.status === "Pending").length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]"
                >
                  {loans.filter((l: any) => l.status === "Pending").length}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="books" className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari Judul / Penulis..."
                className="max-w-[300px]"
              />
            </div>
            {user?.role !== "student" && (
              <Dialog open={openBookDialog} onOpenChange={setOpenBookDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-sky-600 hover:bg-sky-700">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Buku
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Koleksi Buku</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Judul</Label>
                      <Input
                        className="col-span-3"
                        value={bookForm.title}
                        onChange={(e) =>
                          setBookForm({ ...bookForm, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Penulis</Label>
                      <Input
                        className="col-span-3"
                        value={bookForm.author}
                        onChange={(e) =>
                          setBookForm({ ...bookForm, author: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Kategori</Label>
                      <Select
                        value={bookForm.category}
                        onValueChange={(v) =>
                          setBookForm({ ...bookForm, category: v })
                        }
                      >
                        <SelectTrigger className="col-span-3">
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Stok</Label>
                      <Input
                        type="number"
                        className="col-span-3"
                        value={bookForm.stock}
                        onChange={(e) =>
                          setBookForm({ ...bookForm, stock: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Cover Buku</Label>
                      <div className="col-span-3">
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
                        />
                        {bookForm.coverImage && (
                          <img
                            src={bookForm.coverImage}
                            alt="Preview"
                            className="mt-2 h-20 w-auto object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddBook} disabled={submitting}>
                      Simpan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {books.map((book: any) => (
              <Card key={book._id} className="flex flex-col h-full">
                <CardContent className="p-4 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <div className="aspect-[2/3] w-full bg-gray-100 mb-4 rounded-md overflow-hidden relative group">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/400x600?text=No+Cover";
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-200 text-gray-400">
                          <BookOpen className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <h4
                      className="font-semibold line-clamp-1"
                      title={book.title}
                    >
                      {book.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {book.author}
                    </p>
                    {book.synopsis && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                        {book.synopsis}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{book.category}</Badge>
                      <span
                        className={
                          book.available > 0
                            ? "text-xs text-green-600 font-bold"
                            : "text-xs text-red-600 font-bold"
                        }
                      >
                        {book.available > 0 ? "Ada" : "Habis"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {book.pdfUrl ? (
                      <Button
                        className="w-full"
                        variant="default"
                        size="sm"
                        onClick={() => window.open(book.pdfUrl, "_blank")}
                      >
                        Baca
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant="secondary"
                        size="sm"
                        disabled
                      >
                        Fisik
                      </Button>
                    )}

                    {user?.role === "student" &&
                      book.available > 0 &&
                      !book.pdfUrl && (
                        <Button
                          className="w-full"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLoanForm({
                              studentId: (user as any).id || (user as any)._id,
                              bookId: book._id,
                            });
                            handleBorrow();
                            submitQuickBorrow(book._id);
                          }}
                        >
                          Ajukan
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Sirkulasi Peminjaman</h3>
            {user?.role !== "student" && (
              <Dialog open={openLoanDialog} onOpenChange={setOpenLoanDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-sky-600 hover:bg-sky-700">
                    <Plus className="mr-2 h-4 w-4" /> Pinjam Buku
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Form Peminjaman</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Siswa</Label>
                      <Select
                        onValueChange={(v) =>
                          setLoanForm({ ...loanForm, studentId: v })
                        }
                      >
                        <SelectTrigger className="col-span-3">
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Buku</Label>
                      <Select
                        onValueChange={(v) =>
                          setLoanForm({ ...loanForm, bookId: v })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Pilih Buku" />
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
                    <Button onClick={handleBorrow} disabled={submitting}>
                      Simpan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal Pinjam</TableHead>
                    <TableHead>Peminjam</TableHead>
                    <TableHead>Judul Buku</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan: any) => (
                    <TableRow key={loan._id}>
                      <TableCell>
                        {new Date(loan.borrowDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {loan.student?.profile?.fullName}
                      </TableCell>
                      <TableCell>{loan.book?.title}</TableCell>
                      <TableCell>
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            loan.status === "Returned"
                              ? "secondary"
                              : loan.status === "Overdue" ||
                                loan.status === "Rejected"
                              ? "destructive"
                              : loan.status === "Pending"
                              ? "secondary" // Or yellow if available, secondary is grey usually
                              : "outline"
                          }
                          className={
                            loan.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : ""
                          }
                        >
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {loan.status === "Borrowed" &&
                          user?.role !== "student" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600"
                              onClick={() => handleReturn(loan._id)}
                            >
                              Kembalikan
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal Request</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Buku</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.filter((l: any) => l.status === "Pending").length ===
                  0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-4 text-muted-foreground"
                      >
                        Tidak ada permintaan peminjaman baru.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loans
                      .filter((l: any) => l.status === "Pending")
                      .map((loan: any) => (
                        <TableRow key={loan._id}>
                          <TableCell>
                            {new Date(loan.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {loan.student?.profile?.fullName}
                          </TableCell>
                          <TableCell>{loan.book?.title}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(loan._id)}
                            >
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(loan._id)}
                            >
                              Tolak
                            </Button>
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
