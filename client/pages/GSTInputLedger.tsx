import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import React from "react";
import type { DateRange } from "react-day-picker";

type Entry = {
  postedDate: string; // ISO date or any parsable string
  invoiceNumber?: string;
  vendorName?: string;
  description: string;
  rate?: number;
  debit?: number;
  credit?: number;
};

function formatNumber(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function GSTInputLedger() {
  const today = React.useMemo(() => new Date(), []);
  const startOfMonth = React.useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  }, []);

  const [range, setRange] = React.useState<DateRange | undefined>({ from: startOfMonth, to: today });
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<DateRange | undefined>(range);

  const allEntries = React.useMemo<Entry[]>(() => {
    return [
      { postedDate: "", description: "Opening Balance", debit: 0, credit: 0 },
      {
        postedDate: "2025-09-15",
        invoiceNumber: "Exp0001",
        vendorName: "ABC ELEC",
        description: "Being Audit Expense booked for Q2",
        rate: 18,
        debit: 18000,
      },
    ];
  }, []);

  const filtered = React.useMemo(() => {
    const s = range?.from ? new Date(range.from) : null;
    const e = range?.to ? new Date(range.to) : null;
    return allEntries.filter((it) => {
      if (!it.postedDate) return true;
      const d = new Date(it.postedDate);
      if (s && d < new Date(s.getFullYear(), s.getMonth(), s.getDate())) return false;
      if (e && d > new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999)) return false;
      return true;
    });
  }, [allEntries, range]);

  const [displayed, setDisplayed] = React.useState(filtered);
  React.useEffect(() => setDisplayed(filtered), [filtered]);

  const formatDate = (d?: Date) => (d ? d.toLocaleDateString() : "Start Date");
  const label = `${range?.from ? formatDate(range.from) : "Start Date"} - ${range?.to ? formatDate(range.to) : "End Date"}`;

  let running = 0;

  return (
    <AppShell>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>GST Input Ledger</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Popover open={open} onOpenChange={(v) => {
              if (v) {
                setPending(range);
              } else {
                setRange(pending);
              }
              setOpen(v);
            }}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[260px] justify-between">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4" /> {label}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="end">
                <div className="mb-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPending({ from: new Date(today.getFullYear(), today.getMonth(), 1), to: today })}>This Month</Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const last = new Date(today.getFullYear(), today.getMonth(), 0);
                    setPending({ from: first, to: last });
                  }}>Last Month</Button>
                  <Button size="sm" onClick={() => setPending(pending)}>Custom</Button>
                </div>
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={pending}
                  onSelect={(r) => setPending(r)}
                  defaultMonth={pending?.from || new Date()}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              onClick={() => toast({ title: "Export PDF", description: "Export will be integrated later." })}
            >
              Export PDF
            </Button>
            <Button onClick={() => toast({ title: "Export Excel", description: "Export will be integrated later." })}>
              Export Excel
            </Button>
          </div>
        </div>

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
                    <TableCell>{it.invoiceNumber || ""}</TableCell>
                    <TableCell>{it.vendorName || ""}</TableCell>
                    <TableCell className="max-w-[24rem] truncate" title={it.description}>{it.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{it.rate != null ? formatNumber(it.rate) : ""}</TableCell>
                    <TableCell className="text-right tabular-nums">{debit ? formatNumber(debit) : ""}</TableCell>
                    <TableCell className="text-right tabular-nums">{credit ? formatNumber(credit) : ""}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(running)}</TableCell>
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
