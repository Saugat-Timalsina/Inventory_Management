import { jsPDF } from "jspdf";

type LedgerRow = {
  date: string;
  youGave: string;
  youGot: string;
  balance: string;
  note?: string;
};

export function downloadCustomerLedgerPdf(opts: {
  title: string;
  partyName: string;
  rows: LedgerRow[];
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;

  doc.setFillColor(91, 33, 182);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 56, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(opts.title, margin, 34);

  doc.setTextColor(20, 20, 30);
  doc.setFontSize(11);
  y = 72;
  doc.text(`Party: ${opts.partyName}`, margin, y);
  y += 28;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 100);
  doc.text("Date", margin, y);
  doc.text("You Gave", margin + 140, y);
  doc.text("You Got", margin + 230, y);
  doc.text("Balance", margin + 320, y);
  y += 14;
  doc.setDrawColor(220, 220, 235);
  doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
  y += 16;

  doc.setTextColor(30, 30, 40);
  for (const r of opts.rows) {
    if (y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = margin;
    }
    doc.text(r.date, margin, y);
    doc.setTextColor(225, 29, 72);
    doc.text(r.youGave, margin + 140, y);
    doc.setTextColor(5, 150, 105);
    doc.text(r.youGot, margin + 230, y);
    doc.setTextColor(30, 30, 40);
    doc.text(r.balance, margin + 320, y);
    y += 14;
    if (r.note) {
      doc.setTextColor(100, 100, 120);
      doc.text(r.note, margin + 20, y);
      y += 12;
      doc.setTextColor(30, 30, 40);
    }
    y += 6;
  }

  doc.save(`${opts.partyName.replace(/\s+/g, "_")}_khata.pdf`);
}
