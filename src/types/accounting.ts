export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subType: string;
  balance: number;
  description?: string;
  isSystem?: boolean;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  partyType?: 'NONE' | 'OWNER' | 'CUSTOMER' | 'VENDOR' | 'OTHER';
  partyId?: string;
  partyName?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  reference: string;
  memo: string;
  lines: JournalLine[];
  createdBy: string;
  createdAt: string;
  sourceType: 'INVOICE' | 'PAYMENT' | 'PURCHASE' | 'EXPENSE' | 'LOAN' | 'PARTNER' | 'MANUAL';
  sourceId?: string;
}

export interface Customer {
  id: string;
  serialNo: number;
  name: string;
  phone: string;
  address: string;
  totalPurchases: number;
  advancePaid: number;
  monthlyInstallment: number;
  remainingBalance: number;
  startDate: string;
  status: 'ACTIVE' | 'SETTLED' | 'OVERDUE';
  notes?: string;
  itemDescription?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  itemDescription: string;
  imeiOrSerial?: string;
  saleType: 'INSTALLMENT' | 'CASH';
  totalPrice: number;
  advancePaid: number;
  remainingBalance: number;
  monthlyInstallment: number;
  durationMonths: number;
  status: 'ACTIVE' | 'PAID' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  category: string;
  balancePayable: number;
  address?: string;
  notes?: string;
}

export interface SupplierTransaction {
  id: string;
  vendorId: string;
  vendorName: string;
  type: 'PURCHASE_BILL' | 'PAYMENT';
  date: string;
  reference: string;
  itemsOrDescription: string;
  totalAmount: number;
  paidAmount: number;
  balancePayableAfter: number;
  paymentMethod?: string;
  notes?: string;
}

export interface InstallmentPayment {
  id: string;
  receiptNo: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: 'CASH' | 'ONLINE_TRANSFER' | 'BANK' | 'EASYPAISA_JAZZCASH';
  discountAllowed: number;
  collectedBy: string;
  notes?: string;
  remainingBalanceAfter: number;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'MOBILE' | 'ELECTRONICS' | 'VEHICLE' | 'TRADING_GOODS' | 'OTHER';
  brand: string;
  model: string;
  imeiOrSerial?: string;
  storage?: string;
  condition: 'BRAND_NEW' | 'PRE_OWNED' | 'REFURBISHED';
  costPrice: number;
  sellingCashPrice: number;
  sellingInstallmentPrice: number;
  stockQty: number;
  minStockLevel: number;
  unit: string;
}

export interface ExpenseRecord {
  id: string;
  expenseNumber: string;
  date: string;
  category: 'COMMISSION' | 'PURCHASES' | 'PARTNER_DRAWINGS' | 'MOBILE_PACKAGES' | 'UTILITIES' | 'TRAVEL' | 'DISCOUNT_ALLOWED' | 'MISC_EXP';
  amount: number;
  paidFromAccountId: string;
  paidTo: string;
  description: string;
  loggedBy: string;
  status: 'APPROVED' | 'PENDING' | 'REIMBURSED';
  receiptImage?: string;
}

export interface LoanParty {
  id: string;
  name: string;
  contact?: string;
  type: 'LENDER' | 'BORROWER';
  totalReceived: number;
  totalRepaid: number;
  balanceToPay: number; // positive = we owe them
}

export interface LoanTransaction {
  id: string;
  date: string;
  partyId: string;
  partyName: string;
  type: 'RECEIVED' | 'REPAID';
  amount: number;
  description: string;
  accountAffected: string;
}

export interface PartnerEquity {
  id: string;
  name: string;
  sharePercentage: number;
  initialCapital: number;
  currentInvestment: number;
  drawings: number;
  dividendsPaid: number;
  netEquity: number;
}

export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'SALES_AGENT' | 'AUDITOR';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  password?: string;
  isOwner?: boolean;
  invitedBy?: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: string;
  status: 'PENDING' | 'ACCEPTED';
}
