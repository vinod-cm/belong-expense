import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useExpense } from "@/store/expense";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function PaymentVoucherCreate() {
  const navigate = useNavigate();
  const { vendors, prs, invoices, addVoucher } = useExpense();

  const [vendorId, setVendorId] = useState("");
  const [prId, setPrId] = useState("");
  const [mode, setMode] = useState<"UPI" | "Cash" | "Cheque" | "Demand Draft" | "Account Transfer">("UPI");
  const [pvNo] = useState(() => `PV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [payType, setPayType] = useState<"Invoice" | "Advance">("Invoice");
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [invoiceAmounts, setInvoiceAmounts] = useState<Record<string, number>>({});
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [invoiceToAdd, setInvoiceToAdd] = useState<string>("");

  const [transactionNumber, setTransactionNumber] = useState("");
  const [transactionBank, setTransactionBank] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [ddDate, setDdDate] = useState("");
  const [depositSlipNumber, setDepositSlipNumber] = useState("");

  const vendorApprovedPRs = useMemo(() => prs.filter((p) => p.vendorId === vendorId && p.approved), [prs, vendorId]);
  const prInvoices = useMemo(() => invoices.filter((i) => i.prId === prId), [invoices, prId]);
  const selectedPR = useMemo(() => prs.find((p) => p.id === prId), [prs, prId]);

  const selectedInvoices = useMemo(() => prInvoices.filter((i) => selectedInvoiceIds.includes(i.id)), [prInvoices, selectedInvoiceIds]);

  const totalFromInvoices = useMemo(() => selectedInvoices.reduce((s, inv) => s + Number(invoiceAmounts[inv.id] || 0), 0), [selectedInvoices, invoiceAmounts]);

  const total = payType === "Invoice" ? totalFromInvoices : Number(advanceAmount || 0);

  const canSave = useMemo(() => {
    if (!vendorId || !date) return false;
    if (payType === "Invoice") {
      if (!prId) return false;
      if (selectedInvoiceIds.length === 0) return false;
      const invalid = selectedInvoices.some((inv) => {
        const amt = Number(invoiceAmounts[inv.id] || 0);
        return amt <= 0 || amt > inv.total;
      });
      if (invalid) return false;
    } else {
      const amt = Number(advanceAmount || 0);
      if (amt <= 0) return false;
    }
    if (mode === "UPI" && !transactionNumber) return false;
    if (mode === "Cheque" && (!transactionBank || !chequeDate || !chequeNumber)) return false;
    if (mode === "Demand Draft" && (!transactionBank || !ddDate || !depositSlipNumber)) return false;
    if (mode === "Account Transfer" && (!transactionBank || !transactionNumber)) return false;
    return total > 0;
  }, [vendorId, date, payType, prId, selectedInvoiceIds, selectedInvoices, invoiceAmounts, advanceAmount, mode, transactionNumber, transactionBank, chequeDate, chequeNumber, ddDate, depositSlipNumber, total]);

  const save = () => {
    if (!canSave) return;
    const invoiceAmountsArr = (payType === "Invoice"
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
      prId: prId || undefined,
      source: payType,
      invoiceAmounts: invoiceAmountsArr,
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
              <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Basic Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Payment Voucher No">
                  <Input readOnly value={pvNo} />
                </Field>
                <Field label="Vendor *">
                  <Select
                    value={vendorId}
                    onValueChange={(v) => {
                      setVendorId(v);
                      setPrId("");
                      setSelectedInvoiceIds([]);
                      setInvoiceAmounts({});
                      setAdvanceAmount(0);
                    }}
                  >
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
                <Field label="Select PR">
                  <Select value={prId} onValueChange={setPrId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Approved PRs of selected vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorApprovedPRs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.poNumber ? `${p.poNumber} — ${p.title}` : `${p.id} — ${p.title}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            <section>
              <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Source</h3>
              <div className="flex gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" className="accent-[hsl(var(--primary))]" checked={payType === "Invoice"} onChange={() => setPayType("Invoice")} />
                  Invoice
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" className="accent-[hsl(var(--primary))]" checked={payType === "Advance"} onChange={() => setPayType("Advance")} />
                  Advance Payment
                </label>
              </div>

              {payType === "Invoice" ? (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 items-end">
                    <Field label="Select Invoice(s)">
                      <Select value={invoiceToAdd} onValueChange={setInvoiceToAdd} disabled={!prId}>
                        <SelectTrigger>
                          <SelectValue placeholder={prId ? "Select Invoice" : "Select a PR first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {prInvoices.map((inv) => (
                            <SelectItem key={inv.id} value={inv.id}>
                              {inv.number} — ₹{inv.total.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <div className="sm:col-span-2 flex gap-2">
                      <Button
                        onClick={() => {
                          if (!invoiceToAdd) return;
                          setSelectedInvoiceIds((s) => (s.includes(invoiceToAdd) ? s : [...s, invoiceToAdd]));
                          setInvoiceToAdd("");
                        }}
                        disabled={!invoiceToAdd}
                      >
                        Add Invoice
                      </Button>
                      {selectedInvoiceIds.length > 0 && (
                        <div className="self-center text-sm text-muted-foreground">{selectedInvoiceIds.length} selected</div>
                      )}
                    </div>
                  </div>

                  {selectedInvoices.length > 0 ? (
                    <div className="space-y-3">
                      {selectedInvoices.map((inv) => {
                        const maxAmt = inv.total;
                        const val = Number(invoiceAmounts[inv.id] || 0);
                        const over = val > maxAmt;
                        return (
                          <div key={inv.id} className="rounded-md border p-3 bg-white">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 items-end">
                              <Field label="Invoice #">
                                <Input readOnly value={inv.number} />
                              </Field>
                              <Field label="Invoice Total">
                                <Input readOnly value={`₹${maxAmt.toLocaleString()}`} />
                              </Field>
                              <Field label="Payment Amount">
                                <Input
                                  value={invoiceAmounts[inv.id] ?? ""}
                                  onChange={(e) => setInvoiceAmounts((s) => ({ ...s, [inv.id]: Number(e.target.value) }))}
                                />
                                {over && <div className="mt-1 text-sm text-destructive">Amount cannot exceed invoice amount.</div>}
                              </Field>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <Button variant="secondary" onClick={() => setSelectedInvoiceIds((s) => s.filter((x) => x !== inv.id))}>Remove</Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-md border p-3 text-sm text-muted-foreground">No invoices selected</div>
                  )}
                </div>
              ) : (
                <div className="mt-3 rounded-md border p-3 space-y-3">
                  {prId && selectedPR?.poNumber && (
                    <Field label="PO Number">
                      <Input readOnly value={selectedPR.poNumber} />
                    </Field>
                  )}
                  <Field label="Payment Amount">
                    <Input value={advanceAmount} onChange={(e) => setAdvanceAmount(Number(e.target.value))} />
                  </Field>
                </div>
              )}
            </section>


            <section>
              <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Total Payment Amount</h3>
              <div className="rounded-md border p-3 font-semibold">₹{total.toLocaleString()}</div>
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
                <Field label="Payment Date *">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
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
