import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface BankAccount {
  id: string;
  bankName: string;
  branch: string;
  ifsc: string;
  accNo: string;
  accHolder: string;
  doc?: File | null;
}
interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  address?: string;
  state?: string;
  active: boolean;
  legalType?: string;
  vendorTypeId?: string;
  accountType: string;
  startDate?: string;
  endDate?: string;
  oneTime?: boolean;
  expenseAccounts: string[];
  compliance: {
    gstin?: string;
    pan?: string;
    tan?: string;
    tdsSection?: string;
    tdsRate?: string;
    gstRate?: string;
    msmeNumber?: string;
  };
  documents: {
    registration?: File | null;
    gstCert?: File | null;
    panCard?: File | null;
    aadhaar?: File | null;
  };
  bank: BankAccount[];
}
interface ExpenseAccountOption {
  id: string;
  name: string;
}

import { useExpense, Vendor as StoreVendor } from "@/store/expense";

export default function Vendors() {
  const { vendors, vendorTypes, addVendor, updateVendor, removeVendor } =
    useExpense();
  const [q, setQ] = useState("");
  const expenseOptions = [
    { id: "ACC1", name: "Account 1" },
    { id: "ACC2", name: "Account 2" },
  ];

  const filtered = useMemo(
    () => vendors.filter((v) => v.name.toLowerCase().includes(q.toLowerCase())),
    [vendors, q],
  );

  const vtName = (id?: string) =>
    vendorTypes.find((t) => t.id === id)?.name || "—";

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-0 py-3">
          <h1 className="text-xl font-semibold">Vendors</h1>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by vendor name"
              className="w-72"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <CreateVendor
              onSave={addVendor}
              expenseOptions={expenseOptions}
            />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Email Id</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Legal Type</TableHead>
                <TableHead>Vendor Type</TableHead>
                <TableHead>Linked Expense Account</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.phone}</TableCell>
                  <TableCell>{v.email}</TableCell>
                  <TableCell className="max-w-40 truncate">
                    {v.address}
                  </TableCell>
                  <TableCell>{v.state}</TableCell>
                  <TableCell>{v.legalType}</TableCell>
                  <TableCell>{vtName(v.vendorTypeId)}</TableCell>
                  <TableCell>
                    {v.expenseAccounts
                      .map(
                        (x) =>
                          expenseOptions.find((o) => o.id === x)?.name || x,
                      )
                      .join(", ")}
                  </TableCell>
                  <TableCell>{v.startDate || "—"}</TableCell>
                  <TableCell>{v.endDate || "—"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 text-green-600">
                      <span className="size-2 rounded-full bg-green-500" />{" "}
                      {v.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-3">
                    <Link to={`/vendors/${v.id}`} className="text-gray-700 hover:underline">
                      View Details
                    </Link>
                    <Link to={`/vendors/${v.id}/edit`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => removeVendor(v.id)}
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <div className="mx-auto mb-2 grid size-16 place-items-center rounded-full border border-dashed">
                      <span className="text-3xl">📄</span>
                    </div>
                    "No updates here"
                    <div className="text-xs text-muted-foreground">
                      "But your community is always buzzing—check back soon!"
                    </div>
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

function CreateVendor({
  onSave,
  expenseOptions,
}: {
  onSave: (v: StoreVendor) => void;
  expenseOptions: ExpenseAccountOption[];
}) {
  return (
    <VendorDialog
      title="Add Vendor"
      onSubmit={onSave}
      expenseOptions={expenseOptions}
    />
  );
}

function VendorDialog({
  title,
  onSubmit,
  expenseOptions,
}: {
  title: string;
  onSubmit: (v: StoreVendor) => void;
  expenseOptions: ExpenseAccountOption[];
}) {
  const { vendorTypes } = useExpense();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [legalType, setLegalType] = useState("");
  const [vendorTypeId, setVendorTypeId] = useState("");
  const [accountType, setAccountType] = useState("");
  const [frequency, setFrequency] = useState<"One Time" | "Recurring">("Recurring");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expenseAccounts, setExpenseAccounts] = useState<string[]>([]);

  // Compliance
  const [isGstRegistered, setIsGstRegistered] = useState(false);
  const [gstin, setGstin] = useState("");
  const [nonGstDoc, setNonGstDoc] = useState<File | null>(null);
  const [pan, setPan] = useState("");
  const [tan, setTan] = useState("");
  const [tdsSection, setTdsSection] = useState("");
  const [isMsme, setIsMsme] = useState(false);
  const [msmeNumber, setMsmeNumber] = useState("");
  const [msmeDoc, setMsmeDoc] = useState<File | null>(null);

  const [bank, setBank] = useState<BankAccount[]>([emptyBank()]);

  const save = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) return;
    if (isGstRegistered ? !gstin.trim() : !nonGstDoc) return;
    if (!legalType) return;
    if (expenseAccounts.length === 0) return;
    const vendor: StoreVendor = {
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim() || undefined,
      address: address.trim() || undefined,
      state: state || undefined,
      active: true,
      legalType: legalType || undefined,
      vendorTypeId: vendorTypeId || undefined,
      accountType: accountType || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      oneTime: frequency === "One Time",
      expenseAccounts,
      compliance: {
        isGstRegistered: isGstRegistered || undefined,
        gstin: gstin || undefined,
        pan: pan || undefined,
        tan: tan || undefined,
        tdsSection: tdsSection || undefined,
        msme: isMsme || undefined,
        msmeNumber: isMsme ? msmeNumber || undefined : undefined,
      },
      documents: {
        nonGstDocName: nonGstDoc?.name,
        msmeDocName: msmeDoc?.name,
      },
      bank,
    };
    onSubmit(vendor);
    setOpen(false);
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setAddress("");
    setState("");
    setLegalType("");
    setVendorTypeId("");
    setAccountType("");
    setFrequency("Recurring");
    setStartDate("");
    setEndDate("");
    setExpenseAccounts([]);
    setIsGstRegistered(false);
    setGstin("");
    setNonGstDoc(null);
    setPan("");
    setTan("");
    setTdsSection("");
    setIsMsme(false);
    setMsmeNumber("");
    setMsmeDoc(null);
    setBank([emptyBank()]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Vendor</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-8">
          <Section title="Basic Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="v-name">Vendor Name *</Label>
                <Input id="v-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="v-email">Email *</Label>
                <Input required id="v-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="v-phone">Phone *</Label>
                <Input required id="v-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="v-state">State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Vendor Type</Label>
                <Select value={vendorTypeId} onValueChange={setVendorTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vendor Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 grid gap-2">
                <Label>Address</Label>
                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
              </div>
              <div className="sm:col-span-2 grid gap-2">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
              </div>
            </div>
          </Section>

          <Section title="Banking Info">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Account Type">
                  <Select value={accountType} onValueChange={setAccountType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Account Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              {bank.map((b, idx) => (
                <div key={b.id} className="rounded-md border p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Bank Name *">
                      <Input value={b.bankName} onChange={(e) => updateBank(setBank, idx, { bankName: e.target.value })} placeholder="Type Here" />
                    </Field>
                    <Field label="Branch Name *">
                      <Input value={b.branch} onChange={(e) => updateBank(setBank, idx, { branch: e.target.value })} placeholder="Type Here" />
                    </Field>
                    <Field label="IFSC Code *">
                      <Input value={b.ifsc} onChange={(e) => updateBank(setBank, idx, { ifsc: e.target.value })} placeholder="Type Here" />
                    </Field>
                    <Field label="Account Holder Name *">
                      <Input value={b.accHolder} onChange={(e) => updateBank(setBank, idx, { accHolder: e.target.value })} placeholder="Type Here" />
                    </Field>
                    <Field label="Account Number *">
                      <Input value={b.accNo} onChange={(e) => updateBank(setBank, idx, { accNo: e.target.value })} placeholder="Type Here" />
                    </Field>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setBank((s) => s.filter((_, i) => i !== idx))}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="secondary" onClick={() => setBank((s) => [...s, emptyBank()])}>
                Add Bank Account
              </Button>
            </div>
          </Section>

          <Section title="Settings">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Vendor Frequency">
                <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="One Time">One Time</SelectItem>
                    <SelectItem value="Recurring">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Start Date">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </Field>
              <Field label="End Date">
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </Field>
              <div className="sm:col-span-2 grid gap-2">
                <Label>Linked Expense Accounts *</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="justify-between w-full">
                      {expenseAccounts.length > 0
                        ? expenseAccounts
                            .map((x) => expenseOptions.find((o) => o.id === x)?.name || x)
                            .join(", ")
                        : "Select accounts"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72">
                    {expenseOptions.map((opt) => (
                      <DropdownMenuCheckboxItem
                        key={opt.id}
                        checked={expenseAccounts.includes(opt.id)}
                        onCheckedChange={(checked) =>
                          setExpenseAccounts((s) => (checked ? [...s, opt.id] : s.filter((x) => x !== opt.id)))
                        }
                      >
                        {opt.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Section>

          <Section title="Compliance Info">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Checkbox id="v-gst" checked={isGstRegistered} onCheckedChange={(v) => setIsGstRegistered(Boolean(v))} />
                <Label htmlFor="v-gst">Is GST Registered?</Label>
              </div>
              {isGstRegistered ? (
                <Field label="GSTIN *">
                  <Input placeholder="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value)} />
                </Field>
              ) : (
                <div className="sm:col-span-2 grid gap-2">
                  <Label>Non-GST Document *</Label>
                  <FileBox onChange={setNonGstDoc} />
                </div>
              )}
              <Field label="PAN Number">
                <Input value={pan} onChange={(e) => setPan(e.target.value)} />
              </Field>
              <Field label="TAN Number">
                <Input value={tan} onChange={(e) => setTan(e.target.value)} />
              </Field>
              <Field label="TDS Section Code">
                <Input value={tdsSection} onChange={(e) => setTdsSection(e.target.value)} />
              </Field>
              <Field label="Vendor Legal Type *">
                <Select value={legalType} onValueChange={setLegalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEGAL_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center gap-2">
                <Checkbox id="v-msme" checked={isMsme} onCheckedChange={(v) => setIsMsme(Boolean(v))} />
                <Label htmlFor="v-msme">Is MSME?</Label>
              </div>
              {isMsme && (
                <>
                  <Field label="MSME Number">
                    <Input value={msmeNumber} onChange={(e) => setMsmeNumber(e.target.value)} />
                  </Field>
                  <div className="sm:col-span-2 grid gap-2">
                    <Label>MSME Document</Label>
                    <FileBox onChange={setMsmeDoc} />
                  </div>
                </>
              )}
            </div>
          </Section>

          <div className="flex justify-end gap-3">
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function emptyBank(): BankAccount {
  return {
    id: generateId(),
    bankName: "",
    branch: "",
    ifsc: "",
    accNo: "",
    accHolder: "",
    doc: null,
  };
}
function updateBank(
  setter: React.Dispatch<React.SetStateAction<BankAccount[]>>,
  index: number,
  patch: Partial<BankAccount>,
) {
  setter((s) => s.map((b, i) => (i === index ? { ...b, ...patch } : b)));
}
function generateId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const LEGAL_TYPES = ["Company", "Non-Company", "Professional"] as const;
const ACCOUNT_TYPES = ["Current", "Savings", "Expense"] as const;
const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
];
