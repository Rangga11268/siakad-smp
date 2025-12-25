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
import { BookOpen, RefreshCw, Plus, Search } from "lucide-react";
import api from "@/services/api";

const LibraryDashboard = () => {
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
  });

  const [loanForm, setLoanForm] = useState({
    studentId: "",
    bookId: "",
  });

  useEffect(() => {
    fetchData();
    fetchStudents();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resBooks, resLoans] = await Promise.all([
        api.get("/library/books"),
        api.get("/library/loans"),
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
      const res = await api.get("/academic/students/level/7"); // MVP
      setStudents(res.data);
    } catch (error) {
      console.error("Gagal load siswa", error);
    }
  };

  const handleAddBook = async () => {
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
      });
      fetchData();
    } catch (error) {
      alert("Gagal tambah buku");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBorrow = async () => {
    setSubmitting(true);
    try {
      await api.post("/library/borrow", loanForm);
      setOpenLoanDialog(false);
      setLoanForm({ studentId: "", bookId: "" });
      fetchData();
    } catch (error) {
      alert("Gagal pinjam buku: Stok habis atau error lain");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (loanId: string) => {
    if (!confirm("Konfirmasi pengembalian buku?")) return;
    try {
      await api.post("/library/return", { loanId });
      fetchData();
    } catch (error) {
      alert("Gagal mengembalikan buku");
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
                        <SelectItem value="Sains">Sains & Teknologi</SelectItem>
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
                    <Label className="text-right">Rak/Lokasi</Label>
                    <Input
                      className="col-span-3"
                      value={bookForm.location}
                      onChange={(e) =>
                        setBookForm({ ...bookForm, location: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddBook} disabled={submitting}>
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {books.map((book: any) => (
              <Card key={book._id}>
                <CardContent className="p-4 flex flex-col h-full justify-between">
                  <div>
                    <div className="h-40 bg-gray-100 mb-4 rounded-md flex items-center justify-center text-gray-400">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          className="h-full object-cover rounded-md"
                        />
                      ) : (
                        <BookOpen className="h-10 w-10" />
                      )}
                    </div>
                    <h4 className="font-semibold line-clamp-2">{book.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {book.author}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {book.category}
                    </Badge>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm">
                    <span
                      className={
                        book.available > 0
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {book.available > 0
                        ? `Tersedia: ${book.available}`
                        : "Habis"}
                    </span>
                    <span className="text-muted-foreground">
                      {book.location}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Sirkulasi Peminjaman</h3>
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
                              : loan.status === "Overdue"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {loan.status === "Borrowed" && (
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
      </Tabs>
    </div>
  );
};

export default LibraryDashboard;
