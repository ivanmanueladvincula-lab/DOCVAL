"use client";

import { IconButton, Stack, Typography } from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Report_pdf from "@/helper/printables/Report_pdf";
import ReportRenderer from "./ReportRenderer";

export default function ReportTab({ data }) {
  const reportData = JSON.parse(data.report);
  const handleExportPDF = () => {
    const pdfData = {
      doc_id: data.id, // ✅ needed for QR verification URL
      title: data.title,
      refno: data.reference_no,
      classification_name: data.doc_class,
      type_name: data.doc_type,
      sender_office: data.sender_office,
      generation_date: new Date(data.date_created).toISOString().split("T")[0],
      report_data: reportData,
    };

    Report_pdf(pdfData);
  };

  return (
    <div>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body1" sx={{ fontWeight: 700, color: "#111827" }}>
            Report
          </Typography>
          <IconButton size="small" onClick={handleExportPDF}>
            <PrintRoundedIcon />
          </IconButton>
        </Stack>
        <Typography variant="caption" fontStyle="italic" sx={{ color: "#6b7280" }}>
          powered by Gemini AI <AutoAwesomeRoundedIcon sx={{ fontSize: 10 }} />
        </Typography>
        <ReportRenderer reportData={reportData} documentType={data.doc_type} />
      </Stack>
    </div>
  );
}