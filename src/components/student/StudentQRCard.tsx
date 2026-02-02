import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Refresh, SystemRestart } from "iconoir-react"; // Fixed imports
import { Progress } from "@/components/ui/progress";

const StudentQRCard = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState("");

  const fetchToken = async () => {
    // setLoading(true); // Don't show full loader on refresh, just update
    try {
      const res = await api.get("/attendance/qr-token");
      setToken(res.data.token);
      setTimeLeft(30); // Reset timer
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gagal memuat QR Code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();

    const interval = setInterval(() => {
      fetchToken();
    }, 30000); // 30 seconds

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  return (
    <Card className="w-full max-w-sm mx-auto border-2 border-school-gold/20 shadow-lg">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-lg font-bold text-school-navy flex items-center justify-center gap-2">
          <div className="p-1 bg-school-gold rounded">
            <Refresh className="w-4 h-4 text-white animate-spin-slow" />
          </div>
          Kartu Digital (QR)
        </CardTitle>
        <p className="text-xs text-slate-500">
          Tunjukkan kode ini ke guru untuk absen. QR berubah setiap 30 detik.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {loading && !token ? (
          <div className="h-64 flex items-center justify-center">
            <SystemRestart className="animate-spin w-8 h-8 text-school-gold" />
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center text-red-500 gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchToken}>
              Coba Lagi
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white p-4 rounded-xl border-4 border-school-navy shadow-inner mb-4">
              <QRCodeCanvas
                value={token}
                size={200}
                level={"M"}
                includeMargin={true}
              />
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Refresh otomatis dalam:</span>
                <span
                  className={timeLeft < 5 ? "text-red-500" : "text-school-navy"}
                >
                  {timeLeft}s
                </span>
              </div>
              <Progress
                value={(timeLeft / 30) * 100}
                className="h-2 bg-slate-100"
                indicatorClassName="bg-school-gold"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentQRCard;
