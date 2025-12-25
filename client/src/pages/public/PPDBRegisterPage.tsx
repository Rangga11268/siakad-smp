import { useState } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";

const PPDBRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    nisn: "",
    gender: "",
    birthPlace: "",
    birthDate: "",
    address: "",
    originSchool: "",
    parentName: "",
    parentPhone: "",
    docKK: "",
    docAkta: "",
    registrationPath: "Zonasi",
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/ppdb/register", formData);
      toast({
        title: "Pendaftaran Berhasil!",
        description:
          "Data Anda telah tersimpan. Silakan cek status secara berkala.",
      });
      navigate("/"); // Redirect to landing or status page
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Pendaftaran Gagal",
        description: error.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center py-10 px-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-blue-800">
            Formulir PPDB Online
          </CardTitle>
          <CardDescription>
            Penerimaan Peserta Didik Baru SMP Gak Ada Nama T.A 2025/2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data Pribadi */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                A. Data Calon Siswa
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                    placeholder="Sesuai Ijazah SD"
                  />
                </div>
                <div className="space-y-2">
                  <Label>NISN</Label>
                  <Input
                    name="nisn"
                    value={formData.nisn}
                    onChange={handleChange}
                    required
                    placeholder="10 Digit Angka"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
                  <Select
                    onValueChange={(v) => handleSelectChange("gender", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Asal Sekolah</Label>
                  <Input
                    name="originSchool"
                    value={formData.originSchool}
                    onChange={handleChange}
                    required
                    placeholder="Nama SD Asal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tempat Lahir</Label>
                  <Input
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Lahir</Label>
                  <Input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Alamat Lengkap (Sesuai KK)</Label>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                />
              </div>
            </div>

            {/* Data Orang Tua */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                B. Data Orang Tua / Wali
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Orang Tua</Label>
                  <Input
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>No. HP (WhatsApp)</Label>
                  <Input
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    required
                    placeholder="08..."
                  />
                </div>
              </div>
            </div>

            {/* Jalur & Dokumen */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                C. Jalur Pendaftaran & Berkas
              </h3>
              <div className="space-y-2">
                <Label>Pilih Jalur</Label>
                <Select
                  onValueChange={(v) =>
                    handleSelectChange("registrationPath", v)
                  }
                  defaultValue="Zonasi"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jalur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zonasi">
                      Zonasi (Jarak Tempat Tinggal)
                    </SelectItem>
                    <SelectItem value="Afirmasi">Afirmasi (KIP/KKS)</SelectItem>
                    <SelectItem value="Prestasi">
                      Prestasi (Nilai Rapor/Lomba)
                    </SelectItem>
                    <SelectItem value="Pindah Tugas">
                      Perpindahan Tugas Orang Tua
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link Google Drive KK (Kartu Keluarga)</Label>
                  <Input
                    name="docKK"
                    value={formData.docKK}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Pastikan link dapat diakses (Public/Anyone with link).
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Link Google Drive Akta Kelahiran</Label>
                  <Input
                    name="docAkta"
                    value={formData.docAkta}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-lg py-6"
              disabled={loading}
            >
              {loading ? "Mengirim Data..." : "Kirim Formulir Pendaftaran"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PPDBRegisterPage;
