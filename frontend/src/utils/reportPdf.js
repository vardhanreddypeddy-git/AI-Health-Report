const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const PAGE_MARGIN = 32;
const COLUMN_GAP = 12;
const CARD_GAP = 10;
const CARD_HEIGHT = 130;
const CARD_WIDTH = (PAGE_WIDTH - PAGE_MARGIN * 2 - COLUMN_GAP * 2) / 3;
const ROWS_PER_PAGE = 3;
const CARDS_PER_PAGE = ROWS_PER_PAGE * 3;

function pdfText(value) {
  return String(value ?? "")
    .replace(/[µμ]/g, "u")
    .replace(/[–—]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E]/g, "?")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function wrapText(value, maxChars) {
  const words = pdfText(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    if (line && `${line} ${word}`.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function drawText(x, y, value, size = 10, font = "F1", color = "0.09 0.20 0.31") {
  return `BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfText(value)}) Tj ET\n`;
}

function drawRect(x, y, width, height, fill, stroke = null, lineWidth = 1) {
  let command = `${fill} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f\n`;
  if (stroke) {
    command += `${stroke} RG ${lineWidth} w ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S\n`;
  }
  return command;
}

function statusStyle(status) {
  if (status === "high") return { label: "HIGH", color: "0.85 0.15 0.15" };
  if (status === "low") return { label: "LOW", color: "0.85 0.40 0.00" };
  if (status === "normal") return { label: "NORMAL", color: "0.00 0.55 0.26" };
  return { label: String(status || "UNKNOWN").toUpperCase(), color: "0.35 0.40 0.45" };
}

function renderPage(biomarkers, pageIndex, pageCount, reportName, analysis) {
  const commands = [];
  const left = PAGE_MARGIN;
  const top = PAGE_HEIGHT - PAGE_MARGIN;
  commands.push(drawText(left, top, "AI HEALTH REPORT INTERPRETER", 16, "F2"));
  commands.push(drawText(left, top - 18, `${reportName}  |  ${(analysis.report_type || "laboratory").toUpperCase()}`, 9, "F1", "0.24 0.36 0.47"));
  commands.push(drawText(PAGE_WIDTH - 98, top, `Page ${pageIndex + 1} of ${pageCount}`, 9, "F1", "0.24 0.36 0.47"));

  const contentTop = top - 36;
  if (pageIndex === 0 && analysis.impression) {
    const impressionLines = wrapText(analysis.impression, 135).slice(0, 2);
    const impressionHeight = 28 + impressionLines.length * 12;
    const y = contentTop - impressionHeight;
    commands.push(drawRect(left, y, PAGE_WIDTH - PAGE_MARGIN * 2, impressionHeight, "0.94 0.98 1.00", "0.73 0.88 0.97"));
    commands.push(drawText(left + 12, y + impressionHeight - 15, "CLINICAL IMPRESSION", 9, "F2", "0.02 0.42 0.67"));
    impressionLines.forEach((line, index) => commands.push(drawText(left + 12, y + impressionHeight - 29 - index * 12, line, 9)));
  }

  const cardsTop = pageIndex === 0 && analysis.impression ? contentTop - 68 : contentTop - 10;
  const subset = biomarkers.slice(pageIndex * CARDS_PER_PAGE, (pageIndex + 1) * CARDS_PER_PAGE);
  subset.forEach((biomarker, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = left + column * (CARD_WIDTH + COLUMN_GAP);
    const y = cardsTop - (row + 1) * CARD_HEIGHT - row * CARD_GAP;
    const status = statusStyle(biomarker.status);
    commands.push(drawRect(x, y, CARD_WIDTH, CARD_HEIGHT, "1.00 1.00 1.00", "0.73 0.88 0.97"));
    commands.push(drawRect(x, y, 4, CARD_HEIGHT, status.color));
    commands.push(drawText(x + 12, y + CARD_HEIGHT - 21, wrapText(biomarker.name || "Test", 22)[0] || "Test", 11, "F2"));
    commands.push(drawText(x + CARD_WIDTH - 53, y + CARD_HEIGHT - 21, status.label, 8, "F2", status.color));
    commands.push(drawText(x + 12, y + CARD_HEIGHT - 49, `${biomarker.value ?? "N/A"} ${biomarker.unit || ""}`, 16, "F2"));
    const reference = biomarker.reference_range || (
      biomarker.reference_min != null || biomarker.reference_max != null
        ? `${biomarker.reference_min ?? ""} - ${biomarker.reference_max ?? ""}`
        : "Not provided"
    );
    commands.push(drawRect(x + 10, y + CARD_HEIGHT - 78, CARD_WIDTH - 20, 19, "0.94 0.98 1.00", "0.83 0.92 0.98", 0.5));
    commands.push(drawText(x + 16, y + CARD_HEIGHT - 71, `Reference range: ${reference}`, 8, "F1"));
    commands.push(drawText(x + 12, y + CARD_HEIGHT - 94, `Source page: ${biomarker.page || "-"}`, 8, "F1", "0.24 0.36 0.47"));
    const explanation = biomarker.status_explanation || "No additional explanation provided.";
    wrapText(explanation, 49).slice(0, 2).forEach((line, lineIndex) => {
      commands.push(drawText(x + 12, y + CARD_HEIGHT - 111 - lineIndex * 11, line, 8));
    });
  });

  commands.push(drawText(left, 16, "For educational purposes. Review results with a qualified healthcare professional.", 8, "F1", "0.35 0.40 0.45"));
  return commands.join("");
}

export function downloadReportPdf(analysis, filename = "Medical_Report") {
  const biomarkers = analysis.biomarkers || [];
  const pageCount = Math.max(1, Math.ceil(biomarkers.length / CARDS_PER_PAGE));
  const reportName = String(filename).replace(/\.pdf$/i, "").slice(0, 80);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ];
  const pageRefs = [];

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const pageObjectNumber = objects.length + 1;
    const contentObjectNumber = pageObjectNumber + 1;
    pageRefs.push(`${pageObjectNumber} 0 R`);
    const content = renderPage(biomarkers, pageIndex, pageCount, reportName, analysis);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
      `<< /Length ${content.length} >>\nstream\n${content}endstream`
    );
  }
  objects[1] = `<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pageRefs.length} >>`;

  let pdf = "%PDF-1.4\n%PDFGEN\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${reportName || "Medical_Report"}_Clinical_Analysis.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
