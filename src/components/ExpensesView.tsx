import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { ExpenseRecord } from '../types/accounting';
import {
  Receipt,
  Plus,
  Filter,
  Search,
  UploadCloud,
  CheckCircle,
  X,
  Calendar,
  DollarSign,
  TrendingDown,
  Tag,
  Camera,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, recordExpense, accounts, summaryMetrics } = useAccounting();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Expense Form State
  const [category, setCategory] = useState<ExpenseRecord['category']>('COMMISSION');
  const [amount, setAmount] = useState<number | ''>('');
  const [paidTo, setPaidTo] = useState('');
  const [paidFromAccountId, setPaidFromAccountId] = useState('acc_1010'); // Default Cash In Hand
  const [description, setDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const categories: Array<{ id: ExpenseRecord['category'] | 'ALL'; label: string }> = [
    { id: 'ALL', label: 'All Expenses' },
    { id: 'COMMISSION', label: 'Commissions & Referrals' },
    { id: 'MOBILE_PACKAGES', label: 'Mobile & Internet' },
    { id: 'DISCOUNT_ALLOWED', label: 'Discounts Granted' },
    { id: 'PARTNER_DRAWINGS', label: 'Partner Drawings' },
    { id: 'PURCHASES', label: 'Direct Purchases' },
    { id: 'UTILITIES', label: 'Utilities & Solar' },
    { id: 'MISC_EXP', label: 'Miscellaneous' },
  ];

  const filteredExpenses = expenses.filter(e => {
    const matchCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalFilteredExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown for summary cards
  const commissionTotal = expenses.filter(e => e.category === 'COMMISSION').reduce((sum, e) => sum + e.amount, 0);
  const mobilePkgTotal = expenses.filter(e => e.category === 'MOBILE_PACKAGES').reduce((sum, e) => sum + e.amount, 0);
  const discountTotal = expenses.filter(e => e.category === 'DISCOUNT_ALLOWED').reduce((sum, e) => sum + e.amount, 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !paidTo || !description) return;

    const res = recordExpense({
      category,
      amount: Number(amount),
      paidFromAccountId,
      paidTo,
      description,
      receiptImage: receiptImage || undefined,
    });

    if (res.success) {
      setSuccessToast(`Recorded expense ${res.expenseNumber} of Rs ${Number(amount).toLocaleString()} paid to ${paidTo}!`);
      setIsAddModalOpen(false);
      setAmount('');
      setPaidTo('');
      setDescription('');
      setReceiptImage(null);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-between text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)}>✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <span>Expense Reporting & Disbursement Tracking</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200">
                Automated Double-Entry
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Log sales agent commissions (Umair, Faiz), mobile packages, customer discounts, and operational sundries
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense / Voucher</span>
          </button>
        </div>

        {/* Aggregate Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Expenses Logged</div>
            <div className="text-lg font-bold font-mono text-rose-600 tabular-nums mt-0.5">
              Rs {summaryMetrics.totalExpensesThisMonth.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Commissions to Agents</div>
            <div className="text-lg font-bold font-mono text-slate-800 tabular-nums mt-0.5">
              Rs {commissionTotal.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Customer Discounts</div>
            <div className="text-lg font-bold font-mono text-amber-700 tabular-nums mt-0.5">
              Rs {discountTotal.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Telecom & Mobile Pkg</div>
            <div className="text-lg font-bold font-mono text-indigo-700 tabular-nums mt-0.5">
              Rs {mobilePkgTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Expenses Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses by recipient, memo, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  categoryFilter === c.id
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expense Grid Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs qb-grid">
            <thead>
              <tr>
                <th className="w-24">Voucher #</th>
                <th>Date</th>
                <th>Category</th>
                <th>Paid To / Payee</th>
                <th>Description & Memo</th>
                <th>Paid From Account</th>
                <th className="text-right">Amount (Rs)</th>
                <th className="text-center w-20">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="font-mono text-slate-500 font-bold text-[11px]">
                    {exp.expenseNumber}
                  </td>
                  <td className="font-mono text-slate-600 text-[11px] whitespace-nowrap">
                    {exp.date}
                  </td>
                  <td>
                    <span className="text-[11px] font-semibold text-slate-800">
                      {exp.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="font-bold text-slate-900">
                    {exp.paidTo}
                  </td>
                  <td className="text-slate-600">
                    {exp.description}
                  </td>
                  <td className="text-[11px] text-slate-500">
                    {accounts.find(a => a.id === exp.paidFromAccountId)?.name || 'Cash In Hand'}
                  </td>
                  <td className="text-right font-mono font-bold text-rose-600 tabular-nums">
                    Rs {exp.amount.toLocaleString()}
                  </td>
                  <td className="text-center">
                    {exp.receiptImage ? (
                      <span className="text-[11px] text-indigo-600 font-bold cursor-pointer hover:underline">
                        Attached
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Displaying {filteredExpenses.length} expense records</span>
          <span className="font-semibold text-slate-700">
            Filtered Subtotal: Rs {totalFilteredExpense.toLocaleString()}
          </span>
        </div>

      </div>

      {/* Modal: New Expense Voucher */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <span>Log Expense / Payment Voucher</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Expense Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="COMMISSION">Commission to Agent</option>
                    <option value="MOBILE_PACKAGES">Mobile Package / Data</option>
                    <option value="DISCOUNT_ALLOWED">Discount Allowed</option>
                    <option value="PARTNER_DRAWINGS">Partner Drawings</option>
                    <option value="PURCHASES">Direct Trading Purchase</option>
                    <option value="UTILITIES">Shop Utilities & Electricity</option>
                    <option value="MISC_EXP">Miscellaneous Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Amount (Rs) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    min="1"
                    placeholder="0"
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Paid To / Recipient *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Faiz, Umair, Franchise, Shop landlord"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Paid From Account
                </label>
                <select
                  value={paidFromAccountId}
                  onChange={(e) => setPaidFromAccountId(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {accounts
                    .filter(a => a.type === 'ASSET' && (a.subType === 'Current Asset'))
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Bal: Rs {a.balance.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description / Purpose *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Commission paid to Umair for customer referral"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Receipt Attachment Simulation */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Attach Photo / Receipt Voucher
                </label>
                <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50">
                  {receiptImage ? (
                    <div className="space-y-2">
                      <img src={receiptImage} alt="Receipt preview" className="max-h-24 mx-auto rounded border" />
                      <button
                        type="button"
                        onClick={() => setReceiptImage(null)}
                        className="text-[11px] text-rose-600 font-semibold"
                      >
                        Remove Receipt
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="receipt-file-input"
                      />
                      <label
                        htmlFor="receipt-file-input"
                        className="cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-indigo-600"
                      >
                        <Camera className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-medium">Click to upload or snap receipt</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Post Expense to Ledger
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
