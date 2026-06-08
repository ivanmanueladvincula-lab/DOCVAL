"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/helper/Axios";
import { useLoading } from "@/helper/LoadingContext";
import { useError } from "@/helper/ErrorContext";
import { CircularProgress } from "@mui/material";
import { getRelativeDate } from "@/helper/dateFormatter";

// Icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import MoveToInboxRoundedIcon from "@mui/icons-material/MoveToInboxRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

export default function IncomingPage() {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  const { setError } = useError();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchIncomingDocuments();
  }, []);

  const fetchIncomingDocuments = () => {
    setLoading(true);
    axiosInstance
      .get("/document/getIncomingFile")
      .then((res) => {
        setDocuments(res.data || res.body || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch incoming documents.");
        setLoading(false);
      });
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.ref_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-500 font-sans">
      
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#002868] dark:text-blue-400 tracking-tight">
          Incoming Documents
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Review documents routed to your division from external sources.
        </p>
      </div>

      {/* ── Toolbar (Search & Filters) ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-t-lg border border-slate-200 dark:border-slate-700 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SearchRoundedIcon fontSize="small" />
          </div>
          <input
            type="text"
            placeholder="Search by Title or Ref No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#002868] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#002868] dark:focus:ring-blue-500 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto justify-center">
          <FilterListRoundedIcon fontSize="small" />
          Filter
        </button>
      </div>

      {/* ── Data Table ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 border-x border-b border-slate-200 dark:border-slate-700 rounded-b-lg shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress size={40} thickness={4} className="text-[#002868] dark:text-blue-400" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
            <MoveToInboxRoundedIcon sx={{ fontSize: 48, opacity: 0.3 }} className="mb-4" />
            <p className="text-lg font-medium">Your inbox is empty.</p>
            <p className="text-sm">No incoming documents require your attention.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ref No.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source Division</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Received</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredDocs.map((doc, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {doc.ref_no || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#002868] dark:text-blue-400 group-hover:underline underline-offset-2 decoration-[#002868]/30 dark:decoration-blue-400/30 line-clamp-1 cursor-pointer" onClick={() => router.push(`/incoming/report?id=${doc.id}`)}>
                      {doc.title}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {doc.division || "External"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {getRelativeDate(doc.date_created)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => router.push(`/incoming/report?id=${doc.id}`)}
                      className="p-2 text-slate-400 hover:text-[#002868] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                      title="Review Document"
                    >
                      <VisibilityRoundedIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}