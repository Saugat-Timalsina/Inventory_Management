"use client";

import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";

export function ReportsPdfButton({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        doc.setFontSize(14);
        doc.text(title, 40, 48);
        doc.setFontSize(10);
        let y = 72;
        for (const line of lines) {
          doc.text(line, 40, y);
          y += 18;
        }
        doc.save("report.pdf");
      }}
    >
      Download PDF
    </Button>
  );
}
