import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useExpense, PR, PRItem, ItemType, prTotal } from "@/store/expense";

export default function PurchaseRequest() {
  const { prs, addPR, updatePR } = useExpense();
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => prs.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())),
    [prs, q],
  );

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-0 py-3">
          <h1 className="text-xl font-semibold">Purchase Workflow</h1>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by PR title"
              className="w-72"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <CreatePR onSave={addPR as (p: PR) => void} />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR No</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Number of Items</TableHead>
                <TableHead>Approval Status</TableHead>
                <TableHead>PO Document</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.approved ? p.poNumber || "—" : "—"}</TableCell>
                  <TableCell>{p.requestDate}</TableCell>
                  <TableCell>₹{prTotal(p).toLocaleString()}</TableCell>
                  <TableCell>{p.items.length}</TableCell>
                  <TableCell>{p.approved ? "Approved" : "Pending"}</TableCell>
                  <TableCell>
                    {p.approved ? p.poDocumentName || "—" : "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-3">
                    <Link
                      to={`/expense/purchase/${p.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                    <EditPR
                      disabled={!!p.approved}
                      value={p}
                      onSave={updatePR as (p: PR) => void}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No PRs yet
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

function EditPR({
  value,
  onSave,
  disabled,
}: {
  value: PR;
  onSave: (p: PR) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(value.title);
  const [vendorId, setVendorId] = useState(value.vendorId);
  const [requestDate, setRequestDate] = useState(value.requestDate);
  const [requesterName, setRequesterName] = useState((value as any).requesterName || "");
  const [document, setDocument] = useState<File | null>(null);
  const [items, setItems] = useState<PRItem[]>(value.items);
  const { vendors } = useExpense();
  const allExpenseAccounts = useMemo(() => {
    const ids = new Set<string>();
    vendors.forEach((v) => v.expenseAccounts.forEach((a) => ids.add(a)));
    return Array.from(ids);
  }, [vendors]);

  const save = () => {
    if (!title.trim() || !vendorId || !requestDate || items.length === 0)
      return;
    const pr: PR = {
      ...value,
      title: title.trim(),
      vendorId,
      requestDate,
      requesterName: requesterName || undefined,
      documentName: document?.name || value.documentName,
      items,
    };
    onSave(pr);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={`text-blue-600 hover:underline ${disabled ? "pointer-events-none opacity-50" : ""}`}
          disabled={disabled}
        >
          Edit
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit PR</DialogTitle>
        </DialogHeader>
        <div className="grid gap-8">
          <Section title="Basic Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Title *">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Type Name here"
                />
              </Field>
              <Field label="Select Vendor *">
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Request Date *">
                <Input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                />
              </Field>
              <Field label="Requester Name">
                <Input value={requesterName} onChange={(e)=> setRequesterName(e.target.value)} />
              </Field>
              <div className="sm:col-span-2 grid gap-2">
                <Label>Document</Label>
                <FileBox onChange={setDocument} />
              </div>
              <div className="sm:col-span-2 grid gap-2">
                <Label>Description</Label>
                <Textarea placeholder="Type here" />
              </div>
            </div>
          </Section>
          <Section title="Item Details">
            <div className="space-y-4">
              {items.map((it, idx) => (
                <div key={it.id} className="rounded-md border p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Item Name *">
                      <Input
                        value={it.name}
                        onChange={(e) =>
                          updateItem(setItems, idx, { name: e.target.value })
                        }
                        placeholder="Type here"
                      />
                    </Field>
                    <Field label="Select Account *">
                      <Select
                        value={it.accountId}
                        onValueChange={(v) =>
                          updateItem(setItems, idx, { accountId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {allExpenseAccounts.map((acc) => (
                            <SelectItem key={acc} value={acc}>
                              {acc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Select Item Type *">
                      <Select
                        value={it.type}
                        onValueChange={(v) =>
                          updateItem(setItems, idx, { type: v as ItemType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Goods" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Goods">Goods</SelectItem>
                          <SelectItem value="Services">Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    {it.type === "Goods" && (
                      <Field label="Unit of Measure *">
                        <Select
                          value={it.uom}
                          onValueChange={(v) => updateItem(setItems, idx, { uom: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {UOMS.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                    <Field label="Quantity *">
                      <Input
                        value={it.qty}
                        onChange={(e) =>
                          updateQtyPrice(
                            setItems,
                            idx,
                            Number(e.target.value),
                            it.unitPrice,
                          )
                        }
                        placeholder="1"
                      />
                    </Field>
                    <Field label="Unit Price *">
                      <Input
                        value={it.unitPrice}
                        onChange={(e) =>
                          updateQtyPrice(
                            setItems,
                            idx,
                            it.qty,
                            Number(e.target.value),
                          )
                        }
                        placeholder="Type Here"
                      />
                    </Field>
                    <Field label="Total Price *">
                      <Input value={it.total} readOnly />
                    </Field>

                    <Field label="GST %">
                      <PercentCombobox
                        value={it.gstRate || ""}
                        options={["5", "8", "12"]}
                        onChange={(v) => updateAndRecalc(setItems, idx, { gstRate: v })}
                      />
                    </Field>
                    <Field label="GST Amount">
                      <Input value={(it.gstAmount ?? 0).toString()} readOnly />
                    </Field>

                    <Field label="Total Amount">
                      <Input
                        value={(
                          it.total +
                            it.total * (Number(it.gstRate || 0) / 100)
                        ).toString()}
                        readOnly
                      />
                    </Field>
                    <div className="lg:col-span-3 sm:col-span-2 grid gap-2">
                      <Label>Description *</Label>
                      <Textarea
                        value={it.description || ""}
                        onChange={(e) =>
                          updateItem(setItems, idx, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Type here"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setItems((s) => s.filter((_, i) => i !== idx))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() => setItems((s) => [...s, emptyItem()])}
              >
                Add Item
              </Button>
            </div>
          </Section>
          <div className="flex justify-end">
            <Button onClick={save}>Save PR</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const PO_CONFIG = { prefix: "PO", seqLength: 5 } as const;
function nextPONumber(year: number) {
  const key = `po-seq-${year}`;
  const cur = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, String(cur));
  const seq = String(cur).padStart(PO_CONFIG.seqLength, "0");
  return `${PO_CONFIG.prefix}-${year}-${seq}`;
}

function CreatePR({ onSave }: { onSave: (p: PR) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [items, setItems] = useState<PRItem[]>([emptyItem()]);
  const { vendors } = useExpense();
  const allExpenseAccounts = useMemo(() => {
    const ids = new Set<string>();
    vendors.forEach((v) => v.expenseAccounts.forEach((a) => ids.add(a)));
    return Array.from(ids);
  }, [vendors]);

  const save = () => {
    if (!title.trim() || !vendorId || !requestDate || items.length === 0)
      return;
    const yr = requestDate ? new Date(requestDate).getFullYear() : new Date().getFullYear();
    const pr: PR = {
      id: prNumber(),
      title: title.trim(),
      vendorId,
      requestDate,
      documentName: document?.name,
      poNumber: nextPONumber(yr),
      items,
      approved: true,
    };
    onSave(pr);
    setOpen(false);
    setTitle("");
    setVendorId("");
    setRequestDate("");
    setDocument(null);
    setItems([emptyItem()]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New PR</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add PR</DialogTitle>
        </DialogHeader>
        <div className="grid gap-8">
          <Section title="Basic Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Select Vendor *">
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Title *">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Type Name here"
                />
              </Field>
              <Field label="Request Date *">
                <Input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                />
              </Field>
              <div className="sm:col-span-2 grid gap-2">
                <Label>Document *</Label>
                <FileBox onChange={setDocument} />
              </div>
              <div className="sm:col-span-2 grid gap-2">
                <Label>Description</Label>
                <Textarea placeholder="Type here" />
              </div>
            </div>
          </Section>
          <Section title="Item Details">
            <div className="space-y-4">
              {items.map((it, idx) => (
                <div key={it.id} className="rounded-md border p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Item Name *">
                      <Input
                        value={it.name}
                        onChange={(e) =>
                          updateItem(setItems, idx, { name: e.target.value })
                        }
                        placeholder="Type here"
                      />
                    </Field>
                    <Field label="Select Account *">
                      <Select
                        value={it.accountId}
                        onValueChange={(v) =>
                          updateItem(setItems, idx, { accountId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {allExpenseAccounts.map((acc) => (
                            <SelectItem key={acc} value={acc}>
                              {acc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Select Item Type *">
                      <Select
                        value={it.type}
                        onValueChange={(v) =>
                          updateItem(setItems, idx, { type: v as ItemType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Goods" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Goods">Goods</SelectItem>
                          <SelectItem value="Services">Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    {it.type === "Goods" && (
                      <Field label="Unit of Measure *">
                        <Select
                          value={it.uom}
                          onValueChange={(v) => updateItem(setItems, idx, { uom: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {UOMS.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                    <Field label="Quantity *">
                      <Input
                        value={it.qty}
                        onChange={(e) =>
                          updateQtyPrice(
                            setItems,
                            idx,
                            Number(e.target.value),
                            it.unitPrice,
                          )
                        }
                        placeholder="1"
                      />
                    </Field>
                    <Field label="Unit Price *">
                      <Input
                        value={it.unitPrice}
                        onChange={(e) =>
                          updateQtyPrice(
                            setItems,
                            idx,
                            it.qty,
                            Number(e.target.value),
                          )
                        }
                        placeholder="Type Here"
                      />
                    </Field>
                    <Field label="Total Price *">
                      <Input value={it.total} readOnly />
                    </Field>

                    <Field label="GST %">
                      <PercentCombobox
                        value={it.gstRate || ""}
                        options={["5", "8", "12"]}
                        onChange={(v) => updateAndRecalc(setItems, idx, { gstRate: v })}
                      />
                    </Field>
                    <Field label="GST Amount">
                      <Input value={(it.gstAmount ?? 0).toString()} readOnly />
                    </Field>

                    <Field label="Total Amount">
                      <Input
                        value={(
                          it.total +
                            it.total * (Number(it.gstRate || 0) / 100)
                        ).toString()}
                        readOnly
                      />
                    </Field>
                    <div className="lg:col-span-3 sm:col-span-2 grid gap-2">
                      <Label>Description *</Label>
                      <Textarea
                        value={it.description || ""}
                        onChange={(e) =>
                          updateItem(setItems, idx, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Type here"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setItems((s) => s.filter((_, i) => i !== idx))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() => setItems((s) => [...s, emptyItem()])}
              >
                Add Item
              </Button>
            </div>
          </Section>
          <div className="flex justify-end">
            <Button onClick={save}>Save PR</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
function prNumber() {
  return `${new Date().getFullYear()}-PR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
function emptyItem(): PRItem {
  return {
    id: Math.random().toString(36).slice(2, 8),
    name: "",
    accountId: "",
    type: "Goods",
    uom: "Count",
    qty: 1,
    unitPrice: 0,
    total: 0,
    gstRate: "0",
    tdsRate: "0",
    gstAmount: 0,
    tdsAmount: 0,
    payable: 0,
  };
}
function updateItem(
  setter: React.Dispatch<React.SetStateAction<PRItem[]>>,
  index: number,
  patch: Partial<PRItem>,
) {
  setter((s) =>
    s.map((b, i) => (i === index ? recalc({ ...b, ...patch }) : b)),
  );
}
function updateAndRecalc(
  setter: React.Dispatch<React.SetStateAction<PRItem[]>>,
  index: number,
  patch: Partial<PRItem>,
) {
  setter((s) =>
    s.map((b, i) => (i === index ? recalc({ ...b, ...patch }) : b)),
  );
}
function updateQtyPrice(
  setter: React.Dispatch<React.SetStateAction<PRItem[]>>,
  index: number,
  qty: number,
  price: number,
) {
  const q = Number.isFinite(qty) ? qty : 0;
  const p = Number.isFinite(price) ? price : 0;
  setter((s) =>
    s.map((b, i) =>
      i === index
        ? recalc({
            ...b,
            qty: q,
            unitPrice: p,
            total: q * p,
          })
        : b,
    ),
  );
}
function recalc(item: PRItem): PRItem {
  const toNum = (v: any) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const totalN = toNum(item.total);
  const qtyN = toNum(item.qty);
  const unitN = toNum(item.unitPrice);
  const base = totalN || qtyN * unitN;
  const gstPct = toNum(item.gstRate || 0);
  const gstAmount = base * (gstPct / 100);
  const payable = base + gstAmount;
  return { ...item, total: base, gstAmount, tdsAmount: 0, payable };
}

function PercentCombobox({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          className="pr-8"
          placeholder="0"
        />
        <PopoverTrigger asChild>
          <Button variant="outline" className="absolute right-1 top-1.5 h-7 px-2">▼</Button>
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

const VENDORS = [
  { id: "V1", name: "ABC Suppliers" },
  { id: "V2", name: "XYZ Services" },
];
const ACCOUNTS = [
  { id: "A1", name: "Account 1" },
  { id: "A2", name: "Account 2" },
];
const UOMS = ["Count", "Kg", "Litre", "Hour"];
