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
  vendorTypeId?: string;
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
  };
  documents: {
    registrationName?: string;
    gstCertName?: string;
    panCardName?: string;
    aadhaarName?: string;
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
  mode: "UPI" | "NEFT" | "Cheque";
  date: string;
  description?: string;
  debitNoteLink?: string;
  fileName?: string;
  invoiceAmounts: PaymentInvoiceAmount[];
  total: number;
}

interface ExpenseStore {
  vendors: Vendor[];
  vendorTypes: VendorType[];
  prs: PR[];
  invoices: Invoice[];
  vouchers: PaymentVoucher[];
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
}

const ExpenseContext = createContext<ExpenseStore | null>(null);

const STORAGE_KEY = "expense-store-v1";

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorTypes, setVendorTypes] = useState<VendorType[]>([]);
  const [prs, setPRs] = useState<PR[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);

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
      }
    } catch {}
  }, []);

  useEffect(() => {
    const data = { vendors, vendorTypes, prs, invoices, vouchers };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [vendors, vendorTypes, prs, invoices, vouchers]);

  const value = useMemo<ExpenseStore>(
    () => ({
      vendors,
      vendorTypes,
      prs,
      invoices,
      vouchers,
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
          (Number(it.total) || 0) * (Number(it.gstRate || 0) / 100) -
          (Number(it.total) || 0) * (Number(it.tdsRate || 0) / 100)),
    0,
  );
}
export function invoicedTotalForPR(invoices: Invoice[], prId: string) {
  return invoices
    .filter((i) => i.prId === prId)
    .reduce((s, i) => s + i.total, 0);
}
export function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
