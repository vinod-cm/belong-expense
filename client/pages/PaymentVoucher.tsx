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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useExpense } from "@/store/expense";
import { Link } from "react-router-dom";

export default function PaymentVoucherPage() {
  const { vouchers } = useExpense();
  return (
    <AppShell>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-0 py-3">
          <h1 className="text-xl font-semibold">Payment Workflow</h1>
          <Link to="/expense/payment/create">
            <Button>Create Payment Voucher</Button>
          </Link>
        </div>
        <div className="flex-1 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PV No</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.pvNumber}</TableCell>
                  <TableCell>{v.vendorId}</TableCell>
                  <TableCell>{v.date}</TableCell>
                  <TableCell>₹{v.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {vouchers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No Payment Vouchers
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

  const { vendors, invoices, addVoucher } = useExpense();
  const [open, setOpen] = useState(false);
  const [pvNo, setPvNo] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [mode, setMode] = useState<"UPI" | "NEFT" | "Cheque">("UPI");
  const [bank, setBank] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Record<string, number>>({});

  const vendorInvoices = useMemo(
    () => invoices.filter((i) => i.vendorId === vendorId),
    [invoices, vendorId],
  );
  const total = Object.values(selected).reduce(
    (s, n) => s + (Number(n) || 0),
    0,
  );

  const save = () => {
    const invoiceAmounts = Object.entries(selected).map(
      ([invoiceId, amount]) => ({ invoiceId, amount: Number(amount) }),
    );
    if (!pvNo || !vendorId || !date || invoiceAmounts.length === 0) return;
    addVoucher({
      id: id("PV"),
      vendorId,
      pvNumber: pvNo,
      bankAccount: bank,
      mode,
      date,
      description: desc || undefined,
      fileName: file?.name,
      invoiceAmounts,
      total,
    });
    setOpen(false);
    setPvNo("");
    setVendorId("");
    setMode("UPI");
    setBank("");
    setDate("");
    setDesc("");
    setFile(null);
    setSelected({});
  };
