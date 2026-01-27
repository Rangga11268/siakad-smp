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
  CardDescription,
  CardHeader,
  CardTitle,
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

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    docKK: null,
    docAkta: null,
    docRapor: null,
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [e.target.name]: e.target.files[0] });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key as keyof typeof formData]);
    });

    if (files.docKK) data.append("docKK", files.docKK);
    if (files.docAkta) data.append("docAkta", files.docAkta);
    if (files.docRapor) data.append("docRapor", files.docRapor);

    try {
      await api.post("/ppdb/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({
        title: "Pendaftaran Berhasil!",
        description:
          "Data Anda telah tersimpan. Silakan cek status secara berkala.",
      });
      navigate("/"); // Redirect to landing or status page
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.errors
        ? error.response.data.errors
            .map((e: any) => `• ${e.message}`)
            .join("\n")
        : error.response?.data?.message ||
          "Terjadi kesalahan saat mengirim data.";

      toast({
        variant: "destructive",
        title: "Pendaftaran Gagal",
        description: <div className="whitespace-pre-wrap">{errorMessage}</div>,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      {/* ... (Header remains same) ... */}
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-school-navy mb-4">
            Penerimaan Peserta Didik Baru
          </h1>
          <div className="w-24 h-1 bg-school-gold mx-auto mb-4"></div>
          <p className="text-slate-600">
            Tahun Ajaran 2025/2026 - SMP Satya Cendekia
          </p>
        </div>

        <Card className="shadow-2xl border-t-8 border-t-school-gold">
          {/* ... (Card Header remains same) ... */}
          <CardHeader className="bg-school-navy text-white p-8">
            <CardTitle className="font-serif text-2xl md:text-3xl text-school-gold text-center">
              Formulir Pendaftaran Online
            </CardTitle>
            <CardDescription className="text-white/70 text-center">
              Lengkapi data di bawah ini dengan benar dan sesuai dokumen resmi.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Data Pribadi (Same) */}

              {/* ... (Keep existing form fields until File Upload Section) ... */}

              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
                  <div className="w-8 h-8 rounded-full bg-school-gold flex items-center justify-center font-bold text-school-navy">
                    1
                  </div>
                  <h3 className="text-xl font-serif font-bold text-school-navy">
                    Data Calon Siswa
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ... Same inputs ... */}
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">
                      Nama Lengkap
                    </Label>
                    <Input
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      required
                      placeholder="Sesuai Ijazah SD"
                      className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">NISN</Label>
                    <Input
                      name="nisn"
                      value={formData.nisn}
                      onChange={handleChange}
                      required
                      placeholder="10 Digit Angka"
                      className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">
                      Jenis Kelamin
                    </Label>
                    <Select
                      onValueChange={(v) => handleSelectChange("gender", v)}
                    >
                      <SelectTrigger className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50">
                        <SelectValue placeholder="Pilih Jenis Kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">
                      Asal Sekolah
                    </Label>
                    <Input
                      name="originSchool"
                      value={formData.originSchool}
                      onChange={handleChange}
                      required
                      placeholder="Nama SD Asal"
                      className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">
                      Tempat Lahir
                    </Label>
                    <Input
                      name="birthPlace"
                      value={formData.birthPlace}
                      onChange={handleChange}
                      required
                      className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">
                      Tanggal Lahir
                    </Label>
                    <Input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      required
                      className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">
                    Alamat Lengkap (Sesuai KK)
                  </Label>
                  <Textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                    className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50 min-h-[100px]"
                  />
                </div>
              </div>

              {/* Data Orang Tua */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
                  <div className="w-8 h-8 rounded-full bg-school-gold flex items-center justify-center font-bold text-school-navy">
                    2
                  </div>
                  <h3 className="text-xl font-serif font-bold text-school-navy">
                    Data Orang Tua / Wali
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">
                      Nama Orang Tua
                    </Label>
                    <Input
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      required
                      className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">
                      No. HP (WhatsApp)
                    </Label>
                    <Input
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      required
                      placeholder="08..."
                      className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Jalur & Dokumen */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
                  <div className="w-8 h-8 rounded-full bg-school-gold flex items-center justify-center font-bold text-school-navy">
                    3
                  </div>
                  <h3 className="text-xl font-serif font-bold text-school-navy">
                    Jalur Pendaftaran & Berkas
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">
                    Pilih Jalur Pendaftaran
                  </Label>
                  <Select
                    onValueChange={(v) =>
                      handleSelectChange("registrationPath", v)
                    }
                    defaultValue="Zonasi"
                  >
                    <SelectTrigger className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50 h-12">
                      <SelectValue placeholder="Pilih Jalur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zonasi">
                        <span className="font-bold">Zonasi</span> (Jarak Tempat
                        Tinggal)
                      </SelectItem>
                      <SelectItem value="Afirmasi">
                        <span className="font-bold">Afirmasi</span>{" "}
                        (KIP/KKS/Keluarga Prasejahtera)
                      </SelectItem>
                      <SelectItem value="Prestasi">
                        <span className="font-bold">Prestasi</span> (Nilai
                        Rapor/Kejuaraan)
                      </SelectItem>
                      <SelectItem value="Pindah Tugas">
                        <span className="font-bold">Perpindahan Tugas</span>{" "}
                        (Orang Tua/Wali)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">
                      Upload Kartu Keluarga (KK)
                    </Label>
                    <Input
                      type="file"
                      name="docKK"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50 cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">
                      Format: PDF/JPG. Max 5MB.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">
                      Upload Akta Kelahiran
                    </Label>
                    <Input
                      type="file"
                      name="docAkta"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50 cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">
                      Format: PDF/JPG. Max 5MB.
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-bold text-slate-700">
                      Upload Rapor (Halaman Nilai Terakhir)
                    </Label>
                    <Input
                      type="file"
                      name="docRapor"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="border-slate-300 focus:border-school-gold focus:ring-school-gold bg-slate-50 cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">
                      Opsional jika jalur Zonasi. Wajib untuk Prestasi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  type="submit"
                  className="w-full bg-school-gold hover:bg-yellow-600 text-school-navy font-bold text-lg py-6 h-auto rounded-lg shadow-lg hover:shadow-xl transition-all"
                  disabled={loading}
                >
                  {loading
                    ? "Sedang Mengirim..."
                    : "KIRIM FORMULIR PENDAFTARAN"}
                </Button>
                <p className="text-center text-sm text-slate-500 mt-4">
                  Dengan mengirimkan formulir ini, Anda menyatakan data yang
                  diisi adalah benar dan dapat dipertanggungjawabkan.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PPDBRegisterPage;
