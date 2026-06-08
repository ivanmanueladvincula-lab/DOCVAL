import jsPDF from "jspdf";
import set_dict_header from "./header";
import set_dict_footer from "./footer";
import QRCode from "qrcode";

// ✅ Generates QR code locally — no internet needed
const generateQRBase64 = async (text) => {
  return await QRCode.toDataURL(text, {
    width: 150,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });
};

const Report_pdf = async (data) => {
  let filename = `${data.title}_report`
    .replaceAll(" ", "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");
  const doc = new jsPDF();

  doc.setProperties({
    title: `${data.title} Report`,
    subject: "Document Evaluation Report",
    author: "DocVal",
    keywords: "document, evaluation, report, Gemini AI",
    creator: "DICT MISS-DWAD",
  });

  set_dict_header(doc);

  let yOffset = 50;
  const lineHeight = 5;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "Document Evaluation Report",
    doc.internal.pageSize.getWidth() / 2,
    yOffset,
    { align: "center" },
  );
  yOffset += lineHeight * 2;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // ref no
  doc.text(`Reference No.: ${data.refno}`, margin, yOffset);
  yOffset += lineHeight;
  // title
  const titleLines = doc.splitTextToSize(`Document name: ${data.title}`, 180);
  titleLines.forEach((line) => {
    if (yOffset + lineHeight > pageHeight - margin - 5) {
      doc.addPage();
      set_dict_header(doc);
      yOffset = 50;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
    }
    doc.text(line, margin, yOffset);
    yOffset += lineHeight;
  });
  // classification
  doc.text(
    `Document classification: ${data.classification_name}`,
    margin,
    yOffset,
  );
  yOffset += lineHeight;
  // type
  doc.text(`Document type: ${data.type_name}`, margin, yOffset);
  yOffset += lineHeight;
  // sender office
  doc.text(`Sender Office: ${data.sender_office}`, margin, yOffset);
  yOffset += lineHeight;
  // generation date
  doc.text(`Generation date: ${data.generation_date}`, margin, yOffset);
  yOffset += lineHeight * 2;

  const ensurePageSpace = (extra = lineHeight) => {
    if (yOffset + extra > pageHeight - margin - 5) {
      doc.addPage();
      set_dict_header(doc);
      yOffset = 50;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
    }
  };

  const sanitizeText = (text) => {
    if (!text) return "";
    const replacements = {
      "≤": "<=",
      "≥": ">=",
      "–": "-",
      "—": "-",
      "\u201C": '"',
      "\u201D": '"',
      "\u2018": "'",
      "\u2019": "'",
      "•": "-",
      "…": "...",
      "×": "x",
      "\u00A0": " ",
    };
    return text.replace(
      /[≤≥–—\u201C\u201D\u2018\u2019•…×\u00A0]/g,
      (char) => replacements[char] || char,
    );
  };

  const addSectionTitle = (title) => {
    yOffset += lineHeight;
    ensurePageSpace();
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, yOffset);
    yOffset += lineHeight;
    doc.setFont("helvetica", "normal");
  };

  const addParagraph = (text) => {
    const content = sanitizeText(text);
    if (!content) return;
    const lines = doc.splitTextToSize(content, 180);
    const align = lines.length > 1 ? "justify" : "left";
    const lineHeightFactor = 1.2;
    const renderHeight = lines.length * lineHeight;
    ensurePageSpace(renderHeight);
    doc.text(lines, margin, yOffset, {
      align,
      maxWidth: 180,
      lineHeightFactor,
    });
    yOffset += renderHeight;
  };

  const addBullets = (items) => {
    if (!Array.isArray(items) || items.length === 0) return;
    items.forEach((item, index) => {
      const bulletText = sanitizeText(`${index + 1}. ${item}`);
      const lines = doc.splitTextToSize(bulletText, 180);
      lines.forEach((line) => {
        ensurePageSpace();
        doc.text(line, margin, yOffset);
        yOffset += lineHeight;
      });
    });
  };

  const addPotentialIssues = (potentialIssues) => {
    if (!potentialIssues) return;
    const { compliance_issues, security_concerns } = potentialIssues;
    if (Array.isArray(compliance_issues) && compliance_issues.length > 0) {
      addSectionTitle("Compliance Issues");
      compliance_issues.forEach((issue, index) => {
        doc.setFont("helvetica", "italic");
        const issueText = sanitizeText(
          `${index + 1}. \"${issue.excerpt}\" [${issue.location}]`,
        );
        const issueLines = doc.splitTextToSize(issueText, 180);
        issueLines.forEach((line) => {
          ensurePageSpace();
          doc.text(line, margin, yOffset);
          yOffset += lineHeight;
        });
        doc.setFont("helvetica", "normal");
        addParagraph(`Explanation: ${sanitizeText(issue.explanation)}`);
      });
    }
    if (Array.isArray(security_concerns) && security_concerns.length > 0) {
      addSectionTitle("Security Concerns");
      security_concerns.forEach((issue, index) => {
        doc.setFont("helvetica", "italic");
        const issueText = sanitizeText(
          `${index + 1}. \"${issue.excerpt}\" [${issue.location}]`,
        );
        const issueLines = doc.splitTextToSize(issueText, 180);
        issueLines.forEach((line) => {
          ensurePageSpace();
          doc.text(line, margin, yOffset);
          yOffset += lineHeight;
        });
        doc.setFont("helvetica", "normal");
        addParagraph(`Explanation: ${sanitizeText(issue.explanation)}`);
      });
    }
  };

  const sectionRenderer = {
    summary: { title: "Summary", render: addParagraph },
    key_points: { title: "Key Points", render: addBullets },
    scope_of_work: { title: "Scope of Work", render: addParagraph },
    deliverables: { title: "Deliverables", render: addBullets },
    timeline: { title: "Timeline", render: addParagraph },
    budget_summary: { title: "Budget Summary", render: addParagraph },
    potential_issues: { title: "Potential Issues", render: addPotentialIssues },
    recommendations: { title: "Recommendations", render: addBullets },
    references: { title: "References", render: addBullets },
  };

  const docTypeSectionOrder = {
    "terms of reference": [
      "summary",
      "key_points",
      "scope_of_work",
      "deliverables",
      "timeline",
      "budget_summary",
      "potential_issues",
      "recommendations",
      "references",
    ],
  };

  const normalizedType = data.type_name?.trim().toLowerCase();
  const defaultOrder = Object.keys(sectionRenderer);
  const sectionOrder = docTypeSectionOrder[normalizedType] || defaultOrder;
  const reportData = data.report_data || {};

  sectionOrder.forEach((sectionKey) => {
    const section = sectionRenderer[sectionKey];
    const sectionData = reportData[sectionKey];
    if (!section || sectionData == null) return;
    if (Array.isArray(sectionData) && sectionData.length === 0) return;
    if (typeof sectionData === "string" && sectionData.trim() === "") return;
    addSectionTitle(section.title);
    section.render(sectionData);
  });

  // ✅ QR CODE VERIFICATION SECTION
  try {
    const verifyUrl = `${window.location.origin}/verify?id=${data.doc_id}`;
    const qrBase64 = await generateQRBase64(verifyUrl);

    // Add new page if not enough space
    if (yOffset + 60 > pageHeight - margin - 20) {
      doc.addPage();
      set_dict_header(doc);
      yOffset = 50;
    }

    yOffset += lineHeight * 2;

    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yOffset, doc.internal.pageSize.getWidth() - margin, yOffset);
    yOffset += lineHeight;

    // QR section title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text("DOCUMENT VERIFICATION", margin, yOffset);
    yOffset += lineHeight;

    // QR code image (40x40mm)
    doc.addImage(qrBase64, "PNG", margin, yOffset, 40, 40);

    // Text beside QR
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text("Scan to verify authenticity", margin + 45, yOffset + 6);
    doc.text("This report was generated by DocVal,", margin + 45, yOffset + 11);
    doc.text("the Document Evaluation System of DICT.", margin + 45, yOffset + 16);
    doc.text("Verification URL:", margin + 45, yOffset + 23);

    // URL as clickable link
    doc.setTextColor(0, 0, 200);
    doc.textWithLink(verifyUrl, margin + 45, yOffset + 28, { url: verifyUrl });
    doc.setTextColor(0, 0, 0);

    yOffset += 45;
  } catch (err) {
    console.error("QR generation failed:", err);
  }

  set_dict_footer(doc);
  doc.save(`${filename}.pdf`);
};

export default Report_pdf;