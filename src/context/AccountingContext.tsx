import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Account,
  Customer,
  Vendor,
  InventoryItem,
  ExpenseRecord,
  LoanParty,
  PartnerEquity,
  InstallmentPayment,
  JournalEntry,
  JournalLine,
  AppUser,
  UserRole,
  UserInvitation,
} from '../types/accounting';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CUSTOMERS,
  INITIAL_VENDORS,
  INITIAL_INVENTORY,
  INITIAL_LOAN_PARTIES,
  INITIAL_PARTNERS,
  INITIAL_RECENT_PAYMENTS,
  INITIAL_EXPENSES,
  APP_USERS,
} from '../data/initialData';

interface AccountingContextType {
  accounts: Account[];
  customers: Customer[];
  vendors: Vendor[];
  inventory: InventoryItem[];
  loanParties: LoanParty[];
  partners: PartnerEquity[];
  payments: InstallmentPayment[];
  expenses: ExpenseRecord[];
  journalEntries: JournalEntry[];
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  users: AppUser[];
  invitations: UserInvitation[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  inviteUser: (data: { email: string; name: string; role: UserRole }) => { success: boolean; error?: string };
  removeInvitation: (id: string) => void;
  syncStatus: 'SYNCED' | 'SYNCING' | 'OFFLINE';
  lastSyncedAt: Date;
  
  // High-level Actions
  recordInstallmentPayment: (data: {
    customerId: string;
    amount: number;
    paymentMethod: 'CASH' | 'ONLINE_TRANSFER' | 'BANK' | 'EASYPAISA_JAZZCASH';
    discountAllowed?: number;
    notes?: string;
  }) => { success: boolean; message: string; receiptNo?: string };

  batchRecordInstallments: (rows: Array<{
    customerId: string;
    amount: number;
    paymentMethod: 'CASH' | 'ONLINE_TRANSFER' | 'BANK' | 'EASYPAISA_JAZZCASH';
  }>) => { count: number; totalAmount: number };

  createCustomerInstallment: (data: {
    name: string;
    phone: string;
    address: string;
    totalPurchases: number;
    advancePaid: number;
    monthlyInstallment: number;
    startDate: string;
    itemDescription: string;
    itemId?: string;
  }) => { success: boolean; customer: Customer };

  recordExpense: (data: {
    category: ExpenseRecord['category'];
    amount: number;
    paidFromAccountId: string;
    paidTo: string;
    description: string;
    receiptImage?: string;
  }) => { success: boolean; expenseNumber: string };

  recordLoanTransaction: (data: {
    partyId: string;
    type: 'RECEIVED' | 'REPAID';
    amount: number;
    sourceAccountId: string;
    description: string;
  }) => void;

  recordPartnerDistribution: (data: {
    partnerId: string;
    type: 'DIVIDEND' | 'DRAWING' | 'INVESTMENT';
    amount: number;
    sourceAccountId: string;
    description: string;
  }) => void;

  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryStock: (itemId: string, newQty: number, reason: string) => void;

  recordPurchase: (data: {
    vendorId: string;
    vendorName: string;
    itemId: string;
    qty: number;
    unitCost: number;
    paymentMethod: 'CASH' | 'CREDIT' | 'BANK';
    notes?: string;
  }) => void;

  postJournalEntry: (entry: {
    memo: string;
    reference: string;
    date: string;
    lines: Array<{
      accountId: string;
      debit: number;
      credit: number;
      description: string;
    }>;
  }) => { success: boolean; error?: string };

  resetToDefaultData: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonStr: string) => boolean;

  // Real-time calculated indicators
  summaryMetrics: {
    remainingCustomerBalance: number;
    monthlyExpectedReturn: number;
    cashInHand: number;
    totalLoanPayable: number;
    capitalAndProfit: number;
    totalInventoryValuation: number;
    totalExpensesThisMonth: number;
  };
}

const STORAGE_KEY = 'ledgerflow_data_ush_v2';
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('ledgerflow_sync_channel') 
  : null;

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vendors`);
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inventory`);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [loanParties, setLoanParties] = useState<LoanParty[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_loans`);
    return saved ? JSON.parse(saved) : INITIAL_LOAN_PARTIES;
  });

  const [partners, setPartners] = useState<PartnerEquity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_partners`);
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [payments, setPayments] = useState<InstallmentPayment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : INITIAL_RECENT_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_journals`);
    if (saved) return JSON.parse(saved);
    // Initial opening entries
    return [
      {
        id: 'je_open_01',
        entryNumber: 'JE-2025-001',
        date: '2025-09-01',
        reference: 'OPENING',
        memo: 'Opening Balances of USH TRADERS Partners & Assets',
        createdBy: 'Salman',
        createdAt: new Date().toISOString(),
        sourceType: 'MANUAL',
        lines: [
          { id: 'jl_1', accountId: 'acc_1010', accountName: 'Cash In Hand', debit: 12450, credit: 0, description: 'Opening cash' },
          { id: 'jl_2', accountId: 'acc_1100', accountName: 'Accounts Receivable', debit: 820500, credit: 0, description: 'Opening customer installment receivables' },
          { id: 'jl_3', accountId: 'acc_1200', accountName: 'Merchandise Inventory', debit: 345000, credit: 0, description: 'Stock on hand' },
          { id: 'jl_4', accountId: 'acc_2100', accountName: 'Short-Term Loans Payable', debit: 0, credit: 45890, description: 'Faiz and lenders payable' },
          { id: 'jl_5', accountId: 'acc_3010', accountName: 'Salman Capital Account', debit: 0, credit: 91686.67, description: 'Partner share' },
          { id: 'jl_6', accountId: 'acc_3020', accountName: 'Ubaid Capital Account', debit: 0, credit: 91686.67, description: 'Partner share' },
          { id: 'jl_7', accountId: 'acc_3030', accountName: 'Hasnain Capital Account', debit: 0, credit: 91686.67, description: 'Partner share' },
          { id: 'jl_8', accountId: 'acc_3200', accountName: 'Retained Earnings & Accumulated Profit', debit: 0, credit: 846999.99, description: 'Accumulated business equity' },
        ]
      }
    ];
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : APP_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
    return saved ? JSON.parse(saved) : null;
  });

  const [invitations, setInvitations] = useState<UserInvitation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invitations`);
    return saved ? JSON.parse(saved) : [
      { id: 'inv_1', email: 'salman@ushtraders.com', name: 'Salman', role: 'ADMIN', invitedBy: 'arislearnings@gmail.com', invitedAt: '2026-09-01', status: 'ACCEPTED' },
      { id: 'inv_2', email: 'ubaid@ushtraders.com', name: 'Ubaid', role: 'ACCOUNTANT', invitedBy: 'arislearnings@gmail.com', invitedAt: '2026-09-01', status: 'ACCEPTED' },
      { id: 'inv_3', email: 'hasnain@ushtraders.com', name: 'Hasnain', role: 'ADMIN', invitedBy: 'arislearnings@gmail.com', invitedAt: '2026-09-01', status: 'ACCEPTED' },
    ];
  });

  const [syncStatus, setSyncStatus] = useState<'SYNCED' | 'SYNCING' | 'OFFLINE'>('SYNCED');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());

  // Save to localStorage whenever state updates and broadcast to other tabs
  const persistState = () => {
    localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
    localStorage.setItem(`${STORAGE_KEY}_vendors`, JSON.stringify(vendors));
    localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(inventory));
    localStorage.setItem(`${STORAGE_KEY}_loans`, JSON.stringify(loanParties));
    localStorage.setItem(`${STORAGE_KEY}_partners`, JSON.stringify(partners));
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
    localStorage.setItem(`${STORAGE_KEY}_journals`, JSON.stringify(journalEntries));
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
    localStorage.setItem(`${STORAGE_KEY}_invitations`, JSON.stringify(invitations));
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_currentUser`);
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'DATA_SYNC', timestamp: Date.now() });
    }
    setLastSyncedAt(new Date());
  };

  useEffect(() => {
    persistState();
  }, [accounts, customers, vendors, inventory, loanParties, partners, payments, expenses, journalEntries, users, currentUser, invitations]);

  // Listen to multi-tab sync
  useEffect(() => {
    if (!broadcastChannel) return;
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DATA_SYNC') {
        setSyncStatus('SYNCING');
        setTimeout(() => {
          const accs = localStorage.getItem(`${STORAGE_KEY}_accounts`);
          const custs = localStorage.getItem(`${STORAGE_KEY}_customers`);
          const vends = localStorage.getItem(`${STORAGE_KEY}_vendors`);
          const inv = localStorage.getItem(`${STORAGE_KEY}_inventory`);
          const loans = localStorage.getItem(`${STORAGE_KEY}_loans`);
          const parts = localStorage.getItem(`${STORAGE_KEY}_partners`);
          const pmts = localStorage.getItem(`${STORAGE_KEY}_payments`);
          const exps = localStorage.getItem(`${STORAGE_KEY}_expenses`);
          const jrnls = localStorage.getItem(`${STORAGE_KEY}_journals`);

          if (accs) setAccounts(JSON.parse(accs));
          if (custs) setCustomers(JSON.parse(custs));
          if (vends) setVendors(JSON.parse(vends));
          if (inv) setInventory(JSON.parse(inv));
          if (loans) setLoanParties(JSON.parse(loans));
          if (parts) setPartners(JSON.parse(parts));
          if (pmts) setPayments(JSON.parse(pmts));
          if (exps) setExpenses(JSON.parse(exps));
          if (jrnls) setJournalEntries(JSON.parse(jrnls));

          setSyncStatus('SYNCED');
          setLastSyncedAt(new Date());
        }, 300);
      }
    };
    broadcastChannel.addEventListener('message', handleMessage);
    return () => broadcastChannel.removeEventListener('message', handleMessage);
  }, []);

  // Summary Metrics calculated in real time (Matching USH TRADERS)
  const summaryMetrics = useMemo(() => {
    const remainingCustomerBalance = customers.reduce((sum, c) => sum + Math.max(0, c.remainingBalance), 0);
    const monthlyExpectedReturn = customers.reduce((sum, c) => sum + (c.status === 'ACTIVE' ? c.monthlyInstallment : 0), 0);
    const cashAcc = accounts.find(a => a.id === 'acc_1010');
    const cashInHand = cashAcc ? cashAcc.balance : 12450;
    const totalLoanPayable = loanParties.reduce((sum, l) => sum + Math.max(0, l.balanceToPay), 0);
    const capitalAndProfit = accounts
      .filter(a => a.type === 'EQUITY')
      .reduce((sum, a) => sum + a.balance, 0);
    const totalInventoryValuation = inventory.reduce((sum, i) => sum + (i.stockQty * i.costPrice), 0);
    const totalExpensesThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      remainingCustomerBalance,
      monthlyExpectedReturn,
      cashInHand,
      totalLoanPayable,
      capitalAndProfit,
      totalInventoryValuation,
      totalExpensesThisMonth,
    };
  }, [customers, accounts, loanParties, inventory, expenses]);

  // Action: Record single installment payment
  const recordInstallmentPayment = (data: {
    customerId: string;
    amount: number;
    paymentMethod: 'CASH' | 'ONLINE_TRANSFER' | 'BANK' | 'EASYPAISA_JAZZCASH';
    discountAllowed?: number;
    notes?: string;
  }) => {
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return { success: false, message: 'Customer not found' };

    const discount = data.discountAllowed || 0;
    const totalCreditToCustomer = data.amount + discount;
    const newRemaining = Math.max(0, customer.remainingBalance - totalCreditToCustomer);
    const receiptNo = `RCP-${1050 + payments.length + 1}`;
    const today = new Date().toISOString().split('T')[0];

    // Update Customer
    setCustomers(prev => prev.map(c => {
      if (c.id === data.customerId) {
        return {
          ...c,
          remainingBalance: newRemaining,
          status: newRemaining === 0 ? 'SETTLED' : 'ACTIVE',
        };
      }
      return c;
    }));

    // Record Payment
    const newPayment: InstallmentPayment = {
      id: `pmt_${Date.now()}`,
      receiptNo,
      customerId: customer.id,
      customerName: customer.name,
      date: today,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      discountAllowed: discount,
      collectedBy: currentUser?.name || 'Ari Accounts',
      notes: data.notes || `Installment from ${customer.name}`,
      remainingBalanceAfter: newRemaining,
    };
    setPayments(prev => [newPayment, ...prev]);

    // Choose target account for debit
    const targetAccountId = data.paymentMethod === 'CASH' 
      ? 'acc_1010' 
      : data.paymentMethod === 'EASYPAISA_JAZZCASH' 
        ? 'acc_1030' 
        : 'acc_1020';

    // Double Entry Journal lines
    const journalLines = [
      {
        id: `jl_${Date.now()}_1`,
        accountId: targetAccountId,
        accountName: accounts.find(a => a.id === targetAccountId)?.name || 'Cash',
        debit: data.amount,
        credit: 0,
        description: `Installment received from ${customer.name} (${data.paymentMethod})`,
        partyId: customer.id,
        partyName: customer.name,
      },
    ];

    if (discount > 0) {
      journalLines.push({
        id: `jl_${Date.now()}_2`,
        accountId: 'acc_5030',
        accountName: 'Discounts Allowed to Customers',
        debit: discount,
        credit: 0,
        description: `Discount granted to ${customer.name}`,
        partyId: customer.id,
        partyName: customer.name,
      });
    }

    journalLines.push({
      id: `jl_${Date.now()}_3`,
      accountId: 'acc_1100',
      accountName: 'Accounts Receivable (Customers)',
      debit: 0,
      credit: totalCreditToCustomer,
      description: `Customer account credited for installment`,
      partyId: customer.id,
      partyName: customer.name,
    });

    const newJournal: JournalEntry = {
      id: `je_${Date.now()}`,
      entryNumber: `JE-RCP-${payments.length + 1}`,
      date: today,
      reference: receiptNo,
      memo: `Installment payment collection - ${customer.name}`,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      sourceType: 'PAYMENT',
      sourceId: newPayment.id,
      lines: journalLines,
    };

    setJournalEntries(prev => [newJournal, ...prev]);

    // Update Account Balances
    setAccounts(prev => prev.map(a => {
      if (a.id === targetAccountId) return { ...a, balance: a.balance + data.amount };
      if (a.id === 'acc_1100') return { ...a, balance: a.balance - totalCreditToCustomer };
      if (discount > 0 && a.id === 'acc_5030') return { ...a, balance: a.balance + discount };
      return a;
    }));

    return { success: true, message: `Successfully collected ${data.amount} from ${customer.name}`, receiptNo };
  };

  // Action: Batch record multiple installments from batch collection sheet
  const batchRecordInstallments = (rows: Array<{
    customerId: string;
    amount: number;
    paymentMethod: 'CASH' | 'ONLINE_TRANSFER' | 'BANK' | 'EASYPAISA_JAZZCASH';
  }>) => {
    let count = 0;
    let totalAmount = 0;

    rows.forEach(row => {
      if (row.amount > 0 && row.customerId) {
        recordInstallmentPayment({
          customerId: row.customerId,
          amount: row.amount,
          paymentMethod: row.paymentMethod,
        });
        count++;
        totalAmount += row.amount;
      }
    });

    return { count, totalAmount };
  };

  // Action: Create new Customer with device/trading item sale
  const createCustomerInstallment = (data: {
    name: string;
    phone: string;
    address: string;
    totalPurchases: number;
    advancePaid: number;
    monthlyInstallment: number;
    startDate: string;
    itemDescription: string;
    itemId?: string;
  }) => {
    const newSerial = Math.max(...customers.map(c => c.serialNo), 36) + 1;
    const remainingBalance = Math.max(0, data.totalPurchases - data.advancePaid);

    const newCustomer: Customer = {
      id: `c_${Date.now()}`,
      serialNo: newSerial,
      name: data.name,
      phone: data.phone,
      address: data.address,
      totalPurchases: data.totalPurchases,
      advancePaid: data.advancePaid,
      monthlyInstallment: data.monthlyInstallment,
      remainingBalance,
      startDate: data.startDate,
      status: 'ACTIVE',
      itemDescription: data.itemDescription,
    };

    setCustomers(prev => [...prev, newCustomer]);

    // If an inventory item was chosen, decrease its stock
    let cogsAmount = 0;
    if (data.itemId) {
      const item = inventory.find(i => i.id === data.itemId);
      if (item) {
        cogsAmount = item.costPrice;
        setInventory(prev => prev.map(i => i.id === data.itemId ? { ...i, stockQty: Math.max(0, i.stockQty - 1) } : i));
      }
    }

    // Double-entry for the sale:
    // Dr Accounts Receivable (remaining balance)
    // Dr Cash In Hand (advance paid)
    // Cr Sales Revenue (total purchase price)
    // If COGS: Dr Cost of Goods Sold, Cr Inventory
    const lines: JournalLine[] = [
      {
        id: `jl_${Date.now()}_1`,
        accountId: 'acc_1100',
        accountName: 'Accounts Receivable (Customers)',
        debit: remainingBalance,
        credit: 0,
        description: `Installment receivable created for ${data.name}`,
        partyId: newCustomer.id,
        partyName: data.name,
      },
    ];

    if (data.advancePaid > 0) {
      lines.push({
        id: `jl_${Date.now()}_2`,
        accountId: 'acc_1010',
        accountName: 'Cash In Hand',
        debit: data.advancePaid,
        credit: 0,
        description: `Advance received on sale from ${data.name}`,
        partyId: newCustomer.id,
        partyName: data.name,
      });
    }

    lines.push({
      id: `jl_${Date.now()}_3`,
      accountId: 'acc_4010',
      accountName: 'Sales Revenue - Mobiles & Trading',
      debit: 0,
      credit: data.totalPurchases,
      description: `Device/item sale to ${data.name}: ${data.itemDescription}`,
      partyId: newCustomer.id,
      partyName: data.name,
    });

    if (cogsAmount > 0) {
      lines.push({
        id: `jl_${Date.now()}_4`,
        accountId: 'acc_5010',
        accountName: 'Cost of Goods Sold (COGS)',
        debit: cogsAmount,
        credit: 0,
        description: `Cost of device sold to ${data.name}`,
      });
      lines.push({
        id: `jl_${Date.now()}_5`,
        accountId: 'acc_1200',
        accountName: 'Merchandise Inventory',
        debit: 0,
        credit: cogsAmount,
        description: `Inventory reduction for item sale`,
      });
    }

    const journal: JournalEntry = {
      id: `je_${Date.now()}`,
      entryNumber: `JE-INV-${newSerial}`,
      date: data.startDate,
      reference: `INV-${newSerial}`,
      memo: `Sale & Installment Contract - ${data.name} (${data.itemDescription})`,
      createdBy: currentUser?.name || 'Ari Accounts',
      createdAt: new Date().toISOString(),
      sourceType: 'INVOICE',
      sourceId: newCustomer.id,
      lines,
    };

    setJournalEntries(prev => [journal, ...prev]);

    // Update accounts
    setAccounts(prev => prev.map(a => {
      if (a.id === 'acc_1100') return { ...a, balance: a.balance + remainingBalance };
      if (a.id === 'acc_1010') return { ...a, balance: a.balance + data.advancePaid };
      if (a.id === 'acc_4010') return { ...a, balance: a.balance + data.totalPurchases };
      if (cogsAmount > 0) {
        if (a.id === 'acc_5010') return { ...a, balance: a.balance + cogsAmount };
        if (a.id === 'acc_1200') return { ...a, balance: a.balance - cogsAmount };
      }
      return a;
    }));

    return { success: true, customer: newCustomer };
  };

  // Action: Record Expense
  const recordExpense = (data: {
    category: ExpenseRecord['category'];
    amount: number;
    paidFromAccountId: string;
    paidTo: string;
    description: string;
    receiptImage?: string;
  }) => {
    const expenseNumber = `EXP-${100 + expenses.length + 1}`;
    const today = new Date().toISOString().split('T')[0];

    const newExpense: ExpenseRecord = {
      id: `exp_${Date.now()}`,
      expenseNumber,
      date: today,
      category: data.category,
      amount: data.amount,
      paidFromAccountId: data.paidFromAccountId,
      paidTo: data.paidTo,
      description: data.description,
      loggedBy: currentUser?.name || 'Ari Accounts',
      status: 'APPROVED',
      receiptImage: data.receiptImage,
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Determine target expense account
    let expenseAccountId = 'acc_5090'; // Misc
    if (data.category === 'COMMISSION') expenseAccountId = 'acc_5020';
    else if (data.category === 'MOBILE_PACKAGES') expenseAccountId = 'acc_5040';
    else if (data.category === 'UTILITIES') expenseAccountId = 'acc_5050';
    else if (data.category === 'DISCOUNT_ALLOWED') expenseAccountId = 'acc_5030';
    else if (data.category === 'PARTNER_DRAWINGS') expenseAccountId = 'acc_3300';
    else if (data.category === 'PURCHASES') expenseAccountId = 'acc_5010';

    // Journal Entry
    const newJournal: JournalEntry = {
      id: `je_${Date.now()}`,
      entryNumber: `JE-${expenseNumber}`,
      date: today,
      reference: expenseNumber,
      memo: `${data.category}: ${data.description} paid to ${data.paidTo}`,
      createdBy: currentUser?.name || 'Ari Accounts',
      createdAt: new Date().toISOString(),
      sourceType: 'EXPENSE',
      sourceId: newExpense.id,
      lines: [
        {
          id: `jl_${Date.now()}_1`,
          accountId: expenseAccountId,
          accountName: accounts.find(a => a.id === expenseAccountId)?.name || 'Expense',
          debit: data.amount,
          credit: 0,
          description: data.description,
        },
        {
          id: `jl_${Date.now()}_2`,
          accountId: data.paidFromAccountId,
          accountName: accounts.find(a => a.id === data.paidFromAccountId)?.name || 'Cash In Hand',
          debit: 0,
          credit: data.amount,
          description: `Payment for ${expenseNumber}`,
        },
      ],
    };

    setJournalEntries(prev => [newJournal, ...prev]);

    // Update Accounts
    setAccounts(prev => prev.map(a => {
      if (a.id === expenseAccountId) return { ...a, balance: a.balance + data.amount };
      if (a.id === data.paidFromAccountId) return { ...a, balance: a.balance - data.amount };
      return a;
    }));

    return { success: true, expenseNumber };
  };

  // Action: Record Loan Inflow or Repayment (Faiz, Dawood, etc.)
  const recordLoanTransaction = (data: {
    partyId: string;
    type: 'RECEIVED' | 'REPAID';
    amount: number;
    sourceAccountId: string;
    description: string;
  }) => {
    const party = loanParties.find(l => l.id === data.partyId);
    if (!party) return;

    const today = new Date().toISOString().split('T')[0];

    // Update Party
    setLoanParties(prev => prev.map(l => {
      if (l.id === data.partyId) {
        if (data.type === 'RECEIVED') {
          return {
            ...l,
            totalReceived: l.totalReceived + data.amount,
            balanceToPay: l.balanceToPay + data.amount,
          };
        } else {
          return {
            ...l,
            totalRepaid: l.totalRepaid + data.amount,
            balanceToPay: Math.max(0, l.balanceToPay - data.amount),
          };
        }
      }
      return l;
    }));

    // Double Entry:
    // Received: Dr Cash/Bank, Cr Short-Term Loans Payable
    // Repaid: Dr Short-Term Loans Payable, Cr Cash/Bank
    const lines = data.type === 'RECEIVED'
      ? [
          {
            id: `jl_${Date.now()}_1`,
            accountId: data.sourceAccountId,
            accountName: accounts.find(a => a.id === data.sourceAccountId)?.name || 'Cash',
            debit: data.amount,
            credit: 0,
            description: `Loan received from ${party.name}`,
            partyId: party.id,
            partyName: party.name,
          },
          {
            id: `jl_${Date.now()}_2`,
            accountId: 'acc_2100',
            accountName: 'Short-Term Loans Payable',
            debit: 0,
            credit: data.amount,
            description: `Loan liability increased from ${party.name}`,
            partyId: party.id,
            partyName: party.name,
          },
        ]
      : [
          {
            id: `jl_${Date.now()}_1`,
            accountId: 'acc_2100',
            accountName: 'Short-Term Loans Payable',
            debit: data.amount,
            credit: 0,
            description: `Repayment of loan to ${party.name}`,
            partyId: party.id,
            partyName: party.name,
          },
          {
            id: `jl_${Date.now()}_2`,
            accountId: data.sourceAccountId,
            accountName: accounts.find(a => a.id === data.sourceAccountId)?.name || 'Cash',
            debit: 0,
            credit: data.amount,
            description: `Cash outflow for loan repayment`,
            partyId: party.id,
            partyName: party.name,
          },
        ];

    const journal: JournalEntry = {
      id: `je_${Date.now()}`,
      entryNumber: `JE-LOAN-${Date.now().toString().slice(-4)}`,
      date: today,
      reference: `LOAN-${party.name}`,
      memo: `${data.type === 'RECEIVED' ? 'Loan Borrowed from' : 'Loan Repaid to'} ${party.name}: ${data.description}`,
      createdBy: currentUser?.name || 'Ari Accounts',
      createdAt: new Date().toISOString(),
      sourceType: 'LOAN',
      lines,
    };

    setJournalEntries(prev => [journal, ...prev]);

    // Update Accounts
    setAccounts(prev => prev.map(a => {
      if (a.id === data.sourceAccountId) {
        return { ...a, balance: data.type === 'RECEIVED' ? a.balance + data.amount : a.balance - data.amount };
      }
      if (a.id === 'acc_2100') {
        return { ...a, balance: data.type === 'RECEIVED' ? a.balance + data.amount : a.balance - data.amount };
      }
      return a;
    }));
  };

  // Action: Partner Equity, Dividend, or Drawings
  const recordPartnerDistribution = (data: {
    partnerId: string;
    type: 'DIVIDEND' | 'DRAWING' | 'INVESTMENT';
    amount: number;
    sourceAccountId: string;
    description: string;
  }) => {
    const partner = partners.find(p => p.id === data.partnerId);
    if (!partner) return;

    const today = new Date().toISOString().split('T')[0];

    setPartners(prev => prev.map(p => {
      if (p.id === data.partnerId) {
        if (data.type === 'DIVIDEND') {
          return { ...p, dividendsPaid: p.dividendsPaid + data.amount, netEquity: p.netEquity - data.amount };
        } else if (data.type === 'DRAWING') {
          return { ...p, drawings: p.drawings + data.amount, netEquity: p.netEquity - data.amount };
        } else {
          return { ...p, currentInvestment: p.currentInvestment + data.amount, netEquity: p.netEquity + data.amount };
        }
      }
      return p;
    }));

    // Partner capital accounts
    let partnerCapAccount = 'acc_3010';
    if (partner.name.toLowerCase().includes('ubaid')) partnerCapAccount = 'acc_3020';
    if (partner.name.toLowerCase().includes('hasnain')) partnerCapAccount = 'acc_3030';

    const lines = data.type === 'INVESTMENT'
      ? [
          {
            id: `jl_${Date.now()}_1`,
            accountId: data.sourceAccountId,
            accountName: 'Cash In Hand',
            debit: data.amount,
            credit: 0,
            description: `Capital injection by ${partner.name}`,
          },
          {
            id: `jl_${Date.now()}_2`,
            accountId: partnerCapAccount,
            accountName: `${partner.name} Capital Account`,
            debit: 0,
            credit: data.amount,
            description: `Partner equity credit`,
          },
        ]
      : [
          {
            id: `jl_${Date.now()}_1`,
            accountId: data.type === 'DIVIDEND' ? 'acc_3200' : 'acc_3300',
            accountName: data.type === 'DIVIDEND' ? 'Retained Earnings (Dividend)' : 'Partner Drawings',
            debit: data.amount,
            credit: 0,
            description: `${data.type} paid to ${partner.name}`,
          },
          {
            id: `jl_${Date.now()}_2`,
            accountId: data.sourceAccountId,
            accountName: 'Cash In Hand',
            debit: 0,
            credit: data.amount,
            description: `Cash outflow for partner ${data.type}`,
          },
        ];

    const journal: JournalEntry = {
      id: `je_${Date.now()}`,
      entryNumber: `JE-PART-${Date.now().toString().slice(-4)}`,
      date: today,
      reference: `PART-${partner.name}`,
      memo: `Partner ${data.type} - ${partner.name}: ${data.description}`,
      createdBy: currentUser?.name || 'Ari Accounts',
      createdAt: new Date().toISOString(),
      sourceType: 'PARTNER',
      lines,
    };

    setJournalEntries(prev => [journal, ...prev]);

    setAccounts(prev => prev.map(a => {
      if (a.id === data.sourceAccountId) {
        return { ...a, balance: data.type === 'INVESTMENT' ? a.balance + data.amount : a.balance - data.amount };
      }
      if (data.type === 'INVESTMENT' && a.id === partnerCapAccount) {
        return { ...a, balance: a.balance + data.amount };
      }
      if (data.type === 'DRAWING' && a.id === 'acc_3300') {
        return { ...a, balance: a.balance - data.amount };
      }
      if (data.type === 'DIVIDEND' && a.id === 'acc_3200') {
        return { ...a, balance: a.balance - data.amount };
      }
      return a;
    }));
  };

  // Action: Add new item to Inventory
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `item_${Date.now()}`,
    };
    setInventory(prev => [newItem, ...prev]);
  };

  // Action: Adjust Stock
  const updateInventoryStock = (itemId: string, newQty: number, reason: string) => {
    setInventory(prev => prev.map(i => {
      if (i.id === itemId) {
        return { ...i, stockQty: newQty };
      }
      return i;
    }));
  };

  // Action: Purchase from Vendor (e.g. Faiz)
  const recordPurchase = (data: {
    vendorId: string;
    vendorName: string;
    itemId: string;
    qty: number;
    unitCost: number;
    paymentMethod: 'CASH' | 'CREDIT' | 'BANK';
    notes?: string;
  }) => {
    const totalCost = data.qty * data.unitCost;
    const today = new Date().toISOString().split('T')[0];

    // Increase stock
    setInventory(prev => prev.map(item => {
      if (item.id === data.itemId) {
        return {
          ...item,
          stockQty: item.stockQty + data.qty,
          costPrice: data.unitCost, // Update latest purchase cost
        };
      }
      return item;
    }));

    // If on credit, update vendor payable
    if (data.paymentMethod === 'CREDIT') {
      setVendors(prev => prev.map(v => {
        if (v.id === data.vendorId) {
          return { ...v, balancePayable: v.balancePayable + totalCost };
        }
        return v;
      }));
    }

    const paymentAccountId = data.paymentMethod === 'CASH' 
      ? 'acc_1010' 
      : data.paymentMethod === 'BANK' 
        ? 'acc_1020' 
        : 'acc_2010'; // Accounts payable

    // Journal Entry:
    // Dr Inventory (acc_1200)
    // Cr Cash/Bank or Accounts Payable
    const journal: JournalEntry = {
      id: `je_${Date.now()}`,
      entryNumber: `JE-PUR-${Date.now().toString().slice(-4)}`,
      date: today,
      reference: `PUR-${data.vendorName}`,
      memo: `Stock purchase from ${data.vendorName} (${data.qty} units @ ${data.unitCost})`,
      createdBy: currentUser?.name || 'Ari Accounts',
      createdAt: new Date().toISOString(),
      sourceType: 'PURCHASE',
      lines: [
        {
          id: `jl_${Date.now()}_1`,
          accountId: 'acc_1200',
          accountName: 'Merchandise Inventory',
          debit: totalCost,
          credit: 0,
          description: `Inventory increase: ${data.qty} units`,
        },
        {
          id: `jl_${Date.now()}_2`,
          accountId: paymentAccountId,
          accountName: accounts.find(a => a.id === paymentAccountId)?.name || 'Payable',
          debit: 0,
          credit: totalCost,
          description: `Payment/Payable to ${data.vendorName}`,
        },
      ],
    };

    setJournalEntries(prev => [journal, ...prev]);

    setAccounts(prev => prev.map(a => {
      if (a.id === 'acc_1200') return { ...a, balance: a.balance + totalCost };
      if (a.id === paymentAccountId) {
        return {
          ...a,
          balance: data.paymentMethod === 'CREDIT' ? a.balance + totalCost : a.balance - totalCost,
        };
      }
      return a;
    }));
  };

  // Action: General Ledger / Manual Journal Entry (Batch Ledger Spreadsheet)
  const postJournalEntry = (entry: {
    memo: string;
    reference: string;
    date: string;
    lines: Array<{
      accountId: string;
      debit: number;
      credit: number;
      description: string;
    }>;
  }) => {
    const totalDebit = entry.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = entry.lines.reduce((sum, l) => sum + (l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return {
        success: false,
        error: `Journal entry must balance! Debits: ${totalDebit.toFixed(2)}, Credits: ${totalCredit.toFixed(2)} (Diff: ${(totalDebit - totalCredit).toFixed(2)})`,
      };
    }

    const newJournal: JournalEntry = {
      id: `je_${Date.now()}`,
      entryNumber: `JE-${journalEntries.length + 101}`,
      date: entry.date,
      reference: entry.reference || 'MANUAL',
      memo: entry.memo,
      createdBy: currentUser?.name || 'Ari Accounts',
      createdAt: new Date().toISOString(),
      sourceType: 'MANUAL',
      lines: entry.lines.map((l, idx) => ({
        id: `jl_${Date.now()}_${idx}`,
        accountId: l.accountId,
        accountName: accounts.find(a => a.id === l.accountId)?.name || 'Account',
        debit: l.debit || 0,
        credit: l.credit || 0,
        description: l.description,
      })),
    };

    setJournalEntries(prev => [newJournal, ...prev]);

    // Update respective account balances
    setAccounts(prev => prev.map(acc => {
      const line = entry.lines.find(l => l.accountId === acc.id);
      if (!line) return acc;

      const netChange = (acc.type === 'ASSET' || acc.type === 'EXPENSE')
        ? (line.debit - line.credit)
        : (line.credit - line.debit);

      return {
        ...acc,
        balance: acc.balance + netChange,
      };
    }));

    return { success: true };
  };

  // Reset to original USH TRADERS data
  const resetToDefaultData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_accounts`);
    localStorage.removeItem(`${STORAGE_KEY}_customers`);
    localStorage.removeItem(`${STORAGE_KEY}_vendors`);
    localStorage.removeItem(`${STORAGE_KEY}_inventory`);
    localStorage.removeItem(`${STORAGE_KEY}_loans`);
    localStorage.removeItem(`${STORAGE_KEY}_partners`);
    localStorage.removeItem(`${STORAGE_KEY}_payments`);
    localStorage.removeItem(`${STORAGE_KEY}_expenses`);
    localStorage.removeItem(`${STORAGE_KEY}_journals`);

    setAccounts(INITIAL_ACCOUNTS);
    setCustomers(INITIAL_CUSTOMERS);
    setVendors(INITIAL_VENDORS);
    setInventory(INITIAL_INVENTORY);
    setLoanParties(INITIAL_LOAN_PARTIES);
    setPartners(INITIAL_PARTNERS);
    setPayments(INITIAL_RECENT_PAYMENTS);
    setExpenses(INITIAL_EXPENSES);
    setJournalEntries([]);
  };

  // Export database backup
  const exportDatabaseJSON = () => {
    const data = {
      company: 'USH TRADERS',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      accounts,
      customers,
      vendors,
      inventory,
      loanParties,
      partners,
      payments,
      expenses,
      journalEntries,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `USH_TRADERS_LedgerFlow_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import database backup
  const importDatabaseJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.accounts && parsed.customers) {
        setAccounts(parsed.accounts);
        setCustomers(parsed.customers);
        if (parsed.vendors) setVendors(parsed.vendors);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.loanParties) setLoanParties(parsed.loanParties);
        if (parsed.partners) setPartners(parsed.partners);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.journalEntries) setJournalEntries(parsed.journalEntries);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    // Default primary admin rule: arislearnings@gmail.com can log in without invite
    if (cleanEmail === 'arislearnings@gmail.com') {
      if (password === 'admin123') {
        const owner = users.find(u => u.email.toLowerCase() === 'arislearnings@gmail.com') || APP_USERS[0];
        setCurrentUser(owner);
        localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(owner));
        return { success: true };
      }
      return { success: false, error: 'Incorrect password for arislearnings@gmail.com.' };
    }

    // Any other user must be explicitly invited
    const isInvited = invitations.some(inv => inv.email.toLowerCase() === cleanEmail) ||
      users.some(u => u.email.toLowerCase() === cleanEmail && u.invitedBy);

    if (!isInvited) {
      return {
        success: false,
        error: 'Access restricted. You must be invited by the primary administrator (arislearnings@gmail.com) to access USH TRADERS.',
      };
    }

    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      if (existingUser.password && existingUser.password !== password) {
        return { success: false, error: 'Incorrect password for invited account.' };
      }
      setCurrentUser(existingUser);
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(existingUser));
      return { success: true };
    }

    const invitation = invitations.find(inv => inv.email.toLowerCase() === cleanEmail);
    if (invitation) {
      const newUser: AppUser = {
        id: `user_${Date.now()}`,
        name: invitation.name,
        email: invitation.email,
        role: invitation.role,
        avatar: invitation.name.charAt(0).toUpperCase(),
        password,
        invitedBy: invitation.invitedBy,
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(newUser));
      return { success: true };
    }

    return { success: false, error: 'Account not found.' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_KEY}_currentUser`);
  };

  const inviteUser = (data: { email: string; name: string; role: UserRole }): { success: boolean; error?: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (invitations.some(i => i.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'This email has already been invited.' };
    }

    const newInv: UserInvitation = {
      id: `inv_${Date.now()}`,
      email: cleanEmail,
      name: data.name,
      role: data.role,
      invitedBy: currentUser?.email || 'arislearnings@gmail.com',
      invitedAt: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    };

    setInvitations(prev => [...prev, newInv]);

    const newUser: AppUser = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: cleanEmail,
      role: data.role,
      avatar: data.name.charAt(0).toUpperCase(),
      password: 'user123',
      invitedBy: currentUser?.email || 'arislearnings@gmail.com',
    };
    setUsers(prev => [...prev, newUser]);

    return { success: true };
  };

  const removeInvitation = (id: string) => {
    const target = invitations.find(i => i.id === id);
    setInvitations(prev => prev.filter(i => i.id !== id));
    if (target) {
      setUsers(prev => prev.filter(u => u.email.toLowerCase() !== target.email.toLowerCase() || u.isOwner));
    }
  };

  return (
    <AccountingContext.Provider
      value={{
        accounts,
        customers,
        vendors,
        inventory,
        loanParties,
        partners,
        payments,
        expenses,
        journalEntries,
        currentUser,
        setCurrentUser,
        users,
        invitations,
        login,
        logout,
        inviteUser,
        removeInvitation,
        syncStatus,
        lastSyncedAt,
        summaryMetrics,
        recordInstallmentPayment,
        batchRecordInstallments,
        createCustomerInstallment,
        recordExpense,
        recordLoanTransaction,
        recordPartnerDistribution,
        addInventoryItem,
        updateInventoryStock,
        recordPurchase,
        postJournalEntry,
        resetToDefaultData,
        exportDatabaseJSON,
        importDatabaseJSON,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
