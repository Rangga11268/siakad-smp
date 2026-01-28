import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/services/api";
import { ReportCardTemplate } from "@/components/reports/ReportCardTemplate";
import { SystemRestart } from "iconoir-react";

const PrintReportPage = () => {
  const [searchParams] = useSearchParams();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get params
  const studentId = searchParams.get("studentId");
  const academicYear = searchParams.get("year");
  const semester = searchParams.get("semester");
  const yearName = searchParams.get("yearName") || "-";

  useEffect(() => {
    const fetchReport = async () => {
      if (!studentId || !academicYear || !semester) {
        setLoading(false);
        return;
      }

      try {
        console.log("Print Page: Fetching...", {
          studentId,
          academicYear,
          semester,
        });
        const res = await api.get(`/academic/report/full`, {
          params: {
            studentId,
            academicYear,
            semester,
          },
        });
        console.log("Print Page: Data received", res.data);
        if (!res.data || !res.data.student) {
          console.error("Print Page: Invalid data structure", res.data);
          throw new Error("Invalid data received");
        }
        setReportData(res.data);
      } catch (error: any) {
        console.error("Failed to load report for print", error);
        // Show visible error on screen
        const msg =
          error?.response?.data?.message || error?.message || "Unknown error";
        document.body.innerHTML = `<div style="padding:20px; color:red; text-align:center;">
          <h1>Gagal Memuat Rapor</h1>
          <p>${msg}</p>
          <p>Cek Console untuk detail.</p>
          <button onclick="window.close()" style="margin-top:20px; padding:10px 20px; cursor:pointer;">Tutup</button>
        </div>`;
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [studentId, academicYear, semester]);

  // Auto print when data is ready
  useEffect(() => {
    if (!loading && reportData) {
      // Small delay to ensure render
      setTimeout(() => {
        window.print();
        // Optional: window.close(); // Don't auto-close, let user decide
      }, 500);
    }
  }, [loading, reportData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <SystemRestart className="w-10 h-10 animate-spin text-slate-400 mb-4" />
        <p className="text-slate-500">Menyiapkan dokumen...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-8 text-center text-red-500">
        Gagal memuat data rapor. Pastikan parameter URL benar.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Explicit Print Styles for this page */}
      <style>
        {`
            @media print {
              @page {
                size: A4;
                margin: 0; 
              }
              body {
                background: white;
                -webkit-print-color-adjust: exact;
              }
            }
          `}
      </style>
      <ReportCardTemplate data={reportData} yearName={yearName} />
    </div>
  );
};

export default PrintReportPage;
