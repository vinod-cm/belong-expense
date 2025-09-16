import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useExpense, id, prTotal, invoicedTotalForPR } from "@/store/expense";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CreateInvoicePage() {
  const { prs, vendors, invoices, addInvoice } = useExpense();
  const navigate = useNavigate();

  const approvedPOs = useMemo(() => prs.filter((p) => p.approved && p.poNumber), [prs]);

  const [number, setNumber] = useState("");
  const [prId, setPrId] = useState("");
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [desc, setDesc] = useState("");
  const [doc, setDoc] = useState<File | null>(null);

  const pr = useMemo(() => approvedPOs.find((p) => p.id === prId), [approvedPOs, prId]);
  const vendor = useMemo(() => vendors.find((v) => v.id === pr?.vendorId), [vendors, pr]);

  // Expense accounts limited to those used in the selected PR
  const allowedAccounts = useMemo(() => {
    return Array.from(new Set(pr?.items.map((i) => i.accountId) || []));
  }, [pr]);
  type Row = { id: string; accountId: string; amount: string; gstPct: string; tdsPct: string };
  const emptyRow = (): Row => ({ id: id("ROW"), accountId: "", amount: "", gstPct: "", tdsPct: "" });
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const addRow = () => setRows((s) => [...s, emptyRow()]);
  const removeRow = (rid: string) => setRows((s) => s.filter((r) => r.id !== rid));
  const updateRow = (rid: string, patch: Partial<Row>) => setRows((s) => s.map((r) => (r.id === rid ? { ...r, ...patch } : r)));

  // Row computations and totals
  const rowCalc = (r: Row) => {
    const base = Number(r.amount) || 0;
    const gst = base * ((Number(r.gstPct) || 0) / 100);
    const tds = base * ((Number(r.tdsPct) || 0) / 100);
    const total = base + gst - tds;
    return { base, gst, tds, total };
  };
  const total = useMemo(() => rows.reduce((s, r) => s + rowCalc(r).total, 0), [rows]);
  const remainingForPR = useMemo(() => (pr ? Math.max(0, prTotal(pr) - invoicedTotalForPR(invoices, pr.id)) : 0), [pr, invoices]);
  const exceeds = !!pr && total > remainingForPR;

  const canSave =
    !!number.trim() &&
    !!pr &&
    !!date &&
    !!dueDate &&
    rows.length > 0 &&
    rows.every((r) => r.accountId && Number(r.amount) > 0) &&
    !exceeds &&
    total > 0;

  const save = () => {
    if (!canSave) return;
    addInvoice({
      id: id("INV"),
      prId: pr!.id,
      vendorId: pr!.vendorId,
      number: number.trim(),
      date,
      dueDate,
      description: desc || undefined,
      documentName: doc?.name,
      items: [],
      total,
    });
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
            <Button onClick={save} disabled={!canSave}>
              Save
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-6">
            <Section title="Invoice Details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Invoice Number *">
                  <Input value={number} onChange={(e) => setNumber(e.target.value)} />
                </Field>
                <Field label="Select PO Number *">
                  <Select
                    value={prId}
                    onValueChange={(v) => {
                      setPrId(v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select PO" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedPOs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.poNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Vendor Name">
                  <Input readOnly value={vendor?.name || "—"} />
                </Field>
                <Field label="Invoice Date *">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
                <Field label="Due Date *">
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </Field>
                <div className="sm:col-span-2 grid gap-2">
                  <Label>Invoice Document</Label>
                  <FileBox onChange={setDoc} />
                </div>
                <div className="sm:col-span-2 grid gap-2">
                  <Label>Description</Label>
                  <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Type here" />
                </div>
              </div>
            </Section>

            <Section title="Accounting Details">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Accounts from selected PR</div>
                  <Button variant="secondary" onClick={addRow}>Add Account</Button>
                </div>
                {rows.length === 0 ? (
                  <div className="rounded-md border p-3 text-sm text-muted-foreground">No accounts added</div>
                ) : (
                  <div className="space-y-3">
                    {rows.map((r) => {
                      const calc = rowCalc(r);
                      return (
                        <div key={r.id} className="grid grid-cols-1 gap-3 sm:grid-cols-7">
                          <Field label="Expense Account *">
                            <Select value={r.accountId} onValueChange={(v) => updateRow(r.id, { accountId: v })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {allowedAccounts.map((acc) => (
                                  <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Amount *">
                            <Input value={r.amount} onChange={(e) => updateRow(r.id, { amount: e.target.value })} />
                          </Field>
                          <Field label="GST %">
                            <PercentCombobox value={r.gstPct} options={["5","8","12","18"]} onChange={(v) => updateRow(r.id, { gstPct: v })} />
                          </Field>
                          <Field label="TDS %">
                            <PercentCombobox value={r.tdsPct} options={["1","2","10"]} onChange={(v) => updateRow(r.id, { tdsPct: v })} />
                          </Field>
                          <Field label="GST Amt">
                            <Input readOnly value={calc.gst.toString()} />
                          </Field>
                          <Field label="TDS Amt">
                            <Input readOnly value={calc.tds.toString()} />
                          </Field>
                          <div className="grid gap-2">
                            <Label>Row Total</Label>
                            <div className="flex items-center gap-2">
                              <Input readOnly value={calc.total.toString()} />
                              <Button variant="secondary" onClick={() => removeRow(r.id)}>Remove</Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-2 font-semibold">Total: ₹{total.toLocaleString()}</div>
                {exceeds && (
                  <div className="text-sm text-destructive">Total exceeds remaining amount for PR (₹{remainingForPR.toLocaleString()}).</div>
                )}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">{title}</h3>
      <div className="rounded-lg border bg-white p-4">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
      <input type="file" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </label>
  );
}

function PercentCombobox({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <Input value={value || ""} onChange={(e) => onChange(e.target.value)} onFocus={() => setOpen(true)} className="pr-8" placeholder="0" />
        <PopoverTrigger asChild>
          <Button variant="outline" className="absolute right-1 top-1.5 h-7 px-2">
            ▼
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="end" className="p-0 w-56">
        <Command>
          <CommandInput placeholder="Search %" />
          <CommandEmpty>No options</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o} onSelect={() => { onChange(o); setOpen(false); }}>
                  {o}%
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
