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
import { Textarea } from "@/components/ui/textarea";
import { useExpense, id, invoicedTotalForPR, prTotal } from "@/store/expense";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CreateInvoicePage() {
  const { prs, vendors, invoices, addInvoice } = useExpense();
  const navigate = useNavigate();

  const [number, setNumber] = useState("");
  const [prId, setPrId] = useState("");
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [desc, setDesc] = useState("");
  const [doc, setDoc] = useState<File | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  const pr = useMemo(() => prs.find((p) => p.id === prId), [prs, prId]);
  const vendor = useMemo(
    () => vendors.find((v) => v.id === pr?.vendorId),
    [vendors, pr],
  );

  const allAccounts = useMemo(
    () => Array.from(new Set(pr?.items.map((i) => i.accountId) || [])),
    [pr],
  );

  const selectedItems = useMemo(() => {
    if (!pr) return [] as typeof pr.items;
    return pr.items.filter(
      (i) =>
        selectedAccounts.includes(i.accountId) &&
        !removedItemIds.includes(i.id),
    );
  }, [pr, selectedAccounts, removedItemIds]);

  const totalSelected = useMemo(() => {
    return selectedItems.reduce((s, it) => {
      const base = Number(it.total) || 0;
      const gstPct = Number(it.gstRate || 0);
      const tdsPct = Number(it.tdsRate || 0);
      const maxAmt = Number(
        it.payable ?? base + (base * gstPct) / 100 - (base * tdsPct) / 100,
      );
      const entered = Number(amounts[it.id] ?? maxAmt);
      return s + entered;
    }, 0);
  }, [selectedItems, amounts]);

  const remainingForPR = useMemo(() => {
    if (!pr) return 0;
    const remaining = prTotal(pr) - invoicedTotalForPR(invoices, pr.id);
    return Math.max(0, remaining);
  }, [pr, invoices]);

  const anyOver = useMemo(() => {
    return selectedItems.some((it) => {
      const base = Number(it.total) || 0;
      const gstPct = Number(it.gstRate || 0);
      const tdsPct = Number(it.tdsRate || 0);
      const maxAmt = Number(
        it.payable ?? base + (base * gstPct) / 100 - (base * tdsPct) / 100,
      );
      const entered = Number(amounts[it.id] ?? maxAmt);
      return entered > maxAmt;
    });
  }, [selectedItems, amounts]);

  const error = !pr
    ? ""
    : anyOver
      ? "One or more item amounts exceed payable from PR."
      : totalSelected > remainingForPR
        ? `Invoice exceeds remaining PR amount (₹${remainingForPR.toLocaleString()}).`
        : "";

  const save = () => {
    if (
      !number.trim() ||
      !pr ||
      !date ||
      !dueDate ||
      selectedItems.length === 0 ||
      totalSelected <= 0 ||
      !!error
    )
      return;
    const inv = {
      id: id("INV"),
      prId: pr.id,
      vendorId: pr.vendorId,
      number: number.trim(),
      date,
      dueDate,
      description: desc || undefined,
      documentName: doc?.name,
      items: selectedItems.map((it) => {
        const base = Number(it.total) || 0;
        const gstPct = Number(it.gstRate || 0);
        const tdsPct = Number(it.tdsRate || 0);
        const maxAmt = Number(
          it.payable ?? base + (base * gstPct) / 100 - (base * tdsPct) / 100,
        );
        const entered = Number(amounts[it.id] ?? maxAmt);
        return { prItemId: it.id, amount: entered };
      }),
      total: totalSelected,
    };
    addInvoice(inv);
    navigate("/expense/invoices");
  };

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <h1 className="text-xl font-semibold">Create Invoice</h1>
          <div className="flex items-center gap-2">
            <Link to="/expense/invoices">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button
              onClick={save}
              disabled={
                !number ||
                !pr ||
                !date ||
                !dueDate ||
                selectedItems.length === 0 ||
                !!error
              }
            >
              Save
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-6">
            <Section title="Invoice Details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Invoice Number *">
                  <Input
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </Field>
                <Field label="Select PR *">
                  <Select
                    value={prId}
                    onValueChange={(v) => {
                      setPrId(v);
                      setSelectedAccounts([]);
                      setRemovedItemIds([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select PR" />
                    </SelectTrigger>
                    <SelectContent>
                      {prs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.id} — {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Invoice Date *">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Field>
                <Field label="Due Date *">
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </Field>
                <div className="sm:col-span-2 grid gap-2">
                  <Label>Invoice Document</Label>
                  <FileBox onChange={setDoc} />
                </div>
                <div className="sm:col-span-2 grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Type here"
                  />
                </div>
              </div>
            </Section>

            <Section title="PR Context">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="PR Title">
                  <Input readOnly value={pr?.title || "—"} />
                </Field>
                <Field label="PO Number">
                  <Input readOnly value={pr?.poNumber || "—"} />
                </Field>
                <Field label="Vendor Name">
                  <Input readOnly value={vendor?.name || "—"} />
                </Field>
              </div>
            </Section>

            <Section title="Select Expense Accounts">
              <div className="flex flex-wrap gap-2">
                {allAccounts.map((acc) => (
                  <label
                    key={acc}
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="accent-[hsl(var(--primary))]"
                      checked={selectedAccounts.includes(acc)}
                      onChange={(e) =>
                        setSelectedAccounts((s) =>
                          e.target.checked
                            ? [...s, acc]
                            : s.filter((x) => x !== acc),
                        )
                      }
                    />
                    {acc}
                  </label>
                ))}
              </div>
              <div className="mt-3 rounded-md border p-3 text-sm">
                <div className="font-medium">Items</div>
                {selectedItems.length === 0 ? (
                  <div className="text-muted-foreground">No items selected</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Base Amount</TableHead>
                        <TableHead>GST %</TableHead>
                        <TableHead>TDS %</TableHead>
                        <TableHead>Payable Amount (from PR)</TableHead>
                        <TableHead>Enter Amount</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItems.map((it) => {
                        const base = Number(it.total) || 0;
                        const gstPct = Number(it.gstRate || 0);
                        const tdsPct = Number(it.tdsRate || 0);
                        const amt = Number(
                          it.payable ??
                            base +
                              (base * gstPct) / 100 -
                              (base * tdsPct) / 100,
                        );
                        return (
                          <TableRow key={it.id}>
                            <TableCell className="font-medium">
                              {it.name}
                            </TableCell>
                            <TableCell>{it.accountId}</TableCell>
                            <TableCell>₹{base.toLocaleString()}</TableCell>
                            <TableCell>{gstPct}%</TableCell>
                            <TableCell>{tdsPct}%</TableCell>
                            <TableCell>₹{amt.toLocaleString()}</TableCell>
                            <TableCell className="max-w-40">
                              <Input
                                value={amounts[it.id] ?? amt}
                                onChange={(e) =>
                                  setAmounts((s) => ({
                                    ...s,
                                    [it.id]: Number(e.target.value),
                                  }))
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="secondary"
                                onClick={() =>
                                  setRemovedItemIds((s) => [...s, it.id])
                                }
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
                <div className="mt-2 font-semibold">
                  Total: ₹{totalSelected.toLocaleString()}
                </div>
                {error && (
                  <div className="mt-1 text-sm text-destructive">{error}</div>
                )}
              </div>
            </Section>
          </div>
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
