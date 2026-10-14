import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Customer } from '../types/accounting';
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
} from 'lucide-react';

interface InstallmentsViewProps {
  initialSelectedCustomerId?: string | null;
  onOpenNewSale: () => void;
}

export const InstallmentsView: React.FC<InstallmentsViewProps> = ({
  initialSelectedCustomerId,
  onOpenNewSale,
}) => {
  const { customers, payments, recordInstallmentPayment, batchRecordInstallments } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SETTLED'>('ALL');
  const [sortBy, setSortBy] = useState<'serialNo' | 'name' | 'remainingBalance' | 'monthlyInstallment'>('serialNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mode: Standard list vs QuickBooks Batch Grid
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchAmounts, setBatchAmounts] = useState<{ [customerId: string]: number }>({});
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

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

  // Sorting & Filtering
  const filteredCustomers = customers
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.serialNo.toString().includes(searchTerm);
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

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Metric Summary matching PDF Attachment */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                Customer Installment Ledgers
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200">
                USH TRADERS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Complete customer Khata registry with automated balance reconciliation and monthly installment tracking
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsBatchMode(!isBatchMode)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                isBatchMode
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isBatchMode ? 'Exit Batch Sheet' : 'Batch Collection Sheet'}</span>
            </button>

            <button
              onClick={onOpenNewSale}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Customer / Sale</span>
            </button>
          </div>
        </div>

        {/* Aggregate Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Remaining Bal</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
              Rs {totalRemaining.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Monthly Dues Expected</div>
            <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
              Rs {totalMonthlyDue.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Gross Purchases</div>
            <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
              Rs {totalPurchases.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Advance Downpayments</div>
            <div className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-400 tabular-nums mt-0.5">
              Rs {totalAdvances.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {batchSuccessMsg && (
        <div className="bg-emerald-600 text-white p-3 rounded-lg shadow-sm flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{batchSuccessMsg}</span>
          </div>
          <button onClick={() => setBatchSuccessMsg(null)}>✕</button>
        </div>
      )}

      {/* Multi-Customer Batch Collection Mode */}
      {isBatchMode ? (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Multi-Customer Installment Collection Sheet</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rapidly mark monthly installment recoveries across all customers in a single sheet submit
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchAutoFill}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors"
              >
                Auto-fill All Monthly Dues
              </button>
              <button
                onClick={handleBatchSubmit}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs transition-colors"
              >
                Post Batch Payments ({Object.values(batchAmounts).filter(v => v > 0).length})
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto max-h-[600px] border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs sheet-table">
              <thead className="sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="w-12 text-center">S.No</th>
                  <th>Customer Name</th>
                  <th>Phone / Address</th>
                  <th className="text-right">Remaining Balance</th>
                  <th className="text-right">Monthly Installment</th>
                  <th className="w-44 text-right bg-emerald-50 text-emerald-900">
                    Collected Today (Rs)
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="text-center font-mono font-medium text-slate-500">
                      #{c.serialNo}
                    </td>
                    <td className="font-semibold text-slate-900">
                      {c.name}
                    </td>
                    <td className="text-slate-500 text-[11px]">
                      {c.phone} {c.address ? `· ${c.address}` : ''}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-900 tabular-nums">
                      Rs {c.remainingBalance.toLocaleString()}
                    </td>
                    <td className="text-right font-mono text-emerald-700 font-semibold tabular-nums">
                      Rs {c.monthlyInstallment.toLocaleString()}
                    </td>
                    <td className="p-1 bg-emerald-50/40 text-right">
                      <input
                        type="number"
                        placeholder="0"
                        value={batchAmounts[c.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setBatchAmounts(prev => ({ ...prev, [c.id]: val }));
                        }}
                        className="w-full px-2 py-1 text-right font-mono font-bold text-xs bg-white border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Standard High-Fidelity Ledger View */
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, phone, or serial #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['ALL', 'ACTIVE', 'SETTLED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filterStatus === status
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Table */}
          <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs sheet-table">
              <thead>
                <tr>
                  <th 
                    className="w-16 text-center cursor-pointer hover:bg-slate-200"
                    onClick={() => {
                      if (sortBy === 'serialNo') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('serialNo'); setSortOrder('asc'); }
                    }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>S.No</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th>Date</th>
                  <th 
                    className="cursor-pointer hover:bg-slate-200"
                    onClick={() => {
                      if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('name'); setSortOrder('asc'); }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Customer</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th>Item / Notes</th>
                  <th className="text-right">Purchases</th>
                  <th className="text-right">Advance</th>
                  <th 
                    className="text-right cursor-pointer hover:bg-slate-200"
                    onClick={() => {
                      if (sortBy === 'monthlyInstallment') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('monthlyInstallment'); setSortOrder('asc'); }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Monthly Due</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    className="text-right cursor-pointer hover:bg-slate-200"
                    onClick={() => {
                      if (sortBy === 'remainingBalance') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('remainingBalance'); setSortOrder('asc'); }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Remaining Bal</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                    <td className="text-center font-mono font-medium text-slate-600">
                      #{cust.serialNo}
                    </td>
                    <td className="text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {cust.startDate}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">{cust.name}</div>
                      <div className="text-[11px] text-slate-500">{cust.phone}</div>
                    </td>
                    <td className="text-slate-600 text-[11px]">
                      {cust.itemDescription || 'Device purchase'}
                    </td>
                    <td className="text-right font-mono tabular-nums text-slate-700">
                      Rs {cust.totalPurchases.toLocaleString()}
                    </td>
                    <td className="text-right font-mono tabular-nums text-emerald-700">
                      Rs {cust.advancePaid.toLocaleString()}
                    </td>
                    <td className="text-right font-mono font-bold text-emerald-700 tabular-nums">
                      Rs {cust.monthlyInstallment.toLocaleString()}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-900 tabular-nums">
                      Rs {cust.remainingBalance.toLocaleString()}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenPaymentModal(cust)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-2xs transition-colors"
                        >
                          Collect
                        </button>
                        <button
                          onClick={() => setKhataCustomer(cust)}
                          className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition-colors"
                          title="View Customer Khata"
                        >
                          Khata
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Displaying {filteredCustomers.length} customer records</span>
            <span className="font-semibold text-slate-700">
              Total Outstanding: Rs {totalRemaining.toLocaleString()}
            </span>
          </div>

        </div>
      )}

      {/* Modal: Single Payment Collection */}
      {activePaymentCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Receive Installment Payment
                </h3>
                <p className="text-xs text-slate-500">
                  Customer: <span className="font-bold text-slate-800">{activePaymentCustomer.name}</span> (#{activePaymentCustomer.serialNo})
                </p>
              </div>
              <button
                onClick={() => {
                  setActivePaymentCustomer(null);
                  setLastReceipt(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {lastReceipt ? (
              /* Receipt View */
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-emerald-950">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>Payment Recorded Successfully!</span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Receipt No:</span>
                      <span className="font-bold">{lastReceipt.receiptNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Date:</span>
                      <span>{lastReceipt.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Amount Received:</span>
                      <span className="font-bold text-emerald-700">Rs {lastReceipt.amount.toLocaleString()}</span>
                    </div>
                    {lastReceipt.discountAllowed > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Discount Granted:</span>
                        <span className="font-bold text-amber-700">Rs {lastReceipt.discountAllowed.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-emerald-200">
                      <span className="text-slate-600">New Remaining Bal:</span>
                      <span className="font-bold text-slate-900">Rs {lastReceipt.newBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => {
                      const text = `*USH TRADERS - Payment Receipt*\nReceipt: ${lastReceipt.receiptNo}\nCustomer: ${lastReceipt.customerName}\nAmount Paid: Rs ${lastReceipt.amount.toLocaleString()}\nRemaining Balance: Rs ${lastReceipt.newBalance.toLocaleString()}\nThank you!`;
                      navigator.clipboard.writeText(text);
                      alert('Receipt summary copied to clipboard for WhatsApp sharing!');
                    }}
                    className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setActivePaymentCustomer(null);
                    setLastReceipt(null);
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Payment Form */
              <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
                
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-500">Current Outstanding:</span>
                    <div className="font-bold font-mono text-sm text-slate-900">
                      Rs {activePaymentCustomer.remainingBalance.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Monthly Due:</span>
                    <div className="font-bold font-mono text-sm text-emerald-700">
                      Rs {activePaymentCustomer.monthlyInstallment.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Amount Received (Rs)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 text-base font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Payment Account
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="CASH">Cash In Hand</option>
                      <option value="ONLINE_TRANSFER">UBL Bank Account</option>
                      <option value="EASYPAISA_JAZZCASH">EasyPaisa Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Discount Granted (Rs)
                    </label>
                    <input
                      type="number"
                      value={discountAllowed || ''}
                      onChange={(e) => setDiscountAllowed(Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      className="w-full px-2.5 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Memo / Notes
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Received via Salman"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePaymentCustomer(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                  >
                    Confirm Payment & Generate Receipt
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Modal: Customer Khata Statement (Ledger History) */}
      {khataCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <span>Customer Khata Statement: {khataCustomer.name}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Account #{khataCustomer.serialNo} · {khataCustomer.phone} · {khataCustomer.address}
                </p>
              </div>
              <button
                onClick={() => setKhataCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Khata Summary Cards */}
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Purchase Item</span>
                <span className="font-bold text-slate-800">{khataCustomer.itemDescription || 'Trading device'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Contract Amount</span>
                <span className="font-bold text-slate-800">Rs {khataCustomer.totalPurchases.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Advance Paid</span>
                <span className="font-bold text-emerald-700">Rs {khataCustomer.advancePaid.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Balance Outstanding</span>
                <span className="font-bold text-rose-700">Rs {khataCustomer.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Payments History Ledger Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Payment History & Vouchers
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs sheet-table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th className="text-right">Amount Paid</th>
                      <th className="text-right">Balance After</th>
                      <th>Collector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Opening Advance Row */}
                    <tr className="bg-slate-50 font-medium">
                      <td className="font-mono text-[11px]">INITIAL</td>
                      <td className="font-mono text-[11px]">{khataCustomer.startDate}</td>
                      <td>Downpayment</td>
                      <td className="text-right font-mono text-emerald-700">
                        Rs {khataCustomer.advancePaid.toLocaleString()}
                      </td>
                      <td className="text-right font-mono">
                        Rs {(khataCustomer.totalPurchases - khataCustomer.advancePaid).toLocaleString()}
                      </td>
                      <td>Initial Sale</td>
                    </tr>

                    {/* Recorded Payments */}
                    {payments
                      .filter(p => p.customerId === khataCustomer.id)
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="font-mono text-[11px] font-bold text-indigo-700">{p.receiptNo}</td>
                          <td className="font-mono text-[11px]">{p.date}</td>
                          <td>{p.paymentMethod}</td>
                          <td className="text-right font-mono font-bold text-emerald-700">
                            Rs {p.amount.toLocaleString()}
                          </td>
                          <td className="text-right font-mono font-bold text-slate-900">
                            Rs {p.remainingBalanceAfter.toLocaleString()}
                          </td>
                          <td className="text-slate-600">{p.collectedBy}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Khata Statement</span>
              </button>
              <button
                onClick={() => {
                  handleOpenPaymentModal(khataCustomer);
                  setKhataCustomer(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs"
              >
                Record Payment for {khataCustomer.name}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
