const set_dict_header = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const logoSize = 20;

  // Use string paths for public folder images
  doc.addImage("/dict_logo.png", "PNG", margin, margin, logoSize, logoSize);

  doc.setFontSize(10);
  doc.setFont("Times New Roman", "normal");
  doc.setTextColor(0, 0, 128);
  doc.text(
    "REPUBLIC OF THE PHILIPPINES",
    margin + logoSize + 40,
    margin + logoSize / 2 - 4,
    { align: "center" }
  );

  // Horizontal line under "REPUBLIC OF THE PHILIPPINES"
  doc.setDrawColor(0, 0, 128); // Navy blue line
  doc.line(
    margin + logoSize + 5,
    margin + logoSize / 2 - 2,
    margin + logoSize + 5 + 70,
    margin + logoSize / 2 - 2
  );

  // "DEPARTMENT OF INFORMATION TECHNOLOGY" below the line
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(
    "DEPARTMENT OF INFORMATION AND",
    margin + logoSize + 40,
    margin + logoSize / 2 + 2,
    { align: "center" }
  );
  doc.text(
    "COMMUNICATIONS TECHNOLOGY",
    margin + logoSize + 40,
    margin + logoSize / 2 + 6,
    { align: "center" }
  );

  doc.addImage(
    "/bagong_pilipinas.png",
    "PNG",
    pageWidth - margin - logoSize - 10,
    margin - 5,
    logoSize + 10,
    logoSize + 10
  );

  doc.setDrawColor(0, 0, 128);
  doc.line(
    margin,
    margin + logoSize + 5,
    pageWidth - margin,
    margin + logoSize + 5
  );
};

export default set_dict_header;
