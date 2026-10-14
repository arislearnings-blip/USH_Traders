import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Wallet,
  Smartphone,
  Receipt,
  CreditCard,
  X,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Building,
} from 'lucide-react';

interface MobileQuickActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const MobileQuickActionDrawer: React.FC<MobileQuickActionDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const { customers, recordInstallmentPayment, recordExpense, loanParties, recordLoanTransaction } = useAccounting();

  // Wizard flow: 'MENU' | 'COLLECT' | 'EXPENSE' | 'LOAN'
  const [currentStep, setCurrentStep] = useState<'MENU' | 'COLLECT' | 'EXPENSE' | 'LOAN'>('MENU');

  // Collect flow
  const [collectCustId, setCollectCustId] = useState('');
  const [collectAmount, setCollectAmount] = useState<number>(0);

  // Expense flow
  const [expCategory, setExpCategory] = useState<any>('COMMISSION');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expPayee, setExpPayee] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Loan flow
  const [loanPartyId, setLoanPartyId] = useState(loanParties[0]?.id || '');
  const [loanAmt, setLoanAmt] = useState<number>(0);

  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectCustId || collectAmount <= 0) return;

    const cust = customers.find(c => c.id === collectCustId);
    const res = recordInstallmentPayment({
      customerId: collectCustId,
      amount: collectAmount,
      paymentMethod: 'CASH',
      notes: 'Mobile touch entry',
    });

    if (res.success) {
      setFeedbackToast(`Collected Rs ${collectAmount.toLocaleString()} from ${cust?.name}!`);
      setTimeout(() => {
        setFeedbackToast(null);
        onClose();
        setCurrentStep('MENU');
      }, 1500);
    }
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0 || !expPayee) return;

    recordExpense({
      category: expCategory,
      amount: expAmount,
      paidFromAccountId: 'acc_1010',
      paidTo: expPayee,
      description: expDesc || 'Mobile logged expense',
    });

    setFeedbackToast(`Logged Rs ${expAmount.toLocaleString()} to ${expPayee}!`);
    setTimeout(() => {
      setFeedbackToast(null);
      onClose();
      setCurrentStep('MENU');
    }, 1500);
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loanAmt <= 0 || !loanPartyId) return;

    recordLoanTransaction({
      partyId: loanPartyId,
      type: 'REPAID',
      amount: loanAmt,
      sourceAccountId: 'acc_1010',
      description: 'Mobile loan repayment',
    });

    setFeedbackToast(`Recorded Rs ${loanAmt.toLocaleString()} loan payment!`);
    setTimeout(() => {
      setFeedbackToast(null);
      onClose();
      setCurrentStep('MENU');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        
        {/* Top Handle / Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {currentStep !== 'MENU' && (
              <button
                onClick={() => setCurrentStep('MENU')}
                className="p-1 -ml-1 text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-bold text-base text-slate-900">
              {currentStep === 'MENU' && 'Fast Touch Entry'}
              {currentStep === 'COLLECT' && 'Collect Installment'}
              {currentStep === 'EXPENSE' && 'Log Quick Expense'}
              {currentStep === 'LOAN' && 'Repay Loan / Faiz'}
            </h3>
          </div>
          <button
            onClick={() => {
              onClose();
              setCurrentStep('MENU');
            }}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedbackToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* STEP 1: Main Touch Actions Menu */}
        {currentStep === 'MENU' && (
          <div className="space-y-2.5">
            <button
              onClick={() => setCurrentStep('COLLECT')}
              className="w-full p-4 rounded-xl border border-slate-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Receive Customer Payment</div>
                  <div className="text-xs text-slate-500">Pick customer and mark installment received</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateToTab('invoices');
              }}
              className="w-full p-4 rounded-xl border border-slate-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">New Device / Mobile Sale</div>
                  <div className="text-xs text-slate-500">Create new installment contract or cash sale</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button
              onClick={() => setCurrentStep('EXPENSE')}
              className="w-full p-4 rounded-xl border border-slate-200 bg-amber-50/60 hover:bg-amber-100/70 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Log Daily Expense</div>
                  <div className="text-xs text-slate-500">Commission, mobile data package, utilities</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button
              onClick={() => setCurrentStep('LOAN')}
              className="w-full p-4 rounded-xl border border-slate-200 bg-rose-50/60 hover:bg-rose-100/70 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Pay Lender / Faiz</div>
                  <div className="text-xs text-slate-500">Record loan repayment to supplier or lender</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        )}

        {/* STEP 2: Collect Payment Subflow */}
        {currentStep === 'COLLECT' && (
          <form onSubmit={handleCollectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Customer
              </label>
              <select
                value={collectCustId}
                onChange={(e) => {
                  setCollectCustId(e.target.value);
                  const c = customers.find(cust => cust.id === e.target.value);
                  if (c) setCollectAmount(c.monthlyInstallment);
                }}
                className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    #{c.serialNo} {c.name} · Due: Rs {c.monthlyInstallment.toLocaleString()} (Bal: Rs {c.remainingBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount Collected (Rs)
              </label>
              <input
                type="number"
                value={collectAmount || ''}
                onChange={(e) => setCollectAmount(Number(e.target.value))}
                min="1"
                className="w-full font-mono text-xl font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Quick Touch Keypad Chips */}
            <div className="flex gap-2 flex-wrap">
              {[1000, 2000, 3000, 5000, 10000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCollectAmount(amt)}
                  className="px-3 py-1.5 text-xs font-bold font-mono bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-200"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!collectCustId || collectAmount <= 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
            >
              Confirm Collection
            </button>
          </form>
        )}

        {/* STEP 3: Expense Subflow */}
        {currentStep === 'EXPENSE' && (
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expense Category
              </label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="COMMISSION">Commission (Umair / Faiz)</option>
                <option value="MOBILE_PACKAGES">Mobile Package (Salman)</option>
                <option value="DISCOUNT_ALLOWED">Discount Allowed</option>
                <option value="UTILITIES">Shop Utilities & Solar</option>
                <option value="MISC_EXP">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Paid To (Person / Shop)
              </label>
              <input
                type="text"
                placeholder="e.g. Umair / Zong"
                value={expPayee}
                onChange={(e) => setExpPayee(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (Rs)
              </label>
              <input
                type="number"
                value={expAmount || ''}
                onChange={(e) => setExpAmount(Number(e.target.value))}
                min="1"
                className="w-full font-mono text-xl font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={expAmount <= 0 || !expPayee}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
            >
              Post Expense
            </button>
          </form>
        )}

        {/* STEP 4: Loan Repayment Subflow */}
        {currentStep === 'LOAN' && (
          <form onSubmit={handleLoanSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Lender / Supplier
              </label>
              <select
                value={loanPartyId}
                onChange={(e) => {
                  setLoanPartyId(e.target.value);
                  const p = loanParties.find(lp => lp.id === e.target.value);
                  if (p) setLoanAmt(p.balanceToPay);
                }}
                className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {loanParties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Balance: Rs {p.balanceToPay.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Repayment Amount (Rs)
              </label>
              <input
                type="number"
                value={loanAmt || ''}
                onChange={(e) => setLoanAmt(Number(e.target.value))}
                min="1"
                className="w-full font-mono text-xl font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loanAmt <= 0}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
            >
              Post Loan Repayment
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
