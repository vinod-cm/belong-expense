import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useExpense, id } from "@/store/expense";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function DebitNoteCreate() {
  const navigate = useNavigate();
  const { id: prIdParam } = useParams<{ id: string }>();
  const { prs, invoices, addDebitNote } = useExpense();

  const pr = useMemo(() => prs.find((p) => p.id === prIdParam), [prs, prIdParam]);
  const prInvoices = useMemo(() => invoices.filter((i) => i.prId === pr?.id), [invoices, pr?.id]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [invoiceId, setInvoiceId] = useState<string>(prInvoices.length > 0 ? prInvoices[0].id : "");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  const [vendorRef, setVendorRef] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const mode: "invoice" | "po" = prInvoices.length > 0 ? "invoice" : "po";

  const canSave = pr && title.trim() && Number(amount) > 0 && date ? true : false;

  const save = () => {
    if (!canSave || !pr) return;
    const fileNames = files ? Array.from(files).map((f) => f.name) : undefined;
    addDebitNote({
      id: id("DN"),
      prId: pr.id,
      vendorId: pr.vendorId,
      title: title.trim(),
      amount: Number(amount),
      date,
      description: description || undefined,
      vendorRef: vendorRef || undefined,
      fileNames,
      invoiceId: mode === "invoice" ? invoiceId || undefined : undefined,
    });
    navigate(`/expense/purchase/${pr.id}`);
  };

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <h1 className="text-xl font-semibold">Add Debit Note</h1>
          <div className="flex items-center gap-2">
            <Link to={`/expense/purchase/${pr?.id ?? ""}`}>
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button onClick={save} disabled={!canSave}>Save</Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {!pr ? (
            <div className="text-muted-foreground">PR not found.</div>
          ) : (
            <div className="grid gap-6">
              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Debit Note Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Invoice / PO Selection *">
                      {mode === "invoice" ? (
                        <Select value={invoiceId} onValueChange={setInvoiceId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Invoice" />
                          </SelectTrigger>
                          <SelectContent>
                            {prInvoices.map((inv) => (
                              <SelectItem key={inv.id} value={inv.id}>
                                {inv.number} — ₹{inv.total.toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input readOnly value="Against PO" />
                      )}
                    </Field>
                    <Field label="Title *">
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Field>
                    <Field label="Date *">
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </Field>
                  </div>

                  <Field label="Debit Note Amount *">
                    <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </Field>

                  <Field label="Description">
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Type here" />
                  </Field>

                  <Field label="Vendor Credit Note Reference Number">
                    <Input value={vendorRef} onChange={(e) => setVendorRef(e.target.value)} />
                  </Field>

                  <div className="grid gap-2">
                    <Label>Upload Supporting Documents</Label>
                    <label className="grid h-28 place-items-center rounded-md border-2 border-dashed text-sm text-muted-foreground">
                      <div className="pointer-events-none select-none text-center">
                        <div className="font-medium text-foreground">Upload (multiple)</div>
                      </div>
                      <input type="file" multiple className="hidden" onChange={(e) => setFiles(e.target.files)} />
                    </label>
                  </div>
                </div>
              </section>
            </div>
          )}
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
