"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProtectedRoute } from "@/helper/ProtectedRoutes";
import axiosInstance from "@/helper/Axios";
import { CircularProgress } from "@mui/material";
import { getRelativeDate } from "@/helper/dateFormatter";

// Icons
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

export default function HomePage() {
  const { session, status, isChecking } = useProtectedRoute();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    doc_count: 0,
    new_doc_count: 0,
    user_count: 0,
    new_user_count: 0,
    recent_document: []
  });

  // ── STRICT ROLE CHECKER ──
  const isAdmin = (() => {
    if (!session?.user?.role) return false;
    try {
      let rolesArray = [];
      if (typeof session.user.role === "string" && !session.user.role.startsWith("[")) {
        rolesArray = session.user.role.split(",").map(r => r.trim());
      } else {
        rolesArray = Array.isArray(session.user.role) ? session.user.role : JSON.parse(session.user.role);
      }
      return rolesArray.some(r => String(typeof r === "string" ? r : (r.name || "")).toLowerCase() === "admin");
    } catch (err) {
      return false;
    }
  })();

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Try to fetch User Stats safely (Ignore documents from this broken route)
      let uCount = 0;
      let newUCount = 0;
      try {
        const dashRes = await axiosInstance.get("/dashboard");
        const dData = dashRes.data?.body || dashRes.data || {};
        uCount = dData.user_count || 0;
        newUCount = dData.new_user_count || 0;
      } catch (e) {
        console.warn("Could not fetch user counts, skipping...");
      }

      // 2. THE FIX: Fetch Documents directly using the working Evaluate endpoint!
      const docRes = await axiosInstance.get("/document/getFileByUser");
      const files = docRes.body || [];

      // Calculate "New documents this week"
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newDocs = files.filter(f => new Date(f.date_created) >= oneWeekAgo);

      // Sort files to get the Recent Documents (Newest first)
      const sortedDocs = [...files].sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

      // Inject the working data directly into the dashboard state
      setDashboardData({
        doc_count: files.length,
        new_doc_count: newDocs.length,
        user_count: uCount,
        new_user_count: newUCount,
        recent_document: sortedDocs.slice(0, 5) // Take top 5 recent docs
      });

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isChecking || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <CircularProgress size={48} thickness={4} className="text-[#002868]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-500 font-sans space-y-6 bg-slate-50 dark:bg-[#0B1120] min-h-screen">
      
      {/* ── Page Header ── */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-lg font-extrabold text-[#002868] dark:text-blue-400">
          Department of Information and Communications Technology
        </h1>
      </div>

      {/* ── Top Metrics Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Evaluated Documents Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-[#2563EB] p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Your total Evaluated Documents</p>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{dashboardData.doc_count}</h3>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg">
              <DescriptionRoundedIcon />
            </div>
          </div>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-4">
            +{dashboardData.new_doc_count} new documents this week
          </p>
        </div>

        {/* User Accounts Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-[#F59E0B] p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">User Accounts</p>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{dashboardData.user_count}</h3>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 p-3 rounded-lg">
              <PersonRoundedIcon />
            </div>
          </div>
          <p className="text-xs font-bold text-amber-500 dark:text-amber-400 mt-4">
            +{dashboardData.new_user_count} new users this week
          </p>
        </div>

      </div>

      {/* ── Bottom Section: Recent Docs & Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Recent Documents */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Documents</h2>
            <Link href="/evaluate" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {dashboardData.recent_document.length === 0 ? (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-8">No documents available.</p>
            ) : (
              dashboardData.recent_document.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{doc.title || "Document"}</h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {doc.date_created ? new Date(doc.date_created).toISOString().split("T")[0] : "-"}
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 rounded-full uppercase tracking-wider">
                    {doc.doc_type || "Terms of Reference"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
          
          <div className="space-y-3 flex flex-col">
            <Link href="/evaluate" className="flex items-center gap-3 bg-[#2563EB] hover:bg-blue-700 text-white p-3.5 rounded-lg font-bold text-sm transition-colors shadow-sm">
              <AddRoundedIcon fontSize="small" />
              New Document
            </Link>
            
            <Link href="/evaluate" className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-3.5 rounded-lg font-bold text-sm transition-colors text-left border border-transparent dark:border-slate-700 w-full">
              <FolderOpenRoundedIcon fontSize="small" className="text-slate-500 dark:text-slate-400" />
              View Files
            </Link>

            {isAdmin && (
              <Link href="/utilities" className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-3.5 rounded-lg font-bold text-sm transition-colors border border-transparent dark:border-slate-700">
                <SettingsRoundedIcon fontSize="small" className="text-slate-500 dark:text-slate-400" />
                Manage Utilities
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}