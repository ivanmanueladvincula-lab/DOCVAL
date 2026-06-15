"use client";

import { IconButton, Button } from "@mui/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";
import { useProtectedRoute } from "@/helper/ProtectedRoutes";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Reusable Card Component for Info Sections
const InfoCard = ({ title, children }) => (
  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 mb-5 shadow-sm">
    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 tracking-wide">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

// Reusable Row Component for Key-Value Pairs
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[130px] pt-0.5">
      {label}
    </span>
    <span className="text-sm font-semibold text-slate-900 dark:text-white text-right break-words flex-1">
      {value || "—"}
    </span>
  </div>
);

export default function InfoTab({ data }) {
  const router = useRouter();
  const { setError } = useError();
  const { session } = useProtectedRoute();
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const openFile = () => {
    axiosInstance
      .post("/document/downloadFile", { fileName: data?.url }, { responseType: "blob" })
      .then((res) => {
        const url = window.URL.createObjectURL(res);
        window.open(url);
      })
      .catch(() => setError("Failed to open the file. Please try again.", "error"));
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleGenerate = () => {
    setLoading(true);
    axiosInstance
      .post("/document/downloadFile", { fileName: data?.url }, { responseType: "blob" })
      .then(async (res) => {
        const base64 = await toBase64(res).catch(() => setError("Error reading file", "error"));
        generateReport(base64);
      })
      .catch(() => {
        setError("Failed to generate report. Please try again.", "error");
        setLoading(false);
      });
  };

  const generateReport = (base64) => {
    abortControllerRef.current = new AbortController();
    axiosInstance
      .post(
        "/document/generateReport",
        { base64_data: base64, document_type: data?.doc_type },
        { signal: abortControllerRef.current.signal }
      )
      .then((res) => {
        setError("Report generated successfully!", "success");
        const request = indexedDB.open("docval_db", 1);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("reports")) {
            db.createObjectStore("reports", { keyPath: "id" });
          }
        };

        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction("reports", "readwrite");
          const store = transaction.objectStore("reports");
          const reportId = `report_${Date.now()}`;

          store.put({
            id: reportId,
            file_base64: base64,
            report_data: res.body,
            timestamp: Date.now(),
          });

          sessionStorage.setItem(
            "newReportData",
            JSON.stringify({
              ...data,
              file_name: data?.url,
              report_id: reportId,
              generation_date: new Date().toISOString().split("T")[0],
            })
          );

          router.push(`/incoming/report`);
          setLoading(false);
        };

        request.onerror = () => {
          setError("Error storing report data", "error");
          setLoading(false);
        };
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to generate report. Please try again.", "error");
        setLoading(false);
      });
  };

  const abortGenerateReport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <InfoCard title="Document Details">
        <InfoRow label="Control No." value={data?.id ? data.id.slice(0, 8).toUpperCase() : null} />
        <InfoRow label="Reference No." value={data?.reference_no} />
        <InfoRow label="Title" value={data?.title} />
        <InfoRow label="Document Type" value={data?.doc_type} />
        <InfoRow label="Classification" value={data?.doc_class} />
      </InfoCard>

      <InfoCard title="Sender Information">
        <InfoRow label="Office" value={data?.sender_office} />
        <InfoRow label="Contact Person" value={data?.sender_person} />
        <InfoRow label="Email" value={data?.sender_email} />
        <InfoRow label="Phone" value={data?.sender_phone} />
      </InfoCard>

      {data?.receiving_office && (
        <InfoCard title="Receiving Office">
          <InfoRow label="Target Office" value={data?.receiving_office} />
        </InfoCard>
      )}

      {/* Styled Attached File Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between shadow-sm mb-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg flex-shrink-0">
            <DescriptionRoundedIcon className="text-red-500 dark:text-red-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">Attached File</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[250px] sm:max-w-[300px]">
              {data?.url || "No file attached"}
            </p>
          </div>
        </div>
        <IconButton size="small" onClick={openFile} className="bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 flex-shrink-0">
          <LaunchRoundedIcon fontSize="small" className="text-slate-600 dark:text-slate-300" />
        </IconButton>
      </div>

      {session?.user?.division_id === data?.receiving_office_id && data?.report === null && (
        <div className="flex items-center gap-3 pt-4">
          <Button
            fullWidth
            variant="contained"
            className="bg-[#2563EB] hover:bg-blue-700 shadow-none py-2.5 font-bold"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating Report..." : "Generate AI Report"}
          </Button>

          <IconButton
            size="large"
            disabled={!loading}
            onClick={abortGenerateReport}
            className={`border ${loading ? 'border-red-200 bg-red-50 hover:bg-red-100' : 'border-slate-200 bg-slate-50'}`}
          >
            <StopCircleRoundedIcon color={loading ? "error" : "disabled"} />
          </IconButton>
        </div>
      )}
    </div>
  );
}