import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useExpense, Vendor } from "@/store/expense";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default function VendorEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vendors, vendorTypes, updateVendor } = useExpense();
  const initial = useMemo(() => vendors.find((x) => x.id === id), [vendors, id]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [active, setActive] = useState(true);
  const [legalType, setLegalType] = useState("");
  const [vendorTypeId, setVendorTypeId] = useState("");
  const [accountType, setAccountType] = useState("");
  const [oneTime, setOneTime] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!initial) return;
    setName(initial.name || "");
    setEmail(initial.email || "");
    setPhone(initial.phone || "");
    setNotes(initial.notes || "");
    setAddress(initial.address || "");
    setState(initial.state || "");
    setActive(initial.active ?? true);
    setLegalType(initial.legalType || "");
    setVendorTypeId(initial.vendorTypeId || "");
    setAccountType((initial as any).accountType || "");
    setOneTime(initial.oneTime ?? false);
    setStartDate(initial.startDate || "");
    setEndDate(initial.endDate || "");
  }, [initial]);

  const save = () => {
    if (!initial) return;
    if (!name.trim() || !email.trim() || !phone.trim()) return;
    const v: Vendor = {
      ...initial,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim() || undefined,
      address: address.trim() || undefined,
      state: state || undefined,
      active,
      legalType: legalType || undefined,
      vendorTypeId: vendorTypeId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      oneTime,
    } as Vendor;
    updateVendor(v);
    navigate(`/vendors/${initial.id}`);
  };

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <h1 className="text-xl font-semibold">Edit Vendor</h1>
          <div className="flex items-center gap-2">
            {initial && (
              <Link to={`/vendors/${initial.id}`}>
                <Button variant="secondary">Cancel</Button>
              </Link>
            )}
            <Button onClick={save} disabled={!initial}>Save</Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {!initial ? (
            <div className="text-muted-foreground">Vendor not found.</div>
          ) : (
            <div className="grid gap-6">
              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Basic Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Vendor Name *">
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </Field>
                  <Field label="Email *">
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                  <Field label="Phone *">
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </Field>
                  <Field label="State">
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
                  </Field>
                  <Field label="Vendor Type">
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
                  </Field>
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
                  <div className="sm:col-span-2 grid gap-2">
                    <Label>Address</Label>
                    <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2 grid gap-2">
                    <Label>Notes</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-l-4 border-primary pl-3 text-base font-semibold">Other</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Start Date">
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </Field>
                  <Field label="End Date">
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </Field>
                  <Field label="Active">
                    <Select value={active ? "yes" : "no"} onValueChange={(v) => setActive(v === "yes")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Active</SelectItem>
                        <SelectItem value="no">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="One-time Vendor">
                    <Select value={oneTime ? "yes" : "no"} onValueChange={(v) => setOneTime(v === "yes")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Legal Type">
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
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

const LEGAL_TYPES = ["Company", "Non-company", "Professional"] as const;
const ACCOUNT_TYPES = ["Goods", "Services", "Expense", "Other"] as const;
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
