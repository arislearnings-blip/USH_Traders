import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Wallet,
  TrendingUp,
  Receipt,
  Users,
  AlertCircle,
  PlusCircle,
  Smartphone,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { UshTradersIcon } from './UshTradersIcon';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  openQuickEntry: () => void;
  onSelectCustomerKhata: (customerId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  openQuickEntry,
  onSelectCustomerKhata,
}) => {
  const {
    summaryMetrics,
    customers,
    partners,
    payments,
    expenses,
    loanParties,
    recordInstallmentPayment,
  } = useAccounting();

  // Quick 1-tap installment collection state
  const [selectedCustId, setSelectedCustId] = useState<string>('');
  const [quickAmount, setQuickAmount] = useState<number | ''>('');
  const [quickMethod, setQuickMethod] = useState<'CASH' | 'ONLINE_TRANSFER' | 'EASYPAISA_JAZZCASH'>('CASH');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustId);

  const handleQuickPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId || !quickAmount || Number(quickAmount) <= 0) return;

    const res = recordInstallmentPayment({
      customerId: selectedCustId,
      amount: Number(quickAmount),
      paymentMethod: quickMethod,
      notes: 'Quick mobile dashboard collection',
    });

    if (res.success) {
      setSuccessToast(`Recorded payment of Rs ${Number(quickAmount).toLocaleString()} for ${selectedCustomer?.name}!`);
      setQuickAmount('');
      setSelectedCustId('');
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const activeCustomers = customers.filter(c => c.status === 'ACTIVE');
  const totalReceivedRecent = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-between text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white hover:text-emerald-100 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Dashboard Top Banner with USH TRADERS Icon */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <UshTradersIcon className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-xs shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                USH TRADERS
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                Single Truth General Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Financial overview, installment receivables, device inventory, and double-entry reconciliation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('invoices')}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>+ New Sale</span>
          </button>
          <button
            onClick={() => setActiveTab('installments')}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Khata Registry</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Matching USH TRADERS Summary Sheet) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Remaining Balance */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Remaining Balance
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              Rs {summaryMetrics.remainingCustomerBalance.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>{activeCustomers.length} active customer khatas</span>
          </div>
        </div>

        {/* Monthly Expected Return */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Monthly Return
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              Rs {summaryMetrics.monthlyExpectedReturn.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Scheduled recurring cash</span>
          </div>
        </div>

        {/* Cash In Hand */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Cash In Hand
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-indigo-700 dark:text-indigo-400 tabular-nums">
              Rs {summaryMetrics.cashInHand.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Ready physical balance</span>
          </div>
        </div>

        {/* Outstanding Loan (Faiz & Lenders) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Loans To Be Paid
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              Rs {summaryMetrics.totalLoanPayable.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Faiz: Rs 45,890 remaining</span>
          </div>
        </div>

        {/* Capital + Profit */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Capital + Profit
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              Rs {summaryMetrics.capitalAndProfit.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Total business equity</span>
          </div>
        </div>

        {/* Total Stock Valuation */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Stock Valuation
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              Rs {summaryMetrics.totalInventoryValuation.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Mobiles & trading units</span>
          </div>
        </div>

      </div>

      {/* Partner PPP Equal Share Breakdown (From Attachment Page 1) */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Partners Profit & Capital Participation (PPP)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              3 Equal Partners · Base Capital Rs 275,060 · Split: Rs 91,686.67 per partner
            </p>
          </div>
          <button
            onClick={() => setActiveTab('loans')}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap"
          >
            Manage Equity & Dividends →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {partners.map((partner) => (
            <div key={partner.id} className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-200">{partner.name}</span>
                <span className="text-[11px] px-2 py-0.5 bg-indigo-900/60 text-indigo-300 rounded font-mono font-medium">
                  33.33% Share
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Base Capital:</span>
                <span className="font-mono font-medium text-sm text-slate-100">
                  Rs {partner.initialCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-xs">
                <span className="text-slate-400">Total Investment:</span>
                <span className="font-mono text-emerald-400">
                  Rs {partner.currentInvestment.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-xs">
                <span className="text-slate-400">Dividends Paid:</span>
                <span className="font-mono text-amber-300">
                  Rs {partner.dividendsPaid.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Split: 1-Tap Touch Quick Collection on Mobile & Recent Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 1-Tap Touch Payment Entry (Optimized for Mobile/Field Collection) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  1-Tap Installment Collection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Instant touch entry with auto-ledger updating
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                Live Single-Truth
              </span>
            </div>

            <form onSubmit={handleQuickPaymentSubmit} className="mt-4 space-y-3.5">
              
              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Select Customer (Khata)
                </label>
                <select
                  value={selectedCustId}
                  onChange={(e) => {
                    setSelectedCustId(e.target.value);
                    const cust = customers.find(c => c.id === e.target.value);
                    if (cust && cust.monthlyInstallment) {
                      setQuickAmount(cust.monthlyInstallment);
                    }
                  }}
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choose Customer ({customers.length} available) --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      #{c.serialNo} {c.name} · Bal: Rs {c.remainingBalance.toLocaleString()} (Due: Rs {c.monthlyInstallment.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Insight Banner if selected */}
              {selectedCustomer && (
                <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 text-xs">
                  <div className="flex justify-between items-center text-indigo-950 font-semibold">
                    <span>{selectedCustomer.name} (#{selectedCustomer.serialNo})</span>
                    <button
                      type="button"
                      onClick={() => onSelectCustomerKhata(selectedCustomer.id)}
                      className="text-[11px] text-indigo-700 underline font-medium"
                    >
                      View Khata Statement
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-indigo-200/60 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Purchases</span>
                      <span className="font-bold">Rs {selectedCustomer.totalPurchases.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Advance</span>
                      <span className="text-emerald-700 font-bold">Rs {selectedCustomer.advancePaid.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Remaining</span>
                      <span className="text-rose-700 font-bold">Rs {selectedCustomer.remainingBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Entry with Preset buttons */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Collection Amount (Rs)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Enter collected amount"
                    min="1"
                    className="w-full font-mono text-base font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={() => setQuickAmount(selectedCustomer.monthlyInstallment)}
                      className="absolute right-2 top-2 px-2 py-1 text-[10px] font-semibold bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
                    >
                      Fill Monthly (Rs {selectedCustomer.monthlyInstallment})
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Payment Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CASH', label: 'Cash In Hand' },
                    { id: 'ONLINE_TRANSFER', label: 'UBL Bank' },
                    { id: 'EASYPAISA_JAZZCASH', label: 'EasyPaisa' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setQuickMethod(mode.id as any)}
                      className={`py-2 px-1 text-[11px] font-semibold text-center rounded-lg border transition-colors ${
                        quickMethod === mode.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!selectedCustId || !quickAmount}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Post to Ledger</span>
              </button>
            </form>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-200">
            <button
              onClick={() => setActiveTab('invoices')}
              className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>New Device Sale</span>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Right Column: Customer Installment Schedule Summary (Spreadsheet preview) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Customer Balances & Monthly Dues (USH TRADERS)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time tracking of receivables and installment recovery
              </p>
            </div>
            <button
              onClick={() => setActiveTab('installments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Full Ledger ({customers.length})</span>
              <span>→</span>
            </button>
          </div>

          {/* High-density sheet preview */}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs sheet-table">
              <thead>
                <tr>
                  <th className="w-12 text-center">S.No</th>
                  <th>Customer</th>
                  <th>Item / Notes</th>
                  <th className="text-right">Monthly Due</th>
                  <th className="text-right">Remaining Bal</th>
                  <th className="text-center w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 10).map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                    <td className="text-center font-mono font-medium text-slate-500">
                      #{cust.serialNo}
                    </td>
                    <td className="font-semibold text-slate-900">
                      {cust.name}
                    </td>
                    <td className="text-slate-600 text-[11px] truncate max-w-[130px]">
                      {cust.itemDescription || 'Trading item'}
                    </td>
                    <td className="text-right font-mono font-semibold text-emerald-700 tabular-nums">
                      Rs {cust.monthlyInstallment.toLocaleString()}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-900 tabular-nums">
                      Rs {cust.remainingBalance.toLocaleString()}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => {
                          setSelectedCustId(cust.id);
                          setQuickAmount(cust.monthlyInstallment);
                        }}
                        className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                      >
                        Collect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Showing top 10 of {customers.length} customer installment contracts</span>
            <span className="font-semibold text-slate-700">Total Due: Rs {summaryMetrics.monthlyExpectedReturn.toLocaleString()}/mo</span>
          </div>
        </div>

      </div>

      {/* Recent Cash Flow Transactions (Matching Statement from Sep-2025 Onward) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Live Cash Flow & Activity Stream
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified chronological journal of all incoming receipts, purchases, expenses & loan repayments
            </p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Open Complete Cash Flow Report →
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Recent Collections */}
          <div className="border border-slate-200 rounded-lg p-3">
            <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>Recent Installment Collections</span>
            </h4>
            <div className="mt-2 divide-y divide-slate-100">
              {payments.slice(0, 5).map(pmt => (
                <div key={pmt.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{pmt.customerName}</div>
                    <div className="text-[11px] text-slate-500">{pmt.date} · {pmt.receiptNo}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-700 tabular-nums">
                      +Rs {pmt.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Bal: Rs {pmt.remainingBalanceAfter.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Outflows / Expenses */}
          <div className="border border-slate-200 rounded-lg p-3">
            <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>Recent Expenses & Disbursements</span>
            </h4>
            <div className="mt-2 divide-y divide-slate-100">
              {expenses.slice(0, 5).map(exp => (
                <div key={exp.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{exp.paidTo}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                      {exp.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-rose-600 tabular-nums">
                      -Rs {exp.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">{exp.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
