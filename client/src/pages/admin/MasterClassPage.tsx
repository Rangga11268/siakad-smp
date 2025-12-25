import { useState } from "react";
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
import { Plus, Trash2, Edit } from "lucide-react";

const MasterClassPage = () => {
  // Mock Data
  const classes = [
    { id: 1, name: "7A", level: 7, homeroom: "Budi Santoso", students: 30 },
    { id: 2, name: "7B", level: 7, homeroom: "Siti Aminah", students: 28 },
    { id: 3, name: "8A", level: 8, homeroom: "Joko Anwar", students: 32 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Kelas</h2>
          <p className="text-muted-foreground">
            Kelola daftar kelas dan wali kelas.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Tambah Kelas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas (Tahun Ajaran 2024/2025)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Tingkat</TableHead>
                <TableHead>Wali Kelas</TableHead>
                <TableHead>Jumlah Siswa</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>Kelas {cls.level}</TableCell>
                  <TableCell>{cls.homeroom}</TableCell>
                  <TableCell>{cls.students} Siswa</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4 text-orange-500" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterClassPage;
