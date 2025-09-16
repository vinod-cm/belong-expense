import { AppShell } from "@/components/AppShell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExpense, prTotal } from "@/store/expense";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PurchaseRequestDetails() {
  const { id } = useParams();
  const { prs, debitNotes, invoices } = useExpense();
  const pr = prs.find((p) => p.id === id);

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <h1 className="text-xl font-semibold">PR Details</h1>
          <div className="flex items-center gap-2">
            {pr && (
              <Link to={`/expense/purchase/${pr.id}/debit-note`}>
                <Button>Add Debit Note</Button>
              </Link>
            )}
            <Link to="/expense/purchase">
              <Button variant="secondary">Back</Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {!pr ? (
            <div className="text-muted-foreground">PR not found.</div>
          ) : (
            <div className="grid gap-6">
              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">
                  Basic Details
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="PR Number" value={pr.id} />
                  <Field label="PO Number" value={pr.poNumber || "—"} />
                  <Field label="Request Date" value={pr.requestDate} />
                  <Field
                    label="Approval Status"
                    value={pr.approved ? "Approved" : "Pending"}
                  />
                  <Field
                    label="PO Document"
                    value={pr.approved ? pr.poDocumentName || "—" : "—"}
                  />
                  <Field
                    label="Total Amount"
                    value={`₹${prTotal(pr).toLocaleString()}`}
                  />
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">
                  Tax Split-up
                </h3>
                {(() => {
                  const base = pr.items.reduce(
                    (s, it) => s + (Number(it.total) || 0),
                    0,
                  );
                  const gst = pr.items.reduce(
                    (s, it) =>
                      s +
                      (Number(it.total) || 0) * (Number(it.gstRate || 0) / 100),
                    0,
                  );
                  const tds = pr.items.reduce(
                    (s, it) =>
                      s +
                      (Number(it.total) || 0) * (Number(it.tdsRate || 0) / 100),
                    0,
                  );
                  const net = base + gst - tds;
                  return (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <Field
                        label="Base Amount"
                        value={`₹${base.toLocaleString()}`}
                      />
                      <Field
                        label="GST Amount"
                        value={`₹${gst.toLocaleString()}`}
                      />
                      <Field
                        label="TDS Amount"
                        value={`₹${tds.toLocaleString()}`}
                      />
                      <Field
                        label="Net Payable Amount"
                        value={`₹${net.toLocaleString()}`}
                      />
                    </div>
                  );
                })()}
              </section>

              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">
                  Items
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Base Amount</TableHead>
                      <TableHead>GST %</TableHead>
                      <TableHead>GST Amount</TableHead>
                      <TableHead>TDS %</TableHead>
                      <TableHead>TDS Amount</TableHead>
                      <TableHead>Payable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pr.items.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell className="font-medium">{it.name}</TableCell>
                        <TableCell>{it.accountId}</TableCell>
                        <TableCell>{it.qty}</TableCell>
                        <TableCell>
                          ₹{Number(it.unitPrice).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          ₹{Number(it.total).toLocaleString()}
                        </TableCell>
                        <TableCell>{Number(it.gstRate || 0)}%</TableCell>
                        <TableCell>
                          ₹
                          {Number(
                            it.gstAmount ||
                              (Number(it.total) || 0) *
                                (Number(it.gstRate || 0) / 100),
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell>{Number(it.tdsRate || 0)}%</TableCell>
                        <TableCell>
                          ₹
                          {Number(
                            it.tdsAmount ||
                              (Number(it.total) || 0) *
                                (Number(it.tdsRate || 0) / 100),
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          ₹
                          {Number(
                            it.payable ??
                              (Number(it.total) || 0) +
                                (Number(it.total) || 0) *
                                  (Number(it.gstRate || 0) / 100) -
                                (Number(it.total) || 0) *
                                  (Number(it.tdsRate || 0) / 100),
                          ).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>

              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Debit Notes</h3>
                {(() => {
                  const notes = debitNotes.filter((d) => d.prId === pr.id);
                  if (notes.length === 0) {
                    return <div className="text-sm text-muted-foreground">No Debit Notes</div>;
                  }
                  return (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Against</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Vendor Credit Note Ref</TableHead>
                          <TableHead>Documents</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notes.map((d) => {
                          const inv = d.invoiceId ? invoices.find((i) => i.id === d.invoiceId) : undefined;
                          return (
                            <TableRow key={d.id}>
                              <TableCell className="font-medium">{d.title}</TableCell>
                              <TableCell>{d.date || "—"}</TableCell>
                              <TableCell>{inv ? `Invoice ${inv.number}` : "Against PO"}</TableCell>
                              <TableCell>₹{Number(d.amount).toLocaleString()}</TableCell>
                              <TableCell>{d.vendorRef || "—"}</TableCell>
                              <TableCell>{d.fileNames && d.fileNames.length > 0 ? d.fileNames.join(", ") : "—"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  );
                })()}
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
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="rounded-md border bg-white p-2 text-sm">{value}</div>
    </div>
  );
}
