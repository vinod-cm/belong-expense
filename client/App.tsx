import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ExpenseSetup from "./pages/ExpenseSetup";
import VendorTypes from "./pages/VendorTypes";
import Vendors from "./pages/Vendors";
import VendorDetails from "./pages/VendorDetails";
import VendorEdit from "./pages/VendorEdit";
import PurchaseRequest from "./pages/PurchaseRequest";
import InvoiceAccounting from "./pages/InvoiceAccounting";
import PaymentVoucherPage from "./pages/PaymentVoucher";
import PaymentVoucherCreate from "./pages/PaymentVoucherCreate";
import PaymentVoucherDetails from "./pages/PaymentVoucherDetails";
import PurchaseRequestDetails from "./pages/PurchaseRequestDetails";
import DebitNoteCreate from "./pages/DebitNoteCreate";
import CreateInvoicePage from "./pages/CreateInvoice";
import Placeholder from "./pages/Placeholder";

const queryClient = new QueryClient();

import { ExpenseProvider } from "./store/expense";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ExpenseProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/expense/setup" element={<ExpenseSetup />} />
            <Route path="/expense/vendor-types" element={<VendorTypes />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/vendors/:id" element={<VendorDetails />} />
            <Route path="/vendors/:id/edit" element={<VendorEdit />} />
            <Route path="/expense/purchase" element={<PurchaseRequest />} />
            <Route path="/expense/purchase/:id" element={<PurchaseRequestDetails />} />
            <Route path="/expense/purchase/:id/debit-note" element={<DebitNoteCreate />} />
            <Route path="/expense/invoices" element={<InvoiceAccounting />} />
            <Route path="/expense/invoices/create" element={<CreateInvoicePage />} />
            <Route path="/expense/payment" element={<PaymentVoucherPage />} />
            <Route path="/expense/payment/create" element={<PaymentVoucherCreate />} />
            <Route path="/expense/payment/:id" element={<PaymentVoucherDetails />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ExpenseProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
