"use client";

import { Button } from "@/components/ui/button";
import { downloadCustomerLedgerPdf } from "@/lib/pdf/ledger-pdf";

type Row = {
  date: string;
  youGave: string;
  youGot: string;
  balance: string;
  note?: string;
};

export function CustomerLedgerPdfButton({
  partyName,
  rows,
}: {
  partyName: string;
  rows: Row[];
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      onClick={() =>
        downloadCustomerLedgerPdf({
          title: "Customer Khata",
          partyName,
          rows,
        })
      }
    >
      PDF
    </Button>
  );
}
