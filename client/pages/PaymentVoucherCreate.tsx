import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useExpense } from "@/store/expense";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function PaymentVoucherCreate() {
  const navigate = useNavigate();
  const { vendors, prs, invoices, addVoucher } = useExpense();

  const [vendorId, setVendorId] = useState("");
  const [mode, setMode] = useState<"UPI" | "Cash" | "Cheque" | "Demand Draft" | "Account Transfer">("UPI");
  const [pvNo, setPvNo] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [payType, setPayType] = useState<"Invoice" | "Advance">("Invoice");
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [invoiceAmounts, setInvoiceAmounts] = useState<Record<string, number>>({});
  const [poAmounts, setPoAmounts] = useState<Record<string, number>>({});

  const [transactionNumber, setTransactionNumber] = useState("");
  const [transactionBank, setTransactionBank] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [ddDate, setDdDate] = useState("");
  const [depositSlipNumber, setDepositSlipNumber] = useState("");

  const vendorInvoices = useMemo(() => invoices.filter((i) => i.vendorId === vendorId), [invoices, vendorId]);
  const vendorPOs = useMemo(() => prs.filter((p) => p.vendorId === vendorId && p.approved && p.poNumber), [prs, vendorId]);

  const selectedInvoices = useMemo(() => vendorInvoices.filter((i) => selectedInvoiceIds.includes(i.id)), [vendorInvoices, selectedInvoiceIds]);

  const invoiceItems = useMemo(() => {
    const rows: { id: string; invoiceId: string; invoiceNumber: string; prId: string; name: string; qty: number; gstPct: number; tdsPct: number; amount: number }[] = [];
    selectedInvoices.forEach((inv) => {
      const pr = prs.find((p) => p.id === inv.prId);
      inv.items.forEach((it) => {
        const prItem = pr?.items.find((pi) => pi.id === it.prItemId);
        if (prItem) {
          const qty = Number(prItem.qty) || 0;
          const gstPct = Number(prItem.gstRate || 0);
          const tdsPct = Number(prItem.tdsRate || 0);
          rows.push({
            id: `${inv.id}-${it.prItemId}`,
            invoiceId: inv.id,
            invoiceNumber: inv.number,
            prId: pr!.id,
            name: prItem.name,
            qty,
            gstPct,
            tdsPct,
            amount: it.amount,
          });
        }
      });
    });
    return rows;
  }, [selectedInvoices, prs]);

  const totalFromInvoices = useMemo(() => {
    return selectedInvoices.reduce((s, inv) => s + Number(invoiceAmounts[inv.id] || 0), 0);
  }, [selectedInvoices, invoiceAmounts]);

  const totalAdvance = useMemo(() => {
    return Object.entries(poAmounts).reduce((s, [_, n]) => s + (Number(n) || 0), 0);
  }, [poAmounts]);

  const total = payType === "Invoice" ? totalFromInvoices : totalAdvance;

  const canSave = useMemo(() => {
    if (!pvNo || !vendorId || !date) return false;
    if (payType === "Invoice") {
      if (selectedInvoiceIds.length === 0) return false;
      const invalid = selectedInvoices.some((inv) => {
        const amt = Number(invoiceAmounts[inv.id] || 0);
        return amt <= 0 || amt > inv.total;
      });
      if (invalid) return false;
    } else {
      const anyPoSelected = Object.values(poAmounts).some((n) => Number(n) > 0);
      if (!anyPoSelected) return false;
    }
    if (mode === "UPI" && !transactionNumber) return false;
    if (mode === "Cheque" && (!transactionBank || !chequeDate || !chequeNumber)) return false;
    if (mode === "Demand Draft" && (!transactionBank || !ddDate || !depositSlipNumber)) return false;
    if (mode === "Account Transfer" && (!transactionBank || !transactionNumber)) return false;
    return total > 0;
  }, [pvNo, vendorId, date, payType, selectedInvoiceIds, selectedInvoices, invoiceAmounts, poAmounts, mode, transactionNumber, transactionBank, chequeDate, chequeNumber, ddDate, depositSlipNumber, total]);

  const save = () => {
    if (!canSave) return;
    const invoiceAmounts = (payType === "Invoice"
      ? selectedInvoices.map((inv) => ({
          invoiceId: inv.id,
          amount: Number(invoiceAmounts[inv.id] || 0),
        }))
      : []) as { invoiceId: string; amount: number }[];

    addVoucher({
      id: `PV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      vendorId,
      pvNumber: pvNo,
      bankAccount: transactionBank,
      mode,
      date,
      description: desc || undefined,
      fileName: file?.name,
      transactionNumber: transactionNumber || undefined,
      transactionBank: transactionBank || undefined,
      chequeDate: chequeDate || undefined,
      chequeNumber: chequeNumber || undefined,
      ddDate: ddDate || undefined,
      depositSlipNumber: depositSlipNumber || undefined,
      invoiceAmounts,
      total,
    });
    navigate("/expense/payment");
  };

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <h1 className="text-xl font-semibold">Create Payment Voucher</h1>
          <div className="flex items-center gap-2">
            <Link to="/expense/payment">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button onClick={save} disabled={!canSave}>Save</Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-6">
            <section>
              <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Select Vendor</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Payment Voucher No *">
                  <Input value={pvNo} onChange={(e) => setPvNo(e.target.value)} />
                </Field>
                <Field label="Vendor *">
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
              </div>
            </section>

            <section>
              <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Select Source</h3>
              <div className="flex gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" className="accent-[hsl(var(--primary))]" checked={payType === "Invoice"} onChange={() => setPayType("Invoice")} />
                  Invoices
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" className="accent-[hsl(var(--primary))]" checked={payType === "Advance"} onChange={() => setPayType("Advance")} />
                  Purchase Orders (Advance)
                </label>
              </div>
              {payType === "Invoice" ? (
                <div className="mt-3 rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorInvoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              className="accent-[hsl(var(--primary))]"
                              checked={selectedInvoiceIds.includes(inv.id)}
                              onChange={(e) =>
                                setSelectedInvoiceIds((s) =>
                                  e.target.checked ? [...s, inv.id] : s.filter((x) => x !== inv.id),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>{inv.number}</TableCell>
                          <TableCell>{inv.date}</TableCell>
                          <TableCell>₹{inv.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      {vendorInvoices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                            Select a vendor to see invoices
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="mt-3 rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO Number</TableHead>
                        <TableHead>PR Title</TableHead>
                        <TableHead>Advance Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorPOs.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell>{po.poNumber}</TableCell>
                          <TableCell>{po.title}</TableCell>
                          <TableCell className="max-w-40">
                            <Input
                              value={poAmounts[po.id] ?? 0}
                              onChange={(e) =>
                                setPoAmounts((s) => ({ ...s, [po.id]: Number(e.target.value) }))
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {vendorPOs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                            Select a vendor to see POs
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>

            {payType === "Invoice" && selectedInvoices.length > 0 && (
              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Selected Invoices</h3>
                <div className="rounded-md border p-3 space-y-4">
                  {selectedInvoices.map((inv) => {
                    const maxAmt = inv.total;
                    const val = Number(invoiceAmounts[inv.id] || 0);
                    const over = val > maxAmt;
                    return (
                      <div key={inv.id} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Field label="Invoice #">
                          <Input readOnly value={inv.number} />
                        </Field>
                        <Field label="Payable Amount">
                          <Input readOnly value={`₹${inv.total.toLocaleString()}`} />
                        </Field>
                        <Field label="Amount">
                          <Input
                            value={invoiceAmounts[inv.id] ?? ""}
                            onChange={(e) =>
                              setInvoiceAmounts((s) => ({ ...s, [inv.id]: Number(e.target.value) }))
                            }
                          />
                          {over && (
                            <div className="mt-1 text-sm text-destructive">Amount cannot exceed invoice payable.</div>
                          )}
                        </Field>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Step 4: Total</h3>
              <div className="rounded-md border p-3 font-semibold">Total Payment Amount: ₹{total.toLocaleString()}</div>
            </section>

            <section>
              <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Payment Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Mode">
                  <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Demand Draft">Demand Draft</SelectItem>
                      <SelectItem value="Account Transfer">Account Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {(mode === "UPI" || mode === "Account Transfer") && (
                  <Field label="Transaction Number">
                    <Input value={transactionNumber} onChange={(e) => setTransactionNumber(e.target.value)} />
                  </Field>
                )}
                {mode !== "Cash" && (
                  <Field label="Transaction Bank">
                    <Input value={transactionBank} onChange={(e) => setTransactionBank(e.target.value)} />
                  </Field>
                )}
                {mode === "Cheque" && (
                  <>
                    <Field label="Cheque Date">
                      <Input type="date" value={chequeDate} onChange={(e) => setChequeDate(e.target.value)} />
                    </Field>
                    <Field label="Cheque Number">
                      <Input value={chequeNumber} onChange={(e) => setChequeNumber(e.target.value)} />
                    </Field>
                  </>
                )}
                {mode === "Demand Draft" && (
                  <>
                    <Field label="DD Date">
                      <Input type="date" value={ddDate} onChange={(e) => setDdDate(e.target.value)} />
                    </Field>
                    <Field label="Deposit Slip Number">
                      <Input value={depositSlipNumber} onChange={(e) => setDepositSlipNumber(e.target.value)} />
                    </Field>
                  </>
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Step 6: Date & Document</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 grid gap-2">
                  <Label>Payment Document</Label>
                  <FileBox onChange={setFile} />
                </div>
                <div className="sm:col-span-2 grid gap-2">
                  <Label>Description</Label>
                  <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Type here" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
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
