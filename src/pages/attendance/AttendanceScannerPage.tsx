import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button"; // Unused
import { useToast } from "@/components/ui/use-toast";
import { Check, Xmark, ScanQrCode } from "iconoir-react"; // Fixed icons

/**
 * Page for Teachers to scan Student QR Codes
 */
const AttendanceScannerPage = () => {
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const [lastScan, setLastScan] = useState<string>("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize Scanner
    // Note: html5-qrcode renders into a div with id.
    // We wrap initialization in a timeout to ensure DOM is ready and prevent strict mode double-init
    const initScanner = () => {
      if (scannerRef.current) return;

      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false,
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    };

    const timer = setTimeout(initScanner, 500);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    if (decodedText === lastScan) return; // Prevent spamming same code
    setLastScan(decodedText);

    try {
      // Play Beep
      const audio = new Audio("/assets/beep.mp3"); // Assuming asset exists, or fail silently
      audio.play().catch(() => {});

      const res = await api.post("/attendance/qr-scan", { token: decodedText });

      setScanResult(res.data);
      setIsError(false);

      toast({
        title: "Scan Berhasil!",
        description: `${res.data.student.name} - ${res.data.student.class}`,
        variant: "default",
        className: "bg-green-600 text-white border-none",
      });

      // Clear result after 3 seconds to ready for next
      setTimeout(() => {
        setScanResult(null);
        setLastScan(""); // Allow re-scan if needed
      }, 3000);
    } catch (error: any) {
      setIsError(true);
      const msg = error.response?.data?.message || "QR Code Tidak Valid";
      setScanResult({ message: msg });

      // Error Beep
      const audio = new Audio("/assets/error.mp3");
      audio.play().catch(() => {});

      toast({
        title: "Scan Gagal",
        description: msg,
        variant: "destructive",
      });

      setTimeout(() => {
        setScanResult(null);
        setLastScan("");
      }, 3000);
    }
  };

  const onScanFailure = (error: any) => {
    // console.warn(error); // Verify verbose level
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <Card className="border-school-gold shadow-2xl overflow-hidden">
        <CardHeader className="bg-school-navy text-white text-center py-6">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold">
            <ScanQrCode className="w-8 h-8 text-school-gold" />
            Scanner Absensi
          </CardTitle>
          <p className="text-white/70">Arahkan kamera ke QR Code Siswa</p>
        </CardHeader>
        <CardContent className="p-0 relative bg-black min-h-[400px]">
          {/* Camera Viewport */}
          <div id="reader" className="w-full h-full bg-black text-white" />

          {/* Overlay Result */}
          {scanResult && (
            <div
              className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300 ${isError ? "text-red-500" : "text-emerald-500"}`}
            >
              {isError ? (
                <Xmark className="w-32 h-32 mb-4" />
              ) : (
                <Check className="w-32 h-32 mb-4" />
              )}

              <h2 className="text-3xl font-black text-white mb-2">
                {isError ? "GAGAL" : "BERHASIL"}
              </h2>

              {!isError && scanResult.student && (
                <div className="text-center text-white">
                  <p className="text-2xl font-bold mb-1">
                    {scanResult.student.name}
                  </p>
                  <p className="text-lg opacity-80">
                    {scanResult.student.class} | {scanResult.student.nisn}
                  </p>
                  {scanResult.alreadyPresent && (
                    <p className="mt-4 px-4 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-bold border border-yellow-500/50">
                      ⚠️ SUDAH ABSEN HARI INI
                    </p>
                  )}
                </div>
              )}

              {isError && (
                <p className="text-xl text-white font-bold px-8 text-center">
                  {scanResult.message}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-slate-500 text-sm">
        <p>
          Pastikan pencahayaan cukup. Scanner akan memproses otomatis setiap QR
          Code yang valid.
        </p>
        <p>Gunakan browser Chrome/Safari untuk hasil terbaik.</p>
      </div>
    </div>
  );
};

export default AttendanceScannerPage;
