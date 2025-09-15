import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

interface Group {
  id: string;
  name: string;
  budget: number; // in currency units
  active: boolean;
  createdAt: string;
}

interface ExpenseAccount {
  id: string; // GL Account No (unique id)
  name: string;
  groupId: string;
  budget: number;
  hsnSac?: string;
  active: boolean;
  createdAt: string;
}

export default function ExpenseSetup() {
  const [tab, setTab] = useState<"groups" | "accounts">("groups");
  const [query, setQuery] = useState("");

  const [groups, setGroups] = useState<Group[]>([]);
  const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);

  const filteredGroups = useMemo(
    () =>
      groups.filter((g) => g.name.toLowerCase().includes(query.toLowerCase())),
    [groups, query],
  );
  const filteredAccounts = useMemo(
    () =>
      accounts.filter((a) => a.name.toLowerCase().includes(query.toLowerCase())),
    [accounts, query],
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Setup</h1>
            <div className="flex rounded-md border p-0.5">
              <button
                className={cn(
                  "rounded px-3 py-1.5 text-sm",
                  tab === "groups" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
                onClick={() => setTab("groups")}
                aria-pressed={tab === "groups"}
              >
                Groups
              </button>
              <button
                className={cn(
                  "rounded px-3 py-1.5 text-sm",
                  tab === "accounts" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
                onClick={() => setTab("accounts")}
                aria-pressed={tab === "accounts"}
              >
                Expense Accounts
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder={tab === "groups" ? "Search by group name" : "Search by accounts name"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-72 pl-3"
              />
            </div>
            {tab === "groups" ? (
              <AddGroupButton
                onSave={(g) => setGroups((s) => [...s, g])}
              />
            ) : (
              <AddAccountButton
                groups={groups}
                accounts={accounts}
                onSave={(a) => setAccounts((s) => [...s, a])}
              />
            )}
          </div>
        </div>

        {tab === "groups" ? (
          <GroupsTable
            items={filteredGroups}
            onToggle={(id) =>
              setGroups((s) => s.map((g) => (g.id === id ? { ...g, active: !g.active } : g)))
            }
            onDelete={(id) => setGroups((s) => s.filter((g) => g.id !== id))}
            onEdit={(g) =>
              setGroups((s) => s.map((it) => (it.id === g.id ? g : it)))
            }
          />
        ) : (
          <AccountsTable
            items={filteredAccounts}
            groups={groups}
            onToggle={(id) =>
              setAccounts((s) => s.map((a) => (a.id === id ? { ...a, active: !a.active } : a)))
            }
            onDelete={(id) => setAccounts((s) => s.filter((a) => a.id !== id))}
            onEdit={(a) => setAccounts((s) => s.map((it) => (it.id === a.id ? a : it)))}
          />
        )}
      </div>
    </AppShell>
  );
}

function GroupsTable({
  items,
  onToggle,
  onDelete,
  onEdit,
}: {
  items: Group[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (g: Group) => void;
}) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>GL Code</TableHead>
            <TableHead>Hsn Sac Code</TableHead>
            <TableHead>Budget Amount</TableHead>
            <TableHead>Created On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((g) => (
            <TableRow key={g.id}>
              <TableCell className="font-medium">{g.name}</TableCell>
              <TableCell>{g.id}</TableCell>
              <TableCell>—</TableCell>
              <TableCell>₹{g.budget.toLocaleString()}</TableCell>
              <TableCell>{new Date(g.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={cn("inline-flex items-center gap-2", g.active ? "text-green-600" : "text-muted-foreground")}> 
                  <span className={cn("size-2 rounded-full", g.active ? "bg-green-500" : "bg-muted-foreground/40")} />
                  {g.active ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-3">
                <EditGroupButton value={g} onSave={onEdit} />
                <button className="text-red-600 hover:underline" onClick={() => onDelete(g.id)}>Delete</button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                No groups yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function AccountsTable({
  items,
  groups,
  onToggle,
  onDelete,
  onEdit,
}: {
  items: ExpenseAccount[];
  groups: Group[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (a: ExpenseAccount) => void;
}) {
  const groupName = (id: string) => groups.find((g) => g.id === id)?.name || "—";
  return (
    <div className="rounded-lg border bg-white p-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>GL Code</TableHead>
            <TableHead>Hsn Sac Code</TableHead>
            <TableHead>Budget Amount</TableHead>
            <TableHead>Created On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Group</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.name}</TableCell>
              <TableCell>{a.id}</TableCell>
              <TableCell>{a.hsnSac || "—"}</TableCell>
              <TableCell>₹{a.budget.toLocaleString()}</TableCell>
              <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={cn("inline-flex items-center gap-2", a.active ? "text-green-600" : "text-muted-foreground")}> 
                  <span className={cn("size-2 rounded-full", a.active ? "bg-green-500" : "bg-muted-foreground/40")} />
                  {a.active ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>{groupName(a.groupId)}</TableCell>
              <TableCell className="text-right space-x-3">
                <EditAccountButton value={a} groups={groups} onSave={onEdit} />
                <button className="text-red-600 hover:underline" onClick={() => onDelete(a.id)}>Delete</button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                No expense accounts yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function AddGroupButton({ onSave }: { onSave: (g: Group) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState(0);
  const [active, setActive] = useState(true);

  const save = () => {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    const newGroup: Group = {
      id: randomCode(),
      name: name.trim(),
      budget: Number(budget) || 0,
      active,
      createdAt: now,
    };
    onSave(newGroup);
    setOpen(false);
    setName("");
    setBudget(0);
    setActive(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Add Group</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="g-name">Name *</Label>
            <Input id="g-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-budget">Budget Amount *</Label>
            <Input id="g-budget" type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} placeholder="Amount" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="g-active" checked={active} onCheckedChange={(v) => setActive(Boolean(v))} />
            <Label htmlFor="g-active">Active</Label>
          </div>
          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditGroupButton({ value, onSave }: { value: Group; onSave: (g: Group) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(value.name);
  const [budget, setBudget] = useState<number>(value.budget);
  const [active, setActive] = useState<boolean>(value.active);

  const save = () => {
    if (!name.trim()) return;
    onSave({ ...value, name: name.trim(), budget: Number(budget) || 0, active });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:underline">Edit</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`eg-name-${value.id}`}>Name *</Label>
            <Input id={`eg-name-${value.id}`} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`eg-budget-${value.id}`}>Budget Amount *</Label>
            <Input id={`eg-budget-${value.id}`} type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id={`eg-active-${value.id}`} checked={active} onCheckedChange={(v) => setActive(Boolean(v))} />
            <Label htmlFor={`eg-active-${value.id}`}>Active</Label>
          </div>
          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddAccountButton({
  groups,
  accounts,
  onSave,
}: {
  groups: Group[];
  accounts: ExpenseAccount[];
  onSave: (a: ExpenseAccount) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState<string>("");
  const [budget, setBudget] = useState(0);
  const [hsn, setHsn] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string>("");

  const save = () => {
    setError("");
    if (!name.trim() || !groupId) return;
    const group = groups.find((g) => g.id === groupId);
    const totalForGroup = accounts
      .filter((a) => a.groupId === groupId)
      .reduce((sum, a) => sum + a.budget, 0);
    const remaining = (group?.budget || 0) - totalForGroup;
    if (budget > remaining) {
      setError("Budget exceeds group budget.");
      return;
    }
    const now = new Date().toISOString();
    const newAccount: ExpenseAccount = {
      id: randomCode(),
      name: name.trim(),
      groupId,
      budget: Number(budget) || 0,
      hsnSac: hsn.trim() || undefined,
      active,
      createdAt: now,
    };
    onSave(newAccount);
    setOpen(false);
    setName("");
    setGroupId("");
    setBudget(0);
    setHsn("");
    setActive(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Expense Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense Account</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ea-name">Name *</Label>
            <Input id="ea-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          </div>
          <div className="grid gap-2">
            <Label> Select Group *</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ea-budget">Budget Amount *</Label>
            <Input id="ea-budget" type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} placeholder="Enter Amount" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ea-hsn">Hsn Sac Code *</Label>
            <Input id="ea-hsn" value={hsn} onChange={(e) => setHsn(e.target.value)} placeholder="Enter Code" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="ea-active" checked={active} onCheckedChange={(v) => setActive(Boolean(v))} />
            <Label htmlFor="ea-active">Active</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditAccountButton({ value, groups, onSave }: { value: ExpenseAccount; groups: Group[]; onSave: (a: ExpenseAccount) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(value.name);
  const [groupId, setGroupId] = useState<string>(value.groupId);
  const [budget, setBudget] = useState<number>(value.budget);
  const [hsn, setHsn] = useState<string>(value.hsnSac || "");
  const [active, setActive] = useState<boolean>(value.active);

  const save = () => {
    if (!name.trim() || !groupId) return;
    onSave({ ...value, name: name.trim(), groupId, budget: Number(budget) || 0, hsnSac: hsn.trim() || undefined, active });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:underline">Edit</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Expense Account</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`ea-name-${value.id}`}>Name *</Label>
            <Input id={`ea-name-${value.id}`} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Select Group *</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`ea-budget-${value.id}`}>Budget Amount *</Label>
            <Input id={`ea-budget-${value.id}`} type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`ea-hsn-${value.id}`}>Hsn Sac Code *</Label>
            <Input id={`ea-hsn-${value.id}`} value={hsn} onChange={(e) => setHsn(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id={`ea-active-${value.id}`} checked={active} onCheckedChange={(v) => setActive(Boolean(v))} />
            <Label htmlFor={`ea-active-${value.id}`}>Active</Label>
          </div>
          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function randomCode() {
  const seq = Math.random().toString(36).slice(2, 6).toUpperCase();
  return seq;
}
