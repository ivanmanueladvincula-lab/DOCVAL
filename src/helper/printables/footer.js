const set_dict_footer = (doc) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const footerY = pageHeight - margin - 10;
  const lineHeight = 3;

  doc.setFontSize(7);
  doc.setTextColor(0, 0, 128);
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    let yOffset = footerY;
    doc.setDrawColor(0, 0, 128); // Navy blue line
    doc.line(
      margin,
      yOffset,
      doc.internal.pageSize.getWidth() - margin,
      yOffset
    );
    yOffset += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.text(`DICT Headquarters, 807 EDSA,`, margin, yOffset);
    doc.text(
      `https://www.dict.gov.ph`,
      doc.internal.pageSize.getWidth() - margin,
      yOffset,
      { align: "right" }
    );
    yOffset += lineHeight;
    doc.text(`Diliman, Quezon City, 1103`, margin, yOffset);
    doc.text(
      `+632 8920 0101`,
      doc.internal.pageSize.getWidth() - margin,
      yOffset,
      { align: "right" }
    );
    yOffset += lineHeight;
    doc.text(`Philippines`, margin, yOffset);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Document Evaluation Report | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - margin - 10,
      yOffset + 5,
      { align: "right" }
    );
  }
};

export default set_dict_footer;
