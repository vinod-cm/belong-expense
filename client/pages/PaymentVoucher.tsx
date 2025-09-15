import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary">View Details</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Payment Voucher Details</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div>PV No: {v.pvNumber}</div>
                            <div>Payment Date: {v.date}</div>
                            <div>Mode of Payment: {v.mode}</div>
                            <div>Vendor: {vendor?.name || v.vendorId}</div>
                            <div>Amount: ₹{v.total.toLocaleString()}</div>
                            {v.transactionBank && <div>Transaction Bank: {v.transactionBank}</div>}
                            {v.transactionNumber && <div>Transaction Number: {v.transactionNumber}</div>}
                            {v.chequeDate && <div>Cheque Date: {v.chequeDate}</div>}
                            {v.chequeNumber && <div>Cheque Number: {v.chequeNumber}</div>}
                            {v.ddDate && <div>DD Date: {v.ddDate}</div>}
                            {v.depositSlipNumber && <div>Deposit Slip Number: {v.depositSlipNumber}</div>}
                            {v.fileName && <div>Document: {v.fileName}</div>}
                            {v.description && <div>Description: {v.description}</div>}
                          </div>
                        </DialogContent>
                      </Dialog>
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
