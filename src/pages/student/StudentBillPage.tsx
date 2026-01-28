import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
// import { formatCurrency } from "@/lib/utils"; removed

const StudentBillPage = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await api.get("/finance/my-billings");
      setBills(res.data);
    } catch (error) {
      console.error("Gagal load tagihan", error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-school-navy">
          Tagihan Saya
        </h2>
        <p className="text-slate-500">
          Daftar tagihan SPP dan pembayaran lainnya.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Tagihan</CardTitle>
          <CardDescription>Status pembayaran SPP bulanan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bulan / Tahun</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Bayar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Tidak ada data tagihan.
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((bill) => (
                  <TableRow key={bill._id}>
                    <TableCell className="font-medium text-school-navy capitalize">
                      {bill.month} {bill.year}
                    </TableCell>
                    <TableCell>SPP</TableCell>
                    <TableCell>{fmt(bill.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          bill.status === "paid" ? "bg-green-600" : "bg-red-500"
                        }
                      >
                        {bill.status === "paid" ? "Lunas" : "Belum Lunas"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bill.paidAt
                        ? new Date(bill.paidAt).toLocaleDateString("id-ID")
                        : "-"}
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

export default StudentBillPage;
