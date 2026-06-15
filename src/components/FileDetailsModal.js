"use client";

import {
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@/helper/Axios";
import InfoTab from "./InfoTab";
import ReportTab from "./ReportTab";

export default function FileDetailsModal({
  isModalOpen,
  setIsModalOpen,
  basePath = "/evaluate",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(null);

  const tabs = data?.report
    ? [
        { label: "Overview Info", id: 0 },
        { label: "AI Report", id: 1 },
      ]
    : [{ label: "Overview Info", id: 0 }];

  const handleClose = () => {
    setActiveTab(0);
    setIsModalOpen(false);
    router.push(basePath, { replace: true });
  };

  const fetchData = () => {
    setLoading(true);
    axiosInstance
      .post("/document/getFileDetail", { fileId: fileId })
      .then((res) => {
        setData(res.body);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (fileId) {
      fetchData();
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [fileId, setIsModalOpen]);

  return (
    <>
      {/* Dark overlay behind modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Side Modal — Tailwind responsive and Dark Mode ready */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] lg:w-[600px] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-slate-200 dark:border-slate-800 ${
          isModalOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <Typography variant="h6" className="font-extrabold text-slate-900 dark:text-white">
            File Details
          </Typography>

          <IconButton size="small" onClick={handleClose} className="text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Modern Segmented Control for Tabs */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-150px)] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <CircularProgress size={40} thickness={4} className="text-blue-600 dark:text-blue-500" />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              {activeTab === 0 && <InfoTab data={data} />}
              {activeTab === 1 && <ReportTab data={data} />}
            </div>
          )}
        </div>
      </div>
    </>
  );
}