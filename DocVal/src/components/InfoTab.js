"use client";

import {
  Chip,
  IconButton,
  Stack,
  Typography,
  Divider,
  Box,
  Button,
} from "@mui/material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";
import { useProtectedRoute } from "@/helper/ProtectedRoutes";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function InfoTab({ data }) {
  const router = useRouter();
  const { setError } = useError();
  const { session } = useProtectedRoute();
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const openFile = () => {
    axiosInstance
      .post(
        "/document/downloadFile",
        { fileName: data?.url },
        { responseType: "blob" },
      )
      .then((res) => {
        const url = window.URL.createObjectURL(res);
        window.open(url);
      })
      .catch(() => {
        setError("Failed to open the file. Please try again.", "error");
      });
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
      .post(
        "/document/downloadFile",
        { fileName: data?.url },
        { responseType: "blob" },
      )
      .then(async (res) => {
        const base64 = await toBase64(res).catch(() => {
          setError("Error reading file", "error");
        });
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
        {
          base64_data: base64,
          document_type: data?.doc_type,
        },
        { signal: abortControllerRef.current.signal },
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
            }),
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

  const rowSx = {
    display: "flex",
    justifyContent: "space-between",
    gap: 2,
  };

  const labelSx = {
    color: "text.primary",
    fontWeight: 700,
    opacity: 0.85,
    minWidth: 140,
  };

  const valueSx = {
    color: "text.primary",
    fontWeight: 800,
    textAlign: "right",
    wordBreak: "break-word",
    flex: 1,
  };

  return (
    <Stack spacing={2}>
      {/* Document Details Section */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 900, color: "text.primary" }}
        >
          Document Details
        </Typography>

        <Stack spacing={1}>
          <Box sx={rowSx}>
            <Typography variant="body2" sx={labelSx}>
              Control No.:
            </Typography>
            <Typography variant="body2" sx={valueSx}>
              {/* ✅ Show only first 8 characters of GUID */}
              {data?.id ? data.id.slice(0, 8).toUpperCase() : "—"}
            </Typography>
          </Box>

          <Box sx={rowSx}>
            <Typography variant="body2" sx={labelSx}>
              Reference No.:
            </Typography>
            <Typography variant="body2" sx={valueSx}>
              {data?.reference_no || "—"}
            </Typography>
          </Box>

          <Box sx={rowSx}>
            <Typography variant="body2" sx={labelSx}>
              Title:
            </Typography>
            <Typography variant="body2" sx={valueSx}>
              {data?.title || "—"}
            </Typography>
          </Box>

          <Box sx={rowSx}>
            <Typography variant="body2" sx={labelSx}>
              Document Type:
            </Typography>
            <Typography variant="body2" sx={valueSx}>
              {data?.doc_type || "—"}
            </Typography>
          </Box>

          <Box sx={rowSx}>
            <Typography variant="body2" sx={labelSx}>
              Classification:
            </Typography>
            <Typography variant="body2" sx={valueSx}>
              {data?.doc_class || "—"}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Sender Details Section */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 900, color: "text.primary" }}
        >
          Sender Information
        </Typography>

        <Stack spacing={1}>
          <Box sx={rowSx}>
            <Typography variant="body2" sx={labelSx}>
              Office:
            </Typography>
            <Typography variant="body2" sx={valueSx}>
              {data?.sender_office || "—"}
            </Typography>
          </Box>

          <Box sx={rowSx}>
            <Typography variant="body2" sx={labelSx}>
              Contact Person:
            </Typography>
            <Typography variant="body2" sx={valueSx}>
              {data?.sender_person || "—"}
            </Typography>
          </Box>

          <Box sx={rowSx}>
            <Typography variant="body2" sx={labelSx}>
              Email:
            </Typography>
            <Typography variant="body2" sx={valueSx}>
              {data?.sender_email || "—"}
            </Typography>
          </Box>

          <Box sx={rowSx}>
            <Typography variant="body2" sx={labelSx}>
              Phone:
            </Typography>
            <Typography variant="body2" sx={valueSx}>
              {data?.sender_phone || "—"}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Receiving Office Section - Display if not null */}
      {data?.receiving_office && (
        <>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: 900, color: "text.primary" }}
            >
              Receiving Office
            </Typography>
            <Typography variant="body2" sx={{ ...valueSx, textAlign: "left" }}>
              {data?.receiving_office}
            </Typography>
          </Box>
          <Divider />
        </>
      )}

      {/* File Section */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 900, color: "text.primary" }}
        >
          Attached File
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={data?.url || "—"}
            variant="outlined"
            icon={<PictureAsPdfRoundedIcon color="error" />}
            sx={{
              borderStyle: "dashed",
              bgcolor: "#f7f7f7ff",
              fontWeight: 700,
              color: "text.primary",
              maxWidth: 380,
              "& .MuiChip-label": {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
          />

          <IconButton size="small" onClick={openFile}>
            <LaunchRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {session?.user?.division_id === data?.receiving_office_id &&
        data?.report === null && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Report"}
            </Button>

            <IconButton
              size="small"
              disabled={!loading}
              onClick={abortGenerateReport}
            >
              <StopCircleRoundedIcon
                fontSize="small"
                color={loading ? "error" : "disabled"}
              />
            </IconButton>
          </Stack>
        )}
    </Stack>
  );
}