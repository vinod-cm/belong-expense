import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExpense } from "@/store/expense";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function InvoiceAccounting() {
  const { prs, invoices, vendors } = useExpense();
  const [q, setQ] = useState("");

  const enriched = useMemo(
    () =>
      invoices.map((inv) => {
        const pr = prs.find((p) => p.id === inv.prId);
        const vendor = vendors.find((v) => v.id === inv.vendorId);
        return { inv, pr, vendorName: vendor?.name || inv.vendorId };
      }),
    [invoices, prs, vendors],
  );
  const filtered = useMemo(
    () =>
      enriched.filter((r) =>
        r.inv.number.toLowerCase().includes(q.toLowerCase()),
      ),
    [enriched, q],
  );

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-0 py-3">
          <h1 className="text-xl font-semibold">Invoice Accounting</h1>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by invoice number"
              className="w-72"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Link to="/expense/invoices/create">
              <Button>Create New Invoice</Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Invoice Amount</TableHead>
                <TableHead>Invoice Document</TableHead>
                <TableHead>Vendor Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(({ inv, pr, vendorName }) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.number}</TableCell>
                  <TableCell>{pr?.poNumber || "—"}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.dueDate || "—"}</TableCell>
                  <TableCell>₹{inv.total.toLocaleString()}</TableCell>
                  <TableCell>{inv.documentName || "—"}</TableCell>
                  <TableCell>{vendorName}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No invoices
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">
        {title}
      </h3>
      <div className="rounded-lg border bg-white p-4">{children}</div>
    </section>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function FileBox({ onChange }: { onChange: (file: File | null) => void }) {
  return (
    <label className="grid h-28 place-items-center rounded-md border-2 border-dashed text-sm text-muted-foreground">
      <div className="pointer-events-none select-none text-center">
        <div className="font-medium text-foreground">Upload</div>
      </div>
      <input
        type="file"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  );
}
