"use client";

import { IconButton } from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Report_pdf from "@/helper/printables/Report_pdf";
import ReportRenderer from "./ReportRenderer";

export default function ReportTab({ data }) {
  const reportData = JSON.parse(data.report);
  
  const handleExportPDF = () => {
    const pdfData = {
      doc_id: data.id, 
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
            AI Evaluation Report
          </h2>
          {/* Beautiful Gradient Badge for Gemini AI */}
          <div className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-800/50 shadow-sm">
            <AutoAwesomeRoundedIcon className="text-purple-600 dark:text-purple-400" sx={{ fontSize: 14 }} />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 text-transparent bg-clip-text font-extrabold text-[10px] uppercase tracking-wider">
              Powered by Gemini AI
            </span>
          </div>
        </div>

        <IconButton 
          size="small" 
          onClick={handleExportPDF}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300"
        >
          <PrintRoundedIcon fontSize="small" />
        </IconButton>
      </div>

      {/* Render the actual report content */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm">
        <ReportRenderer reportData={reportData} documentType={data.doc_type} />
      </div>
    </div>
  );
}