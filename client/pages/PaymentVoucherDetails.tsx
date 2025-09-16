import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useExpense } from "@/store/expense";
import { Link, useParams } from "react-router-dom";

export default function PaymentVoucherDetails() {
  const { id } = useParams<{ id: string }>();
  const { vouchers, vendors, invoices, prs } = useExpense();

  const voucher = vouchers.find((v) => v.id === id);
  const vendor = vendors.find((x) => x.id === voucher?.vendorId);
  const pr = prs.find((p) => p.id === voucher?.prId);
  const items = (voucher?.invoiceAmounts || []).map((ia) => ({
    ...ia,
    invoice: invoices.find((inv) => inv.id === ia.invoiceId),
  }));

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <h1 className="text-xl font-semibold">Payment Voucher Details</h1>
          <div className="flex items-center gap-2">
            <Link to="/expense/payment">
              <Button variant="secondary">Back</Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {!voucher ? (
            <div className="rounded-lg border bg-white p-4">Voucher not found.</div>
          ) : (
            <div className="grid gap-6">
              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Basic Information</h3>
                <div className="rounded-lg border bg-white p-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Payment Voucher No" value={voucher.pvNumber} />
                  <Field label="Payment Date" value={voucher.date || "—"} />
                  <Field label="Mode of Payment" value={voucher.mode} />
                  <Field label="Vendor" value={vendor?.name || voucher.vendorId} />
                  {pr && <Field label="PR / PO" value={pr.poNumber ? `${pr.poNumber}` : pr.id} />}
                  <Field label="Total Amount" value={`₹${voucher.total.toLocaleString()}`} />
                </div>
              </section>

              {(voucher.transactionBank || voucher.transactionNumber || voucher.chequeDate || voucher.chequeNumber || voucher.ddDate || voucher.depositSlipNumber) && (
                <section>
                  <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Payment Details</h3>
                  <div className="rounded-lg border bg-white p-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {voucher.transactionBank && <Field label="Transaction Bank" value={voucher.transactionBank} />}
                    {voucher.transactionNumber && <Field label="Transaction Number" value={voucher.transactionNumber} />}
                    {voucher.chequeDate && <Field label="Cheque Date" value={voucher.chequeDate} />}
                    {voucher.chequeNumber && <Field label="Cheque Number" value={voucher.chequeNumber} />}
                    {voucher.ddDate && <Field label="DD Date" value={voucher.ddDate} />}
                    {voucher.depositSlipNumber && <Field label="Deposit Slip Number" value={voucher.depositSlipNumber} />}
                  </div>
                </section>
              )}

              {(voucher.description || voucher.fileName) && (
                <section>
                  <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Attachments & Notes</h3>
                  <div className="rounded-lg border bg-white p-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {voucher.fileName && <Field label="Payment Document" value={voucher.fileName} />}
                    {voucher.description && <Field label="Description" value={voucher.description} />}
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Source</h3>
                <div className="rounded-lg border bg-white p-4 grid gap-3">
                  <div className="text-sm text-muted-foreground">Type: {voucher.source || "—"}</div>
                  {items.length > 0 ? (
                    <div className="grid gap-3">
                      {items.map((it) => (
                        <div key={it.invoiceId} className="rounded-md border p-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Field label="Invoice #" value={it.invoice?.number || it.invoiceId} />
                            <Field label="Invoice Date" value={it.invoice?.date || "—"} />
                            <Field label="Payment Amount" value={`₹${Number(it.amount || 0).toLocaleString()}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No linked invoices</div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Summary</h3>
                <div className="rounded-lg border bg-white p-4 font-semibold">Total Payment Amount: ₹{voucher.total.toLocaleString()}</div>
              </section>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}
