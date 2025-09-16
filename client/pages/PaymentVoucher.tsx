import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExpense } from "@/store/expense";
import { Link } from "react-router-dom";

export default function PaymentVoucherPage() {
  const { vouchers, vendors } = useExpense();
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
                <TableHead>Payment Voucher No</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Mode of Payment</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Payment Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((v) => {
                const vendor = vendors.find((x) => x.id === v.vendorId);
                return (
                  <TableRow key={v.id}>
                    <TableCell>{v.pvNumber}</TableCell>
                    <TableCell>{v.date}</TableCell>
                    <TableCell>{v.mode}</TableCell>
                    <TableCell>{vendor?.name || v.vendorId}</TableCell>
                    <TableCell>₹{v.total.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/expense/payment/${v.id}`}>
                        <Button variant="secondary">View Details</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
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
