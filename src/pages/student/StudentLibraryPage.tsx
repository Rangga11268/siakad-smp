import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookStack, Book } from "iconoir-react";
import api from "@/services/api";

const StudentLibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-school-navy">
          Perpustakaan Digital
        </h2>
        <p className="text-slate-500">Cari buku dan cek status peminjaman.</p>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" /> Cari Buku
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center gap-2">
            <BookStack className="w-4 h-4" /> Peminjaman Saya
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <BookSearchTab />
        </TabsContent>
        <TabsContent value="loans">
          <MyLoansTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BookSearchTab = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/library/books").then((res) => {
      setBooks(res.data);
      setFiltered(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!term) setFiltered(books);
    else {
      const lower = term.toLowerCase();
      setFiltered(
        books.filter(
          (b) =>
            b.title.toLowerCase().includes(lower) ||
            b.author.toLowerCase().includes(lower),
        ),
      );
    }
  }, [term, books]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Katalog Buku</CardTitle>
        <div className="pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari judul atau pengarang..."
              className="pl-9"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <p>Memuat...</p>
          ) : filtered.length === 0 ? (
            <p>Tidak ditemukan.</p>
          ) : (
            filtered.map((b) => (
              <div
                key={b._id}
                className="border rounded-lg p-4 flex flex-col hover:border-school-gold transition-colors bg-white shadow-sm"
              >
                <div className="h-40 bg-slate-100 mb-3 rounded flex items-center justify-center text-slate-300">
                  <Book className="w-12 h-12" />
                </div>
                <h4 className="font-bold text-school-navy line-clamp-2 mb-1">
                  {b.title}
                </h4>
                <p className="text-sm text-slate-500 mb-2">{b.author}</p>
                <div className="mt-auto pt-2 border-t flex justify-between items-center text-xs">
                  <span className="bg-slate-100 px-2 py-1 rounded">
                    {b.category}
                  </span>
                  <span
                    className={
                      b.stock > 0
                        ? "text-green-600 font-bold"
                        : "text-red-500 font-bold"
                    }
                  >
                    {b.stock > 0 ? `Stok: ${b.stock}` : "Habis"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MyLoansTab = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/library/my-loans")
      .then((res) => {
        setLoans(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buku yang Saya Pinjam</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Memuat...</p>
        ) : loans.length === 0 ? (
          <p className="text-slate-500">Tidak ada peminjaman aktif.</p>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div
                key={loan._id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-bold text-school-navy">
                    {loan.book?.title}
                  </p>
                  <p className="text-sm text-slate-500">
                    Pinjam:{" "}
                    {new Date(loan.loanDate).toLocaleDateString("id-ID")} —
                    Kembali:{" "}
                    {new Date(loan.dueDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <Badge
                  variant={loan.status === "returned" ? "outline" : "default"}
                  className={loan.status === "active" ? "bg-blue-600" : ""}
                >
                  {loan.status === "active" ? "Sedang Dipinjam" : loan.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentLibraryPage;
