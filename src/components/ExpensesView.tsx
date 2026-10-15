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
  Printer,
  Edit3,
  Trash2,
  Eye,
} from 'lucide-react';
import { UshTradersIcon } from './UshTradersIcon';

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    recordExpense,
    updateExpense,
    deleteExpense,
    accounts,
    summaryMetrics,
  } = useAccounting();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Viewing expense voucher
  const [viewingExpense, setViewingExpense] = useState<ExpenseRecord | null>(null);

  // Editing expense voucher
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

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
    const matchSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalFilteredExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
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

  const handleSaveEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    updateExpense(editingExpense.id, {
      category: editingExpense.category,
      amount: Number(editingExpense.amount),
      paidTo: editingExpense.paidTo,
      description: editingExpense.description,
      status: editingExpense.status,
      date: editingExpense.date,
    });

    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string, expNo: string) => {
    if (window.confirm(`Are you sure you want to delete expense voucher ${expNo}? This will reverse the expenditure in the cash account.`)) {
      deleteExpense(id);
      if (viewingExpense?.id === id) setViewingExpense(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Summary */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Operating Expense Vouchers</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-md border border-indigo-200 dark:border-indigo-800">
                USH TRADERS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Detailed tracking of partner commissions, phone packages, discounts granted, and operational overhead
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Expense Vouchers</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense Voucher</span>
            </button>
          </div>
        </div>

        {/* Expense Category Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Expenses</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
              Rs {summaryMetrics.totalExpensesThisMonth.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Commissions Paid</div>
            <div className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-400 tabular-nums mt-0.5">
              Rs {commissionTotal.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Mobile Packages</div>
            <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
              Rs {mobilePkgTotal.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Discounts Allowed</div>
            <div className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400 tabular-nums mt-0.5">
              Rs {discountTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-xs flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="cursor-pointer">✕</button>
        </div>
      )}

      {/* Main Expense Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by payee, description, or voucher #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs sheet-table ledger-table">
            <thead>
              <tr>
                <th className="w-24">Voucher #</th>
                <th className="w-24">Date</th>
                <th>Category</th>
                <th>Paid To (Recipient)</th>
                <th>Description / Purpose</th>
                <th>Account</th>
                <th className="text-right w-28">Amount</th>
                <th className="text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
                    No expense vouchers found matching filter.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="font-mono text-slate-500 dark:text-slate-400 font-bold text-[11px]">
                      {exp.expenseNumber}
                    </td>
                    <td className="font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="font-bold text-slate-900 dark:text-white">
                      {exp.paidTo}
                    </td>
                    <td className="text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {accounts.find(a => a.id === exp.paidFromAccountId)?.name || 'Cash In Hand'}
                    </td>
                    <td className="text-right font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      Rs {exp.amount.toLocaleString()}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* View Voucher */}
                        <button
                          onClick={() => setViewingExpense(exp)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded cursor-pointer"
                          title="View Official Expense Voucher"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Voucher */}
                        <button
                          onClick={() => setEditingExpense({ ...exp })}
                          className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded cursor-pointer"
                          title="Edit Expense Voucher"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Voucher */}
                        <button
                          onClick={() => handleDeleteExpense(exp.id, exp.expenseNumber)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                          title="Delete Expense Voucher"
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
          <span>Showing {filteredExpenses.length} expense records</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Total Displayed: Rs {totalFilteredExpense.toLocaleString()}
          </span>
        </div>

      </div>

      {/* ================= MODAL: ADD EXPENSE VOUCHER ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 my-auto transition-colors">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Record New Expense Voucher</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Category *
                  </label>
                  <select
                    aria-label="Expense Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="COMMISSION">Commission / Referral</option>
                    <option value="MOBILE_PACKAGES">Mobile Package / Data</option>
                    <option value="DISCOUNT_ALLOWED">Discount Granted</option>
                    <option value="PARTNER_DRAWINGS">Partner Drawings</option>
                    <option value="PURCHASES">Direct Purchases</option>
                    <option value="UTILITIES">Utilities & Electricity</option>
                    <option value="MISC_EXP">General / Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount Paid (Rs) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    min="1"
                    placeholder="0"
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid To (Recipient) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Umair, Zong Franchise, Faiz"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid From Account
                  </label>
                  <select
                    aria-label="Paid From Account"
                    value={paidFromAccountId}
                    onChange={(e) => setPaidFromAccountId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="acc_1010">Cash In Hand (1010)</option>
                    <option value="acc_1020">UBL Bank Account (1020)</option>
                    <option value="acc_1030">EasyPaisa Wallet (1030)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Expense Note *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Commission in Imtiaz khata sales referral"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Save & Post Voucher
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW & PRINT EXPENSE VOUCHER ================= */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase">Expense Payment Voucher</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setViewingExpense(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <UshTradersIcon className="w-8 h-8 rounded-lg shadow-2xs" />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">USH TRADERS</div>
                    <div className="text-[10px] text-slate-500">Official Expense Voucher</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">{viewingExpense.expenseNumber}</div>
                  <div className="text-[10px] text-slate-500">{viewingExpense.date}</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid To:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingExpense.paidTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{viewingExpense.category.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Purpose / Details:</span>
                  <span className="text-right font-medium max-w-xs">{viewingExpense.description}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold">
                  <span>Amount Paid:</span>
                  <span className="text-rose-600 dark:text-rose-400">Rs {viewingExpense.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 text-[10px] text-center text-slate-500">
                <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                  Prepared By: {viewingExpense.loggedBy}
                </div>
                <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                  Recipient Signature
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT EXPENSE VOUCHER ================= */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Edit Voucher: {editingExpense.expenseNumber}</span>
              </h2>
              <button
                onClick={() => setEditingExpense(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditExpense} className="space-y-3 text-xs">
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Paid To (Recipient)
                </label>
                <input
                  type="text"
                  value={editingExpense.paidTo}
                  onChange={(e) => setEditingExpense({ ...editingExpense, paidTo: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Amount (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  aria-label="Category"
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="COMMISSION">Commission / Referral</option>
                  <option value="MOBILE_PACKAGES">Mobile Package / Data</option>
                  <option value="DISCOUNT_ALLOWED">Discount Granted</option>
                  <option value="PARTNER_DRAWINGS">Partner Drawings</option>
                  <option value="PURCHASES">Direct Purchases</option>
                  <option value="UTILITIES">Utilities & Electricity</option>
                  <option value="MISC_EXP">General / Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
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

    </div>
  );
};
