import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
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
