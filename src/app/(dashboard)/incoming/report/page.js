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
import { useProtectedRoute } from "@/helper/ProtectedRoutes";
import { useError } from "@/helper/ErrorContext";
import axiosInstance from "@/helper/Axios";
import ReportRenderer from "@/components/ReportRenderer";

export default function Report() {
  const { session, status } = useProtectedRoute();
  const { setError } = useError();
  const [loading, setLoading] = useState(true);
  const [newReportData, setNewReportData] = useState({});

  const router = useRouter();

  // get data from session storage and IndexedDB
  useEffect(() => {
    const storedData =
      JSON.parse(sessionStorage.getItem("newReportData")) || {};

    if (storedData.report_id) {
      // Retrieve large data from IndexedDB
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
    router.back();
    sessionStorage.removeItem("newReportData");
  };

  const handleSave = () => {
    // console.log("Saving report...", newReportData);
    // save logic here
    setLoading(true);
    axiosInstance
      .put("/document/createFile", {
        fileId: newReportData.id,
        report: newReportData.report_data,
        status: "Completed",
      })
      .then((res) => {
        console.log(res);
        setError(res.message, "success");
        router.push("/incoming", { replace: true });
        sessionStorage.removeItem("newReportData");
        // setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to save file. Please try again.", "error");
        setLoading(false);
      });
  };

  const handleExportPDF = () => {
    console.log("report", newReportData.report_data);
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

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container direction="row" spacing={4}>
        <Grid flex={1}>
          <Stack spacing={1} alignItems="flex-start">
            <IconButton onClick={() => router.back()}>
              <ArrowBackRoundedIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight="bold"
              textTransform="uppercase"
            >
              Information Summary
            </Typography>
            <Typography variant="body2" color="text.disabled">
              reference no.
            </Typography>
            <Typography variant="body1" gutterBottom>
              {newReportData.reference_no}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              title
            </Typography>
            <Typography variant="body1" gutterBottom>
              {newReportData.title}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              type of document
            </Typography>
            <Typography variant="body1" gutterBottom>
              {newReportData.doc_type}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              classification
            </Typography>
            <Typography variant="body1" gutterBottom>
              {newReportData.doc_class}
            </Typography>

            <Typography variant="body2" color="text.disabled">
              receiving office
            </Typography>
            <Typography variant="body1" gutterBottom>
              {newReportData.receiving_office}
            </Typography>

            <Typography variant="body2" color="text.disabled">
              sender office
            </Typography>
            <Typography variant="body1" gutterBottom>
              {newReportData.sender_office}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              sender email
            </Typography>
            <Typography variant="body1" gutterBottom>
              {newReportData.sender_email}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              sender phone
            </Typography>
            <Typography variant="body1" gutterBottom>
              {newReportData.sender_phone}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              sender name
            </Typography>
            <Typography variant="body1" gutterBottom>
              {newReportData.sender_person}
            </Typography>

            <Typography variant="body2" color="text.disabled">
              file
            </Typography>
            <Chip
              label={newReportData.file_name || "No file selected"}
              variant="outlined"
              icon={<PictureAsPdfRoundedIcon color="error" />}
              sx={{
                borderStyle: "dashed",
                bgcolor: "#f7f7f7ff",
              }}
            />
          </Stack>
        </Grid>
        <Grid flex={3}>
          <Card elevation={0} sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Report
                </Typography>
                <IconButton size="small" onClick={handleExportPDF}>
                  <PrintRoundedIcon />
                </IconButton>
              </Stack>
              <Typography
                variant="caption"
                fontStyle="italic"
                color="text.disabled"
              >
                powered by Gemini AI{" "}
                <AutoAwesomeRoundedIcon sx={{ fontSize: 10 }} />
              </Typography>
              {newReportData.report_data && (
                <ReportRenderer
                  reportData={newReportData.report_data}
                  documentType={newReportData.doc_type}
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
              cancel
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
              save
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
