import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import React from "react";

type Entry = {
  postedDate: string; // ISO
  invoiceNumber?: string | number;
  vendorName?: string;
  description: string;
  rate?: number;
  debit?: number;
  credit?: number;
};

function formatNumber(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatBalance(n: number): string {
  const abs = Math.abs(n);
  const s = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `(${s})` : s;
}

export default function TDSPayableLedger() {
  const today = React.useMemo(() => new Date(), []);
  const startOfMonth = React.useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  }, []);

  const [startDate, setStartDate] = React.useState<string>(startOfMonth.toISOString().slice(0, 10));
  const [endDate, setEndDate] = React.useState<string>(today.toISOString().slice(0, 10));

  const allEntries = React.useMemo<Entry[]>(() => {
    return [
      { postedDate: "", description: "Opening Balance", debit: 0, credit: 0 },
      {
        postedDate: "2025-09-15",
        invoiceNumber: 1,
        vendorName: "ABC ELEC",
        description: "Being Audit Expense booked for Q2",
        rate: 10,
        credit: 10000,
      },
    ];
  }, []);

  const filtered = React.useMemo(() => {
    const s = startDate ? new Date(startDate) : null;
    const e = endDate ? new Date(endDate) : null;
    return allEntries.filter((it) => {
      if (!it.postedDate) return true; // opening balance row
      const d = new Date(it.postedDate);
      if (s && d < new Date(s.getFullYear(), s.getMonth(), s.getDate())) return false;
      if (e && d > new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999)) return false;
      return true;
    });
  }, [allEntries, startDate, endDate]);

  const [displayed, setDisplayed] = React.useState(filtered);
  React.useEffect(() => setDisplayed(filtered), [filtered]);

  const onFilter = () => setDisplayed(filtered);

  let running = 0;

  return (
    <AppShell>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <h1 className="text-xl font-semibold text-center">TDS Payable Ledger</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast({ title: "Export as PDF", description: "Export will be integrated later." })}
            >
              Export as PDF
            </Button>
            <Button
              onClick={() => toast({ title: "Export as Excel", description: "Export will be integrated later." })}
            >
              Export as Excel
            </Button>
          </div>
        </div>

        <div className="mt-1 text-center text-sm text-muted-foreground">
          Period: {startDate ? new Date(startDate).toLocaleDateString() : "—"} - {endDate ? new Date(endDate).toLocaleDateString() : "—"}
        </div>

        <section className="mt-6 rounded-lg border bg-white p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <div className="grid gap-2 sm:col-span-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={onFilter}>Filter</Button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border bg-white p-3">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold">Posted Date</TableHead>
                <TableHead className="font-semibold">Invoice Number</TableHead>
                <TableHead className="font-semibold">Vendor Name</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="text-right font-semibold">Rate</TableHead>
                <TableHead className="text-right font-semibold">Debit Amount</TableHead>
                <TableHead className="text-right font-semibold">Credit Amount</TableHead>
                <TableHead className="text-right font-semibold">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((it, idx) => {
                const isOpening = !it.postedDate;
                const debit = Number(it.debit || 0);
                const credit = Number(it.credit || 0);
                running = isOpening ? 0 : running + debit - credit;
                return (
                  <TableRow key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                    <TableCell>{isOpening ? "" : new Date(it.postedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{it.invoiceNumber ?? ""}</TableCell>
                    <TableCell>{it.vendorName || ""}</TableCell>
                    <TableCell className="max-w-[24rem] truncate" title={it.description}>{it.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{it.rate != null ? formatNumber(it.rate) : ""}</TableCell>
                    <TableCell className="text-right tabular-nums">{debit ? formatNumber(debit) : ""}</TableCell>
                    <TableCell className="text-right tabular-nums">{credit ? formatNumber(credit) : ""}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatBalance(running)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      </div>
    </AppShell>
  );
}
