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
              onSave={addVendor as (v: Vendor) => void}
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
  onSave: (v: Vendor) => void;
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
