"use client";

import {
  Button,
  CircularProgress,
  IconButton,
  Stack,
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
        { label: "Info", id: 0 },
        { label: "Report", id: 1 },
      ]
    : [{ label: "Info", id: 0 }];

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
          className="fixed inset-0 bg-black/40 z-40"
          onClick={handleClose}
        />
      )}

      {/* Side Modal — solid white, no transparency */}
      <div
        className={`fixed top-0 right-0 h-full w-1/2 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isModalOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "#ffffff", opacity: 1 }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3 bg-gray-100 border-b border-gray-200">
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            File Details
          </Typography>

          <IconButton size="small" onClick={handleClose}>
            <CloseRoundedIcon />
          </IconButton>
        </div>

        {/* Tabs as Buttons */}
        <Stack direction="row" p={2} spacing={2}>
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? "contained" : "outlined"}
              size="small"
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
                ...(activeTab !== tab.id && {
                  color: "#9CA3AF",
                  borderColor: "#9CA3AF",
                  "&:hover": {
                    borderColor: "#6B7280",
                    backgroundColor: "#f3f4f6",
                  },
                }),
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-140px)]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <CircularProgress />
            </div>
          ) : (
            <>
              {activeTab === 0 && <InfoTab data={data} />}
              {activeTab === 1 && <ReportTab data={data} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}