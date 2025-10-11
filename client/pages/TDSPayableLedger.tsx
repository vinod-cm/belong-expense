import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import React from "react";
import type { DateRange } from "react-day-picker";

type Entry = {
  postedDate: string; // ISO
  invoiceNumber?: string | number;
  vendorName?: string;
  description: string;
  rate?: number;
  debit?: number;
  credit?: number;
};

type MonthSummary = {
  id: string;
  date: string; // first day of month ISO (e.g., 2025-04-01)
  monthLabel: string; // e.g., April 2025
  payable: number;
  paid: number;
  dueDate: string; // display format
  status: "Paid" | "Unpaid";
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
  const [tab, setTab] = React.useState<"ledger" | "summary">("ledger");
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
        invoiceNumber: 1,
        vendorName: "ABC ELEC",
        description: "Being Audit Expense booked for Q2",
        rate: 10,
        credit: 10000,
      },
    ];
  }, []);

  const filtered = React.useMemo(() => {
    const s = range?.from ? new Date(range.from) : null;
    const e = range?.to ? new Date(range.to) : null;
    return allEntries.filter((it) => {
      if (!it.postedDate) return true; // opening balance row
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

  // Monthly summary state
  const currentFY = (() => {
    const y = today.getFullYear();
    const isAfterMarch = today.getMonth() >= 3; // Apr = 3
    const start = isAfterMarch ? y : y - 1;
    return `${start}-${start + 1}`;
  })();
  const [fy, setFy] = React.useState<string>(currentFY);

  const initialSummary: MonthSummary[] = React.useMemo(
    () => [
      { id: "2025-04", date: "2025-04-01", monthLabel: "April 2025", payable: 12000, paid: 12000, dueDate: "07/05/2025", status: "Paid" },
      { id: "2025-05", date: "2025-05-01", monthLabel: "May 2025", payable: 15000, paid: 0, dueDate: "07/06/2025", status: "Unpaid" },
      { id: "2025-06", date: "2025-06-01", monthLabel: "June 2025", payable: 8000, paid: 8000, dueDate: "07/07/2025", status: "Paid" },
    ],
    [],
  );
  const [summary, setSummary] = React.useState<MonthSummary[]>(initialSummary);

  const fyOf = (isoDate: string) => {
    const d = new Date(isoDate);
    const y = d.getFullYear();
    const isAfterMarch = d.getMonth() >= 3;
    const start = isAfterMarch ? y : y - 1;
    return `${start}-${start + 1}`;
  };

  const filteredSummary = React.useMemo(
    () => summary.filter((r) => fyOf(r.date) === fy),
    [summary, fy],
  );

  const rupee = (n: number) => `₹${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totals = React.useMemo(() => {
    return filteredSummary.reduce(
      (acc, r) => {
        acc.payable += r.payable;
        acc.paid += r.paid;
        return acc;
      },
      { payable: 0, paid: 0 },
    );
  }, [filteredSummary]);
  const outstandingTotal = totals.payable - totals.paid;

  const markPaid = (id: string) => {
    setSummary((prev) =>
      prev.map((r) => (r.id === id ? { ...r, paid: r.payable, status: "Paid" } : r)),
    );
  };

  let running = 0;

  const fyOptions = React.useMemo(() => {
    const years: string[] = [];
    const start = parseInt(currentFY.split("-")[0], 10);
    for (let i = -1; i <= 2; i++) {
      const s = start + i;
      years.push(`${s}-${s + 1}`);
    }
    return years;
  }, [currentFY]);

  return (
    <AppShell>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="ledger">Ledger View</TabsTrigger>
              <TabsTrigger value="summary">Monthly Summary</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="ml-auto flex items-center gap-2">
            {tab === "ledger" && (
              <Popover
                open={open}
                onOpenChange={(v) => {
                  if (v) {
                    setPending(range);
                  } else {
                    setRange(pending);
                  }
                  setOpen(v);
                }}
              >
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
            )}
            {tab === "ledger" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Export PDF", description: "Export will be integrated later." })}
                >
                  Export PDF
                </Button>
                <Button onClick={() => toast({ title: "Export Excel", description: "Export will be integrated later." })}>
                  Export Excel
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsContent value="ledger">
            <section className="mt-4 rounded-lg border bg-white p-3">
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
          </TabsContent>

          <TabsContent value="summary">
            <section className="mt-4 rounded-lg border bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">TDS Payable – Monthly Summary</h2>
              </div>

              <div className="mt-4 grid gap-2 sm:max-w-xs">
                <label className="text-sm font-medium">Filter by Financial Year</label>
                <Select value={fy} onValueChange={setFy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select FY" />
                  </SelectTrigger>
                  <SelectContent>
                    {fyOptions.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Total TDS Payable</TableHead>
                      <TableHead className="text-right">Outstanding TDS</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSummary.map((r) => {
                      const outstanding = Math.max(0, r.payable - r.paid);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.monthLabel}</TableCell>
                          <TableCell className="text-right tabular-nums">{rupee(r.payable)}</TableCell>
                          <TableCell className="text-right tabular-nums">{rupee(outstanding)}</TableCell>
                          <TableCell>{r.dueDate}</TableCell>
                          <TableCell>
                            <span className={r.status === "Paid" ? "text-green-600" : "text-destructive"}>{r.status}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            {r.status === "Unpaid" ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm">Mark as Paid</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Mark as Paid?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will set Total TDS Paid equal to Total TDS Payable and Outstanding TDS to 0 for {r.monthLabel}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => markPaid(r.id)}>Confirm</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{rupee(totals.payable)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{rupee(outstandingTotal)}</TableCell>
                      <TableCell colSpan={3}></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
