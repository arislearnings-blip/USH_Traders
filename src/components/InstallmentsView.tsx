import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Customer, InstallmentPayment } from '../types/accounting';
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Receipt,
  Printer,
  Share2,
  CheckCircle,
  X,
  ArrowUpDown,
  History,
  PhoneCall,
  Calendar,
  Wallet,
  Eye,
  Edit3,
  Trash2,
  DollarSign,
  User,
} from 'lucide-react';
import { UshTradersIcon } from './UshTradersIcon';

interface InstallmentsViewProps {
  initialSelectedCustomerId?: string | null;
  onOpenNewSale: () => void;
}

export const InstallmentsView: React.FC<InstallmentsViewProps> = ({
  initialSelectedCustomerId,
  onOpenNewSale,
}) => {
  const {
    customers,
    payments,
    recordInstallmentPayment,
    batchRecordInstallments,
    createCustomerInstallment,
    updateCustomer,
    deleteCustomer,
    updatePayment,
    deletePayment,
  } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SETTLED'>('ALL');
  const [sortBy, setSortBy] = useState<'serialNo' | 'name' | 'remainingBalance' | 'monthlyInstallment'>('serialNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mode: Standard list vs Batch Collection Sheet
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchAmounts, setBatchAmounts] = useState<{ [customerId: string]: number }>({});
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  // Quick Add Customer Khata Modal
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    itemDescription: '',
    totalPurchases: 0,
    advancePaid: 0,
    monthlyInstallment: 0,
    startDate: new Date().toISOString().split('T')[0],
  });

  // Single Payment Collection Modal
  const [activePaymentCustomer, setActivePaymentCustomer] = useState<Customer | null>(() => {
    if (initialSelectedCustomerId) {
      return customers.find(c => c.id === initialSelectedCustomerId) || null;
    }
    return null;
  });
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE_TRANSFER' | 'BANK' | 'EASYPAISA_JAZZCASH'>('CASH');
  const [discountAllowed, setDiscountAllowed] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);

  // Customer Khata (Ledger) Detail Modal
  const [khataCustomer, setKhataCustomer] = useState<Customer | null>(null);

  // Edit Customer Modal
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Edit Payment Modal
  const [editingPayment, setEditingPayment] = useState<InstallmentPayment | null>(null);

  // Printing Individual Receipt Voucher Modal
  const [printingPaymentSlip, setPrintingPaymentSlip] = useState<InstallmentPayment | null>(null);

  // Sorting & Filtering
  const filteredCustomers = customers
    .filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.serialNo.toString().includes(searchTerm) ||
        (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.itemDescription && c.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()));
      if (filterStatus === 'ACTIVE') return matchSearch && c.status === 'ACTIVE';
      if (filterStatus === 'SETTLED') return matchSearch && c.status === 'SETTLED';
      return matchSearch;
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      return sortOrder === 'asc' 
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

  const totalRemaining = filteredCustomers.reduce((sum, c) => sum + c.remainingBalance, 0);
  const totalMonthlyDue = filteredCustomers.reduce((sum, c) => sum + (c.status === 'ACTIVE' ? c.monthlyInstallment : 0), 0);
  const totalPurchases = filteredCustomers.reduce((sum, c) => sum + c.totalPurchases, 0);
  const totalAdvances = filteredCustomers.reduce((sum, c) => sum + c.advancePaid, 0);

  const handleOpenPaymentModal = (customer: Customer) => {
    setActivePaymentCustomer(customer);
    setPaymentAmount(customer.monthlyInstallment);
    setDiscountAllowed(0);
    setPaymentNotes('');
    setLastReceipt(null);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentCustomer || paymentAmount <= 0) return;

    const res = recordInstallmentPayment({
      customerId: activePaymentCustomer.id,
      amount: paymentAmount,
      paymentMethod,
      discountAllowed,
      notes: paymentNotes,
    });

    if (res.success) {
      setLastReceipt({
        receiptNo: res.receiptNo,
        customerName: activePaymentCustomer.name,
        amount: paymentAmount,
        discountAllowed,
        method: paymentMethod,
        date: new Date().toLocaleDateString(),
        previousBalance: activePaymentCustomer.remainingBalance,
        newBalance: Math.max(0, activePaymentCustomer.remainingBalance - paymentAmount - discountAllowed),
      });
    }
  };

  const handleBatchAutoFill = () => {
    const filled: { [customerId: string]: number } = {};
    customers.filter(c => c.status === 'ACTIVE').forEach(c => {
      filled[c.id] = c.monthlyInstallment;
    });
    setBatchAmounts(filled);
  };

  const handleBatchSubmit = () => {
    const rows = Object.entries(batchAmounts)
      .filter(([_, amt]) => amt > 0)
      .map(([customerId, amount]) => ({
        customerId,
        amount,
        paymentMethod: 'CASH' as const,
      }));

    if (rows.length === 0) return;

    const res = batchRecordInstallments(rows);
    setBatchSuccessMsg(`Successfully processed ${res.count} installment collections totalling Rs ${res.totalAmount.toLocaleString()}!`);
    setBatchAmounts({});
    setTimeout(() => setBatchSuccessMsg(null), 5000);
  };

  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    updateCustomer(editingCustomer.id, {
      name: editingCustomer.name,
      phone: editingCustomer.phone,
      address: editingCustomer.address,
      itemDescription: editingCustomer.itemDescription,
      totalPurchases: Number(editingCustomer.totalPurchases),
      advancePaid: Number(editingCustomer.advancePaid),
      monthlyInstallment: Number(editingCustomer.monthlyInstallment),
      remainingBalance: Number(editingCustomer.remainingBalance),
      status: editingCustomer.status,
      notes: editingCustomer.notes,
    });

    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete customer record for "${name}"? This action will remove all linked ledger transactions.`)) {
      deleteCustomer(id);
      if (khataCustomer?.id === id) setKhataCustomer(null);
    }
  };

  const handleDeletePayment = (paymentId: string, receiptNo: string) => {
    if (window.confirm(`Delete receipt ${receiptNo}? This will restore the customer's balance and reverse the cash collection.`)) {
      deletePayment(paymentId);
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name || Number(newCustomerForm.totalPurchases) <= 0) return;

    createCustomerInstallment({
      name: newCustomerForm.name,
      phone: newCustomerForm.phone || '0300-0000000',
      address: newCustomerForm.address || 'Local Market',
      totalPurchases: Number(newCustomerForm.totalPurchases),
      advancePaid: Number(newCustomerForm.advancePaid),
      monthlyInstallment: Number(newCustomerForm.monthlyInstallment),
      startDate: newCustomerForm.startDate || new Date().toISOString().split('T')[0],
      itemDescription: newCustomerForm.itemDescription || 'Device purchase',
    });

    setIsAddCustomerModalOpen(false);
    setNewCustomerForm({
      name: '',
      phone: '',
      address: '',
      itemDescription: '',
      totalPurchases: 0,
      advancePaid: 0,
      monthlyInstallment: 0,
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleSaveEditPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    updatePayment(editingPayment.id, {
      paymentMethod: editingPayment.paymentMethod,
      notes: editingPayment.notes,
    });

    setEditingPayment(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Metric Summary */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Customer Installment Ledgers
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-md border border-indigo-200 dark:border-indigo-800">
                USH TRADERS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete customer Khata registry with automated balance reconciliation, inline editing, and payment voucher receipts
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Add New Customer Khata directly"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Add Khata</span>
            </button>

            <button
              onClick={() => setIsBatchMode(!isBatchMode)}
              className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isBatchMode
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isBatchMode ? 'Exit Batch Sheet' : 'Batch Collection Sheet'}</span>
            </button>

            <button
              onClick={onOpenNewSale}
              className="px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Sale / Invoice</span>
            </button>
          </div>
        </div>

        {/* Aggregate Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Outstanding Bal</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
              Rs {totalRemaining.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Monthly Dues Expected</div>
            <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
              Rs {totalMonthlyDue.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Gross Purchases</div>
            <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
              Rs {totalPurchases.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Advance Downpayments</div>
            <div className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-400 tabular-nums mt-0.5">
              Rs {totalAdvances.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {batchSuccessMsg && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-xs flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{batchSuccessMsg}</span>
          </div>
          <button onClick={() => setBatchSuccessMsg(null)} className="cursor-pointer">✕</button>
        </div>
      )}

      {/* Multi-Customer Batch Collection Mode */}
      {isBatchMode ? (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Multi-Customer Installment Collection Sheet</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rapidly mark monthly installment recoveries across all customers in a single sheet submit
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchAutoFill}
                className="px-3 py-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                Auto-fill All Monthly Dues
              </button>
              <button
                onClick={handleBatchSubmit}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Post Batch Payments ({Object.values(batchAmounts).filter(v => v > 0).length})
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto max-h-[600px] border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs sheet-table ledger-table">
              <thead className="sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="w-12 text-center">S.No</th>
                  <th>Customer Name</th>
                  <th>Phone / Address</th>
                  <th className="text-right">Remaining Balance</th>
                  <th className="text-right">Monthly Installment</th>
                  <th className="w-48 text-right bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300">
                    Collected Today (Rs)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                      #{c.serialNo}
                    </td>
                    <td className="font-bold text-slate-900 dark:text-white">
                      {c.name}
                    </td>
                    <td className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {c.phone} {c.address ? `· ${c.address}` : ''}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      Rs {c.remainingBalance.toLocaleString()}
                    </td>
                    <td className="text-right font-mono text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">
                      Rs {c.monthlyInstallment.toLocaleString()}
                    </td>
                    <td className="p-1 bg-emerald-50/40 dark:bg-emerald-950/30 text-right">
                      <input
                        type="number"
                        placeholder="0"
                        value={batchAmounts[c.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setBatchAmounts(prev => ({ ...prev, [c.id]: val }));
                        }}
                        className="w-full px-2.5 py-1 text-right font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Standard High-Fidelity Ledger View with Full CRUD */
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, phone, serial #, or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {(['ALL', 'ACTIVE', 'SETTLED'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      filterStatus === status
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {status === 'ALL' ? 'All Records' : status === 'ACTIVE' ? 'Active' : 'Settled'}
                  </button>
                ))}
              </div>

              {/* Sort selector */}
              <select
                aria-label="Sort customer table"
                value={`${sortBy}_${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('_') as [any, any];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="serialNo_asc">Sort: S.No (1-9)</option>
                <option value="serialNo_desc">Sort: S.No (9-1)</option>
                <option value="name_asc">Sort: Name (A-Z)</option>
                <option value="remainingBalance_desc">Sort: Highest Balance</option>
                <option value="monthlyInstallment_desc">Sort: Highest Monthly</option>
              </select>
            </div>
          </div>

          {/* Customer Khata Registry Table */}
          <div className="mt-4 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs sheet-table ledger-table">
              <thead>
                <tr>
                  <th className="w-12 text-center">#</th>
                  <th className="w-24">Date</th>
                  <th>Customer Particulars</th>
                  <th>Purchased Item</th>
                  <th className="text-right w-24">Total Purchases</th>
                  <th className="text-right w-24">Advance Paid</th>
                  <th className="text-right w-28">Monthly Due</th>
                  <th className="text-right w-28">Remaining Bal</th>
                  <th className="text-center w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
                      No customer records match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                        #{cust.serialNo}
                      </td>
                      <td className="text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {cust.startDate}
                      </td>
                      <td>
                        <div className="font-bold text-slate-900 dark:text-white">{cust.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {cust.phone} {cust.address ? `· ${cust.address}` : ''}
                        </div>
                      </td>
                      <td className="text-slate-700 dark:text-slate-300 text-[11px]">
                        {cust.itemDescription || 'Device purchase'}
                      </td>
                      <td className="text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        Rs {cust.totalPurchases.toLocaleString()}
                      </td>
                      <td className="text-right font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-medium">
                        Rs {cust.advancePaid.toLocaleString()}
                      </td>
                      <td className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        Rs {cust.monthlyInstallment.toLocaleString()}
                      </td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        <span className={cust.remainingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                          Rs {cust.remainingBalance.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          
                          {/* Collect Payment Button */}
                          <button
                            onClick={() => handleOpenPaymentModal(cust)}
                            className="px-2 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-2xs transition-colors cursor-pointer"
                            title="Collect Monthly Installment"
                          >
                            Collect
                          </button>

                          {/* Khata History Button */}
                          <button
                            onClick={() => setKhataCustomer(cust)}
                            className="px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            title="View Customer Passbook / Khata Statement"
                          >
                            Khata
                          </button>

                          {/* Edit Customer Button */}
                          <button
                            onClick={() => setEditingCustomer({ ...cust })}
                            className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded cursor-pointer"
                            title="Edit Customer Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Customer Button */}
                          <button
                            onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                            title="Delete Customer Khata"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Displaying {filteredCustomers.length} customer records</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Total Outstanding: Rs {totalRemaining.toLocaleString()}
            </span>
          </div>

        </div>
      )}

      {/* ================= MODAL: PAYMENT COLLECTION ================= */}
      {activePaymentCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 transition-colors">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Receive Installment Payment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customer: <span className="font-bold text-slate-800 dark:text-slate-200">{activePaymentCustomer.name}</span> (#{activePaymentCustomer.serialNo})
                </p>
              </div>
              <button
                onClick={() => {
                  setActivePaymentCustomer(null);
                  setLastReceipt(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {lastReceipt ? (
              /* Receipt View with Print */
              <div className="space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl text-emerald-950 dark:text-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>Payment Recorded Successfully!</span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Receipt No:</span>
                      <span className="font-bold">{lastReceipt.receiptNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Customer:</span>
                      <span className="font-bold">{lastReceipt.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Amount Paid:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">Rs {lastReceipt.amount.toLocaleString()}</span>
                    </div>
                    {lastReceipt.discountAllowed > 0 && (
                      <div className="flex justify-between text-amber-700 dark:text-amber-400">
                        <span>Discount Allowed:</span>
                        <span>Rs {lastReceipt.discountAllowed.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-emerald-200 dark:border-emerald-800 pt-1.5 font-bold">
                      <span>Remaining Balance:</span>
                      <span className="text-rose-700 dark:text-rose-400">Rs {lastReceipt.newBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt Slip</span>
                  </button>

                  <button
                    onClick={() => {
                      setActivePaymentCustomer(null);
                      setLastReceipt(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Payment Form */
              <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
                
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Current Outstanding:</span>
                    <div className="font-bold font-mono text-sm text-slate-900 dark:text-white">
                      Rs {activePaymentCustomer.remainingBalance.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 dark:text-slate-400">Monthly Due:</span>
                    <div className="font-bold font-mono text-sm text-emerald-700 dark:text-emerald-400">
                      Rs {activePaymentCustomer.monthlyInstallment.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount Received (Rs) *
                  </label>
                  <input
                    type="number"
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 text-base font-mono font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Account
                    </label>
                    <select
                      aria-label="Payment Account"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="CASH">Cash In Hand</option>
                      <option value="ONLINE_TRANSFER">UBL Bank Account</option>
                      <option value="EASYPAISA_JAZZCASH">EasyPaisa Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Discount Granted (Rs)
                    </label>
                    <input
                      type="number"
                      value={discountAllowed || ''}
                      onChange={(e) => setDiscountAllowed(Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      className="w-full px-2.5 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Memo / Notes
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Received at shop"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePaymentCustomer(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    Confirm Payment & Generate Receipt
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ================= MODAL: CUSTOMER KHATA STATEMENT (LEDGER PASSBOOK) ================= */}
      {khataCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto my-auto transition-colors">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Customer Khata Statement: {khataCustomer.name}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Account #{khataCustomer.serialNo} · {khataCustomer.phone} · {khataCustomer.address}
                </p>
              </div>
              <button
                onClick={() => setKhataCustomer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Khata Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Purchase Item</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{khataCustomer.itemDescription || 'Trading device'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Contract Amount</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Rs {khataCustomer.totalPurchases.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Advance Paid</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Rs {khataCustomer.advancePaid.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Balance Outstanding</span>
                <span className="font-bold text-rose-700 dark:text-rose-400">Rs {khataCustomer.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Payments History Ledger Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                Payment History & Receipt Vouchers
              </h4>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs sheet-table ledger-table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th className="text-right">Amount Paid</th>
                      <th className="text-right">Balance After</th>
                      <th>Collector</th>
                      <th className="text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Opening Advance Row */}
                    <tr className="bg-slate-50 dark:bg-slate-800/40 font-medium">
                      <td className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">INITIAL</td>
                      <td className="font-mono text-[11px] text-slate-500">{khataCustomer.startDate}</td>
                      <td>Downpayment</td>
                      <td className="text-right font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                        Rs {khataCustomer.advancePaid.toLocaleString()}
                      </td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        Rs {(khataCustomer.totalPurchases - khataCustomer.advancePaid).toLocaleString()}
                      </td>
                      <td className="text-slate-500">Initial Sale</td>
                      <td className="text-center text-slate-400">—</td>
                    </tr>

                    {/* Recorded Payments */}
                    {payments
                      .filter(p => p.customerId === khataCustomer.id)
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-400">{p.receiptNo}</td>
                          <td className="font-mono text-[11px] text-slate-500">{p.date}</td>
                          <td>{p.paymentMethod}</td>
                          <td className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            Rs {p.amount.toLocaleString()}
                          </td>
                          <td className="text-right font-mono font-bold text-slate-900 dark:text-white">
                            Rs {p.remainingBalanceAfter.toLocaleString()}
                          </td>
                          <td className="text-slate-600 dark:text-slate-400">{p.collectedBy}</td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setPrintingPaymentSlip(p)}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded cursor-pointer"
                                title="Print Receipt Slip"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingPayment({ ...p })}
                                className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded cursor-pointer"
                                title="Edit Payment Voucher Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePayment(p.id, p.receiptNo)}
                                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                                title="Delete Receipt (Reverses balance)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Khata Statement</span>
              </button>
              <button
                onClick={() => {
                  handleOpenPaymentModal(khataCustomer);
                  setKhataCustomer(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
              >
                Record Payment for {khataCustomer.name}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CUSTOMER PARTICULARS ================= */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-lg w-full space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Edit Customer: #{editingCustomer.serialNo} {editingCustomer.name}</span>
              </h2>
              <button
                onClick={() => setEditingCustomer(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Address / Location
                </label>
                <input
                  type="text"
                  value={editingCustomer.address || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Purchased Item Description
                </label>
                <input
                  type="text"
                  value={editingCustomer.itemDescription || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, itemDescription: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Total Purchases (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingCustomer.totalPurchases}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, totalPurchases: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Monthly Due (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingCustomer.monthlyInstallment}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, monthlyInstallment: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Remaining Bal (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingCustomer.remainingBalance}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, remainingBalance: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  aria-label="Customer Status"
                  value={editingCustomer.status}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="ACTIVE">Active (Ongoing khata)</option>
                  <option value="SETTLED">Settled (Fully paid)</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK ADD CUSTOMER KHATA ================= */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-lg w-full space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UshTradersIcon className="w-6 h-6 rounded-md shadow-2xs" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Register New Customer Khata
                </h2>
              </div>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Muhammad Asif"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Address / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shop #12, Mobile Market"
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Purchased Item / Goods Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Samsung Galaxy A54 (8/128GB) Black"
                  value={newCustomerForm.itemDescription}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, itemDescription: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Total Purchases (Rs) *
                  </label>
                  <input
                    type="number"
                    placeholder="75000"
                    value={newCustomerForm.totalPurchases || ''}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      const adv = newCustomerForm.advancePaid;
                      const rem = Math.max(0, total - adv);
                      const monthly = Math.round(rem / 10);
                      setNewCustomerForm({
                        ...newCustomerForm,
                        totalPurchases: total,
                        monthlyInstallment: monthly,
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Advance Downpayment
                  </label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={newCustomerForm.advancePaid || ''}
                    onChange={(e) => {
                      const adv = Number(e.target.value);
                      const total = newCustomerForm.totalPurchases;
                      const rem = Math.max(0, total - adv);
                      const monthly = Math.round(rem / 10);
                      setNewCustomerForm({
                        ...newCustomerForm,
                        advancePaid: adv,
                        monthlyInstallment: monthly,
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Monthly Due (Rs)
                  </label>
                  <input
                    type="number"
                    placeholder="6000"
                    value={newCustomerForm.monthlyInstallment || ''}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, monthlyInstallment: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono text-indigo-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Agreement Start Date
                </label>
                <input
                  type="date"
                  value={newCustomerForm.startDate}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, startDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Create Customer Khata
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PAYMENT VOUCHER ================= */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Edit Voucher: {editingPayment.receiptNo}</span>
              </h2>
              <button
                onClick={() => setEditingPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Customer
                </label>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {editingPayment.customerName}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={editingPayment.paymentMethod}
                  onChange={(e) => setEditingPayment({ ...editingPayment, paymentMethod: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="CASH">Cash in Hand</option>
                  <option value="ONLINE_TRANSFER">Online Bank Transfer</option>
                  <option value="BANK">Bank Deposit / Cheque</option>
                  <option value="EASYPAISA_JAZZCASH">Easypaisa / JazzCash</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Memo / Receipt Notes
                </label>
                <textarea
                  rows={2}
                  value={editingPayment.notes || ''}
                  onChange={(e) => setEditingPayment({ ...editingPayment, notes: e.target.value })}
                  placeholder="Payment remarks or reference..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRINT INDIVIDUAL RECEIPT SLIP ================= */}
      {printingPaymentSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-sm w-full space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 no-print">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment Slip Preview</span>
              <button
                onClick={() => setPrintingPaymentSlip(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slip Printable area */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-3">
              <div className="text-center pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                <div className="flex items-center justify-center gap-1.5">
                  <UshTradersIcon className="w-6 h-6 rounded-md shadow-2xs" />
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">USH TRADERS</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">OFFICIAL RECOVERY RECEIPT</div>
                <div className="text-[10px] text-slate-400">Main Market · Tel: 0300-1122334</div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt No:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{printingPaymentSlip.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{printingPaymentSlip.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold">{printingPaymentSlip.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span>{printingPaymentSlip.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-dashed border-slate-300 dark:border-slate-700 font-bold text-xs">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Rs {printingPaymentSlip.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Balance Remaining:</span>
                  <span className="text-rose-600 dark:text-rose-400">Rs {printingPaymentSlip.remainingBalanceAfter.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>Collected By:</span>
                  <span>{printingPaymentSlip.collectedBy}</span>
                </div>
              </div>

              <div className="text-[10px] text-center text-slate-400 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                Thank you for your business!
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 no-print">
              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt Slip</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
