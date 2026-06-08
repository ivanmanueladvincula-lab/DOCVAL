"use client";
import { useProtectedRoute } from "@/helper/ProtectedRoutes";
import Link from "next/link";
import { useLoading } from "@/helper/LoadingContext";
import { useEffect, useState } from "react";
import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";
import { CircularProgress, Container } from "@mui/material";
import { getRelativeDate } from "@/helper/dateFormatter";
import { useRouter } from "next/navigation";

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

export default function home() {
  const router = useRouter();
  const { setError } = useError();
  const { session, status, isChecking } = useProtectedRoute();
  const { startLoading, stopLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const roleValue = session?.user?.role;
  const roleNames = Array.isArray(roleValue)
    ? roleValue.map((role) => role?.name).filter(Boolean)
    : roleValue
      ? [typeof roleValue === "string" ? roleValue : roleValue?.name].filter(Boolean)
      : [];
  const isAdmin = roleNames.some((role) => role === "admin" || role === "CRRU");

  useEffect(() => {
    if (isChecking) {
      startLoading();
    } else {
      stopLoading();
      fetchData();
    }
  }, [isChecking, startLoading, stopLoading]);

  const fetchData = () => {
    setLoading(true);
    axiosInstance
      .get("/dashboard")
      .then((res) => {
        setDashboardData(res.body);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch dashboard data. Please try again.";
        setError(message);
        setLoading(false);
      });
  };

  const handleFileClick = (docId) => {
    router.push(`/evaluate?id=${docId}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8">

      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-8 mb-8 text-white shadow-xl overflow-hidden">

        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-16 w-40 h-40 bg-white opacity-5 rounded-full translate-y-1/2" />
        <div className="absolute top-1/2 right-32 w-24 h-24 bg-blue-400 opacity-10 rounded-full -translate-y-1/2" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Profile photo or initial */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/30 shadow-lg flex-shrink-0">
              {session?.user?.profile_img ? (
                <img
                  src={session.user.profile_img}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {session?.user?.full_name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* Text */}
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">
                {new Date().toLocaleDateString("en-PH", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h3 className="text-3xl font-bold mb-1">
                Welcome back, {session?.user?.full_name}!
              </h3>
              <p className="text-blue-200 text-sm">
                {session?.user?.division || "Document Evaluation System"}
                &nbsp;·&nbsp;
                {roleNames.join(", ")}
              </p>
            </div>
          </div>

                      {/* Right side waving hand */}
              <div className="hidden lg:block">
                <span
                  className="text-6xl select-none"
                  style={{
                    display: "inline-block",
                    animation: "wave 1.5s ease-in-out infinite",
                    transformOrigin: "70% 70%",
                  }}
                >
                  👋
                </span>
                <style>{`
                  @keyframes wave {
                    0%   { transform: rotate(0deg); }
                    15%  { transform: rotate(20deg); }
                    30%  { transform: rotate(-10deg); }
                    45%  { transform: rotate(20deg); }
                    60%  { transform: rotate(-5deg); }
                    75%  { transform: rotate(10deg); }
                    100% { transform: rotate(0deg); }
                  }
                `}</style>
              </div>
        </div>

        {/* Bottom info strip */}
        <div className="relative mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-sm text-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>System Online</span>
          </div>
          <div>
            📄 {dashboardData?.doc_count ?? 0} Documents Evaluated
          </div>
          {isAdmin && (
            <div>
              👥 {dashboardData?.user_count ?? 0} User Accounts
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Total Evaluated Documents */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Your total Evaluated Documents
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {dashboardData?.doc_count ?? 0}
              </h3>
              <p className="text-xs text-green-600 mt-2">
                {`+${dashboardData?.new_doc_count ?? 0} new documents this week`}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DescriptionRoundedIcon sx={{ color: "blue" }} />
            </div>
          </div>
        </div>

        {/* User Accounts — admin only */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  User Accounts
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData?.user_count ?? 0}
                </h3>
                <p className="text-xs text-yellow-600 mt-2">
                  {`+${dashboardData?.new_user_count ?? 0} new users this week`}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <PersonOutlineRoundedIcon sx={{ color: "orange" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Activity ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Documents */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Recent Documents</h3>
            <Link href="/evaluate">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </Link>
          </div>
          {(dashboardData?.recent_document?.length ?? 0) === 0 ? (
            <p className="text-gray-500">No recent documents found.</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.recent_document.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => handleFileClick(doc.id)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doc.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRelativeDate(doc.date_created)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                      {doc.doc_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid gap-y-4">
            <Link href="/evaluate/new">
              <button className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-left flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Document
              </button>
            </Link>
            <Link href="/evaluate">
              <button className="w-full px-4 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition text-left flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Files
              </button>
            </Link>
            {isAdmin && (
              <Link href="/utilities">
                <button className="w-full px-4 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition text-left flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  Manage Utilities
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}