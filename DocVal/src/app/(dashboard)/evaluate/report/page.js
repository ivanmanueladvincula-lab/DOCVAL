"use client";

import {
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Report_pdf from "@/helper/printables/Report_pdf";
import { useSession } from "next-auth/react";
import { useProtectedRoute } from "@/helper/ProtectedRoutes";
import { useError } from "@/helper/ErrorContext";
import axiosInstance from "@/helper/Axios";
import ReportRenderer from "../../../../components/ReportRenderer";

export default function Report() {
  const { setError } = useError();
  const [loading, setLoading] = useState(true);
  const [newReportData, setNewReportData] = useState({});

  const router = useRouter();

  useEffect(() => {
    const storedData =
      JSON.parse(sessionStorage.getItem("newReportData")) || {};

    if (storedData.report_id) {
      const request = indexedDB.open("docval_db", 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("reports", "readonly");
        const store = transaction.objectStore("reports");
        const getRequest = store.get(storedData.report_id);

        getRequest.onsuccess = () => {
          const indexedData = getRequest.result || {};
          setNewReportData({
            ...storedData,
            file_base64: indexedData.file_base64,
            report_data: indexedData.report_data,
          });
          setLoading(false);
        };

        getRequest.onerror = () => {
          setError("Error loading report data", "error");
          setNewReportData(storedData);
          setLoading(false);
        };
      };

      request.onerror = () => {
        setError("Error accessing database", "error");
        setNewReportData(storedData);
        setLoading(false);
      };
    } else {
      setNewReportData(storedData);
      setLoading(false);
    }
  }, [setError]);

  const handleCancel = () => {
    router.push("/evaluate", { replace: true });
    sessionStorage.removeItem("newReportData");
  };

  const handleSave = () => {
    setLoading(true);
    axiosInstance
      .post("/document/createFile", {
        reference_no: newReportData.refno,
        title: newReportData.title,
        doc_type: newReportData.type,
        doc_class: newReportData.classification,
        sender_office: newReportData.sender_office,
        sender_person: newReportData.sender_person,
        sender_email: newReportData.sender_email,
        sender_phone: newReportData.sender_phone,
        base64_data: newReportData.file_base64,
        report: newReportData.report_data,
        receiving_office: newReportData.receiving_office,
        office_type: newReportData.office_type,
      })
      .then((res) => {
        setError("File saved successfully!", "success");
        router.push("/evaluate", { replace: true });
        sessionStorage.removeItem("newReportData");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to save file. Please try again.", "error");
        setLoading(false);
      });
  };

  const handleEditReport = (newReportData) => {
    setNewReportData((prev) => ({
      ...prev,
      report_data: newReportData,
    }));
  };

  const handleExportPDF = () => {
    Report_pdf({
      ...newReportData,
      sender_office: newReportData.sender_office_name,
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  // Reusable label + value pair
  const InfoRow = ({ label, value }) => (
    <>
      <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 700, color: "#111827", mb: 1 }}>
        {value || "—"}
      </Typography>
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container direction="row" spacing={4}>
        {/* Left side — Information Summary */}
        <Grid flex={1}>
          <Stack spacing={0.5} alignItems="flex-start">
            <IconButton onClick={() => router.back()}>
              <ArrowBackRoundedIcon fontSize="small" />
            </IconButton>

            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "#111827", textTransform: "uppercase", mb: 2 }}
            >
              Information Summary
            </Typography>

            <InfoRow label="Reference No." value={newReportData.refno} />
            <InfoRow label="Title" value={newReportData.title} />
            <InfoRow label="Type of Document" value={newReportData.type_name} />
            <InfoRow label="Classification" value={newReportData.classification_name} />

            {newReportData.office_type === "external" && (
              <InfoRow label="Receiving Office" value={newReportData.receiving_office_name} />
            )}

            <InfoRow label="Sender Office" value={newReportData.sender_office_name} />
            <InfoRow label="Sender Email" value={newReportData.sender_email} />
            <InfoRow label="Sender Phone" value={newReportData.sender_phone} />
            <InfoRow label="Sender Name" value={newReportData.sender_person} />

            <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
              File
            </Typography>
            <Chip
              label={newReportData.file_name || "No file selected"}
              variant="outlined"
              icon={<PictureAsPdfRoundedIcon color="error" />}
              sx={{
                borderStyle: "dashed",
                bgcolor: "#f7f7f7ff",
                fontWeight: 700,
                color: "#111827",
              }}
            />
          </Stack>
        </Grid>

        {/* Right side — Report */}
        <Grid flex={3}>
          <Card elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#111827", textTransform: "uppercase" }}
                >
                  Report
                </Typography>
                <IconButton size="small" onClick={handleExportPDF}>
                  <PrintRoundedIcon />
                </IconButton>
              </Stack>

              <Typography variant="caption" fontStyle="italic" sx={{ color: "#9ca3af" }}>
                powered by Gemini AI{" "}
                <AutoAwesomeRoundedIcon sx={{ fontSize: 10 }} />
              </Typography>

              {newReportData.report_data && (
                <ReportRenderer
                  reportData={newReportData.report_data}
                  documentType={newReportData.type_name}
                  onChange={handleEditReport}
                />
              )}
            </Stack>
          </Card>

          <Stack direction="row" justifyContent="center" spacing={2} mt={4}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CloseRoundedIcon />}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              disableElevation
              color="success"
              startIcon={<CheckRoundedIcon />}
              onClick={handleSave}
              loading={loading}
            >
              Save
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}