import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useExpense } from "@/store/expense";
import { Link, useParams } from "react-router-dom";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid gap-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="rounded-md border bg-white p-2 text-sm">
        {value || "—"}
      </div>
    </div>
  );
}

export default function VendorDetails() {
  const { id } = useParams();
  const { vendors } = useExpense();
  const v = vendors.find((x) => x.id === id);

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <h1 className="text-xl font-semibold">Vendor Details</h1>
          <div className="flex items-center gap-2">
            {v && (
              <Link to={`/vendors/${v.id}/edit`}>
                <Button>Edit</Button>
              </Link>
            )}
            <Link to="/vendors">
              <Button variant="secondary">Back</Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {!v ? (
            <div className="text-muted-foreground">Vendor not found.</div>
          ) : (
            <div className="grid gap-6">
              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Basic Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Name" value={v.name} />
                  <Field label="Email" value={v.email} />
                  <Field label="Phone" value={v.phone} />
                  <Field label="State" value={v.state} />
                  <Field label="Vendor Category" value={(v as any).vendorCategory} />
                  <Field label="Legal Type" value={v.legalType} />
                  <div className="sm:col-span-3">
                    <Field label="Address" value={v.address} />
                  </div>
                  <div className="sm:col-span-3">
                    <Field label="Notes" value={v.notes} />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Compliance Info</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="GSTIN" value={v.compliance?.gstin} />
                  <Field label="PAN" value={v.compliance?.pan} />
                  <Field label="TAN" value={v.compliance?.tan} />
                  <Field label="TDS Rate" value={v.compliance?.tdsRate} />
                  <Field label="GST Rate" value={v.compliance?.gstRate} />
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Banking Info</h3>
                <div className="space-y-3">
                  {v.bank.length === 0 && (
                    <div className="text-sm text-muted-foreground">No bank accounts</div>
                  )}
                  {v.bank.map((b) => (
                    <div key={b.id} className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-md border p-3">
                      <Field label="Bank Name" value={b.bankName} />
                      <Field label="Branch" value={b.branch} />
                      <Field label="IFSC" value={b.ifsc} />
                      <Field label="Account Holder" value={b.accHolder} />
                      <Field label="Account Number" value={b.accNo} />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Settings</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Status" value={v.active ? "Active" : "Inactive"} />
                  <Field label="Start Date" value={v.startDate} />
                  <Field label="End Date" value={v.endDate} />
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
