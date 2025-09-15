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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useExpense, id } from "@/store/expense";
import { useMemo, useState } from "react";

export default function PaymentVoucherPage() {
  const { vouchers } = useExpense();
  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-0 py-3">
          <h1 className="text-xl font-semibold">Payment Workflow</h1>
          <Link to="/expense/payment/create">
            <Button>Create Payment Voucher</Button>
          </Link>
        </div>
        <div className="flex-1 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PV No</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.pvNumber}</TableCell>
                  <TableCell>{v.vendorId}</TableCell>
                  <TableCell>{v.date}</TableCell>
                  <TableCell>₹{v.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {vouchers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No Payment Vouchers
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

function CreatePV() {
  const { vendors, invoices, addVoucher } = useExpense();
  const [open, setOpen] = useState(false);
  const [pvNo, setPvNo] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [mode, setMode] = useState<"UPI" | "NEFT" | "Cheque">("UPI");
  const [bank, setBank] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Record<string, number>>({});

  const vendorInvoices = useMemo(
    () => invoices.filter((i) => i.vendorId === vendorId),
    [invoices, vendorId],
  );
  const total = Object.values(selected).reduce(
    (s, n) => s + (Number(n) || 0),
    0,
  );

  const save = () => {
    const invoiceAmounts = Object.entries(selected).map(
      ([invoiceId, amount]) => ({ invoiceId, amount: Number(amount) }),
    );
    if (!pvNo || !vendorId || !date || invoiceAmounts.length === 0) return;
    addVoucher({
      id: id("PV"),
      vendorId,
      pvNumber: pvNo,
      bankAccount: bank,
      mode,
      date,
      description: desc || undefined,
      fileName: file?.name,
      invoiceAmounts,
      total,
    });
    setOpen(false);
    setPvNo("");
    setVendorId("");
    setMode("UPI");
    setBank("");
    setDate("");
    setDesc("");
    setFile(null);
    setSelected({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New PV</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Payment Voucher</DialogTitle>
        </DialogHeader>
        <div className="grid gap-8">
          <Section title="CreatePayment Voucher">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Payment Voucher NO">
                <Input value={pvNo} onChange={(e) => setPvNo(e.target.value)} />
              </Field>
              <Field label="Select Invoice Numbers">
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vendor" />
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
              <div />
              <Field label="Enter Amount">
                <Input value={total.toString()} readOnly />
              </Field>
              <Field label="Vendor">
                <Input value={vendorId} readOnly />
              </Field>
              <Field label="Mode of Payment">
                <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="HSN/SAC Code">
                <Input placeholder="Code" />
              </Field>
              <Field label="Bank Account">
                <Input value={bank} onChange={(e) => setBank(e.target.value)} />
              </Field>
              <Field label="Payment Date">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
              <Field label="Link Debit Note">
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="md:col-span-3 grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Enter here"
                />
              </div>
            </div>
          </Section>

          <Section title="Select Invoices and Amounts">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pay Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.number}</TableCell>
                      <TableCell>{inv.date}</TableCell>
                      <TableCell>₹{inv.total.toLocaleString()}</TableCell>
                      <TableCell className="max-w-40">
                        <Input
                          type="number"
                          value={selected[inv.id] ?? 0}
                          onChange={(e) =>
                            setSelected((s) => ({
                              ...s,
                              [inv.id]: Number(e.target.value),
                            }))
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {vendorInvoices.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-6 text-center text-muted-foreground"
                      >
                        Select a vendor to see invoices
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Section>

          <Section title="Upload Invoice">
            <FileBox onChange={setFile} />
          </Section>

          <div className="flex justify-end gap-3">
            <Button onClick={save}>Save Changes</Button>
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
