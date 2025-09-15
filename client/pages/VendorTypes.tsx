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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useExpense, id } from "@/store/expense";

export default function VendorTypes() {
  const { vendorTypes, addVendorType, updateVendorType, removeVendorType } =
    useExpense();
  const [q, setQ] = useState("");

  const filtered = vendorTypes.filter((i) =>
    i.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-0 py-3">
          <h1 className="text-xl font-semibold">Vendor Types</h1>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by vendor type"
              className="w-72"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <AddVendorType
              onSave={(name) =>
                addVendorType({ id: id("VT"), name, active: true })
              }
            />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.id}</TableCell>
                  <TableCell className="font-medium">{it.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 text-green-600">
                      <span className="size-2 rounded-full bg-green-500" />{" "}
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-3">
                    <EditVendorType value={it} onSave={updateVendorType} />
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => removeVendorType(it.id)}
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No vendor types yet
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

function AddVendorType({ onSave }: { onSave: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const save = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setOpen(false);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Vendor Type</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vendor Type</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="vt-name">Name *</Label>
            <Input
              id="vt-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditVendorType({
  value,
  onSave,
}: {
  value: VendorType;
  onSave: (v: VendorType) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(value.name);

  const save = () => {
    if (!name.trim()) return;
    onSave({ ...value, name: name.trim() });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:underline">Edit</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Vendor Type</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`ev-name-${value.id}`}>Name *</Label>
            <Input
              id={`ev-name-${value.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
