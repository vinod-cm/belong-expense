import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ItemType = "Goods" | "Services";
export interface PRItem {
  id: string;
  name: string;
  accountId: string;
  type: ItemType;
  uom: string;
  qty: number;
  unitPrice: number;
  total: number;
  description?: string;
  hsnCode?: string;
  gstRate?: string;
  tdsRate?: string;
  gstAmount?: number;
  tdsAmount?: number;
  payable?: number;
}
export interface PR {
  id: string;
  title: string;
  vendorId: string;
  requestDate: string;
  requesterName?: string;
  documentName?: string;
  poNumber?: string;
  poDocumentName?: string;
  items: PRItem[];
  description?: string;
  approved: boolean;
}
export interface VendorBank {
  id: string;
  bankName: string;
  branch: string;
  ifsc: string;
  accNo: string;
  accHolder: string;
  docName?: string;
}
export interface VendorType {
  id: string;
  name: string;
  active: boolean;
}
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  address?: string;
  state?: string;
  active: boolean;
  legalType?: string;
  vendorCategory?: "Service Based" | "Goods Based" | "Both";
  serviceType?: string;
  accountType?: string;
  startDate?: string;
  endDate?: string;
  oneTime?: boolean;
  expenseAccounts: string[];
  compliance: {
    isGstRegistered?: boolean;
    gstin?: string;
    pan?: string;
    tan?: string;
    tdsRate?: string;
    gstRate?: string;
    msme?: boolean;
    msmeNumber?: string;
  };
  documents: {
    registrationName?: string;
    gstCertName?: string;
    panCardName?: string;
    aadhaarName?: string;
    nonGstDocName?: string;
    msmeDocName?: string;
    otherDocNames?: string[];
  };
  bank: VendorBank[];
}
export interface InvoiceItemRef {
  prItemId: string;
  amount: number;
}
export interface Invoice {
  id: string;
  prId: string;
  vendorId: string;
  number: string;
  date: string;
  dueDate?: string;
  description?: string;
  documentName?: string;
  items: InvoiceItemRef[];
  total: number;
}
export interface PaymentInvoiceAmount {
  invoiceId: string;
  amount: number;
}
export interface PaymentVoucher {
  id: string;
  vendorId: string;
  pvNumber: string;
  bankAccount: string;
  mode: "UPI" | "Cash" | "Cheque" | "Demand Draft" | "Account Transfer";
  date: string;
  description?: string;
  debitNoteLink?: string;
  fileName?: string;
  transactionNumber?: string;
  transactionBank?: string;
  chequeDate?: string;
  chequeNumber?: string;
  ddDate?: string;
  depositSlipNumber?: string;
  // Optional linkage/context
  prId?: string; // Linked PR when applicable
  source?: "Invoice" | "PO" | "None"; // Payment source context
  invoiceAmounts: PaymentInvoiceAmount[];
  total: number;
}

export interface DebitNote {
  id: string;
  prId: string;
  vendorId: string;
  title: string;
  amount: number;
  date: string;
  description?: string;
  vendorRef?: string;
  fileNames?: string[];
  notes?: string;
  // linkage
  invoiceId?: string; // when against invoice; undefined means against PO
}

interface ExpenseStore {
  vendors: Vendor[];
  vendorTypes: VendorType[];
  prs: PR[];
  invoices: Invoice[];
  vouchers: PaymentVoucher[];
  debitNotes: DebitNote[];
  addVendor(v: Vendor): void;
  updateVendor(v: Vendor): void;
  removeVendor(id: string): void;
  addVendorType(v: VendorType): void;
  updateVendorType(v: VendorType): void;
  removeVendorType(id: string): void;
  addPR(p: PR): void;
  updatePR(p: PR): void;
  addInvoice(inv: Invoice): void;
  addVoucher(v: PaymentVoucher): void;
  addDebitNote(d: DebitNote): void;
}

const ExpenseContext = createContext<ExpenseStore | null>(null);

const STORAGE_KEY = "expense-store-v1";

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorTypes, setVendorTypes] = useState<VendorType[]>([]);
  const [prs, setPRs] = useState<PR[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [debitNotes, setDebitNotes] = useState<DebitNote[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setVendors(data.vendors || []);
        setVendorTypes(data.vendorTypes || []);
        setPRs(data.prs || []);
        setInvoices(data.invoices || []);
        setVouchers(data.vouchers || []);
        setDebitNotes(data.debitNotes || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const data = { vendors, vendorTypes, prs, invoices, vouchers, debitNotes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [vendors, vendorTypes, prs, invoices, vouchers, debitNotes]);

  const value = useMemo<ExpenseStore>(
    () => ({
      vendors,
      vendorTypes,
      prs,
      invoices,
      vouchers,
      debitNotes,
      addVendor: (v) => setVendors((s) => [...s, v]),
      updateVendor: (v) =>
        setVendors((s) => s.map((x) => (x.id === v.id ? v : x))),
      removeVendor: (id) => setVendors((s) => s.filter((x) => x.id !== id)),
      addVendorType: (t) => setVendorTypes((s) => [...s, t]),
      updateVendorType: (t) =>
        setVendorTypes((s) => s.map((x) => (x.id === t.id ? t : x))),
      removeVendorType: (id) =>
        setVendorTypes((s) => s.filter((x) => x.id !== id)),
      addPR: (p) => setPRs((s) => [...s, p]),
      updatePR: (p) => setPRs((s) => s.map((x) => (x.id === p.id ? p : x))),
      addInvoice: (inv) => setInvoices((s) => [...s, inv]),
      addVoucher: (pv) => setVouchers((s) => [...s, pv]),
      addDebitNote: (d) => setDebitNotes((s) => [...s, d]),
    }),
    [vendors, vendorTypes, prs, invoices, vouchers],
  );

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export function useExpense() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpense must be used within ExpenseProvider");
  return ctx;
}

export function prTotal(pr: PR) {
  return pr.items.reduce(
    (sum, it) =>
      sum +
      (typeof it.payable === "number"
        ? it.payable!
        : (Number(it.total) || 0) +
          (Number(it.total) || 0) * (Number(it.gstRate || 0) / 100)),
    0,
  );
}
export function invoicedTotalForPR(invoices: Invoice[], prId: string) {
  return invoices
    .filter((i) => i.prId === prId)
    .reduce((s, i) => s + i.total, 0);
}

export function vouchersTotalForInvoice(vouchers: PaymentVoucher[], invoiceId: string) {
  return vouchers.reduce((sum, v) => sum + v.invoiceAmounts.filter((ia) => ia.invoiceId === invoiceId).reduce((s, ia) => s + ia.amount, 0), 0);
}
export function debitNotesTotalForInvoice(debitNotes: DebitNote[], invoiceId: string) {
  return debitNotes.filter((d) => d.invoiceId === invoiceId).reduce((s, d) => s + d.amount, 0);
}
export function debitNotesTotalForPR(debitNotes: DebitNote[], prId: string) {
  return debitNotes.filter((d) => d.prId === prId && !d.invoiceId).reduce((s, d) => s + d.amount, 0);
}
export function invoiceOutstanding(invoices: Invoice[], vouchers: PaymentVoucher[], debitNotes: DebitNote[], invoiceId: string) {
  const inv = invoices.find((i) => i.id === invoiceId);
  if (!inv) return 0;
  const paid = vouchersTotalForInvoice(vouchers, invoiceId);
  const deb = debitNotesTotalForInvoice(debitNotes, invoiceId);
  return Math.max(0, inv.total - paid - deb);
}

export function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
