import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { LoanParty, PartnerEquity } from '../types/accounting';
import {
  Users,
  Building,
  TrendingUp,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export const LoansAndPartnersView: React.FC = () => {
  const {
    loanParties,
    partners,
    accounts,
    summaryMetrics,
    recordLoanTransaction,
    recordPartnerDistribution,
  } = useAccounting();

  // Tab: Loans vs Partners
  const [subTab, setSubTab] = useState<'LOANS' | 'PARTNERS'>('LOANS');

  // Loan Transaction Modal State
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState(loanParties[0]?.id || '');
  const [loanTransType, setLoanTransType] = useState<'RECEIVED' | 'REPAID'>('REPAID');
  const [loanAmount, setLoanAmount] = useState<number | ''>('');
  const [loanAccountId, setLoanAccountId] = useState('acc_1010');
  const [loanMemo, setLoanMemo] = useState('');

  // Partner Transaction Modal State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(partners[0]?.id || '');
  const [partnerTransType, setPartnerTransType] = useState<'DIVIDEND' | 'DRAWING' | 'INVESTMENT'>('DIVIDEND');
  const [partnerAmount, setPartnerAmount] = useState<number | ''>('');
  const [partnerAccountId, setPartnerAccountId] = useState('acc_1010');
  const [partnerMemo, setPartnerMemo] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const totalLoanReceived = loanParties.reduce((sum, l) => sum + l.totalReceived, 0);
  const totalLoanPaid = loanParties.reduce((sum, l) => sum + l.totalRepaid, 0);
  const totalLoanToBePaid = loanParties.reduce((sum, l) => sum + l.balanceToPay, 0);

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanAmount || Number(loanAmount) <= 0 || !selectedPartyId) return;

    recordLoanTransaction({
      partyId: selectedPartyId,
      type: loanTransType,
      amount: Number(loanAmount),
      sourceAccountId: loanAccountId,
      description: loanMemo || `${loanTransType} transaction`,
    });

    setToastMsg(`Successfully recorded ${loanTransType} of Rs ${Number(loanAmount).toLocaleString()}!`);
    setIsLoanModalOpen(false);
    setLoanAmount('');
    setLoanMemo('');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerAmount || Number(partnerAmount) <= 0 || !selectedPartnerId) return;

    recordPartnerDistribution({
      partnerId: selectedPartnerId,
      type: partnerTransType,
      amount: Number(partnerAmount),
      sourceAccountId: partnerAccountId,
      description: partnerMemo || `Partner ${partnerTransType}`,
    });

    setToastMsg(`Successfully posted partner ${partnerTransType} of Rs ${Number(partnerAmount).toLocaleString()}!`);
    setIsPartnerModalOpen(false);
    setPartnerAmount('');
    setPartnerMemo('');
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-between text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)}>✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                <span>Loans, Borrowing & Partner Capital (PPP)</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200">
                USH TRADERS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Exact reconciliation of loans payable (Faiz, Dawood, Yousaf) and 3-partner equity participation
            </p>
          </div>

          {/* SubTab Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setSubTab('LOANS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                subTab === 'LOANS'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Loan Statement & Lenders
            </button>
            <button
              onClick={() => setSubTab('PARTNERS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                subTab === 'PARTNERS'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Partners Equity & PPP
            </button>
          </div>
        </div>

        {/* Aggregates (Directly matching Attachment Page 14) */}
        {subTab === 'LOANS' ? (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Tot Rece (Total Borrowed)</div>
              <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                Rs {totalLoanReceived.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Tot Paid (Total Repaid)</div>
              <div className="text-lg font-bold font-mono text-emerald-700 tabular-nums mt-0.5">
                Rs {totalLoanPaid.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">To Be Paid (Net Payable)</div>
              <div className="text-lg font-bold font-mono text-rose-600 tabular-nums mt-0.5">
                Rs {totalLoanToBePaid.toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">PPP Total Base Capital</div>
              <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                Rs 275,060
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Capital + Cumulative Profit</div>
              <div className="text-lg font-bold font-mono text-indigo-700 tabular-nums mt-0.5">
                Rs {summaryMetrics.capitalAndProfit.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Equal Share Per Partner</div>
              <div className="text-lg font-bold font-mono text-emerald-700 tabular-nums mt-0.5">
                Rs 91,686.67
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOANS TAB CONTENT */}
      {subTab === 'LOANS' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Loan Statement & Outstanding Lender Balances
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracks borrowing, repayments, and net balance to be paid to suppliers and lenders
              </p>
            </div>
            <button
              onClick={() => setIsLoanModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Loan In / Out</span>
            </button>
          </div>

          <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs qb-grid">
              <thead>
                <tr>
                  <th className="w-12 text-center">#</th>
                  <th>Lender / Party</th>
                  <th>Category / Note</th>
                  <th className="text-right">Total Received</th>
                  <th className="text-right">Total Repaid</th>
                  <th className="text-right">Balance To Be Paid</th>
                  <th className="text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody>
                {loanParties.map((party, idx) => (
                  <tr key={party.id} className="hover:bg-slate-50 transition-colors">
                    <td className="text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="font-bold text-slate-900">{party.name}</td>
                    <td className="text-slate-500 text-[11px]">
                      {party.balanceToPay > 0 ? 'Active Short-Term Loan' : 'Settled in Full'}
                    </td>
                    <td className="text-right font-mono text-slate-700 tabular-nums">
                      Rs {party.totalReceived.toLocaleString()}
                    </td>
                    <td className="text-right font-mono text-emerald-700 tabular-nums">
                      Rs {party.totalRepaid.toLocaleString()}
                    </td>
                    <td className="text-right font-mono font-bold tabular-nums">
                      <span className={party.balanceToPay > 0 ? 'text-rose-600' : 'text-slate-500'}>
                        Rs {party.balanceToPay.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => {
                          setSelectedPartyId(party.id);
                          setLoanTransType('REPAID');
                          setLoanAmount(party.balanceToPay || '');
                          setIsLoanModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                      >
                        Repay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Verified against USH TRADERS Loan Summary (Page 14)</span>
            <span className="font-bold text-rose-600">Total Net Payable: Rs {totalLoanToBePaid.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* PARTNERS TAB CONTENT */}
      {subTab === 'PARTNERS' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Partner Capital, Investments & Dividend Distributions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Salman, Ubaid & Hasnain profit-sharing records (33.33% each) and shareholder ledger
              </p>
            </div>
            <button
              onClick={() => setIsPartnerModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Distribution / Injection</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {partners.map(partner => (
              <div key={partner.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-base text-slate-900">{partner.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                    {partner.sharePercentage.toFixed(2)}%
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Initial PPP Capital:</span>
                    <span className="font-semibold text-slate-800">
                      Rs {partner.initialCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Capital Injected:</span>
                    <span className="font-semibold text-indigo-700">
                      Rs {partner.currentInvestment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Drawings Taken:</span>
                    <span className="text-rose-600">
                      - Rs {partner.drawings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dividends Paid:</span>
                    <span className="text-amber-700">
                      - Rs {partner.dividendsPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                    <span className="text-slate-900">Net Partner Equity:</span>
                    <span className="text-emerald-700">
                      Rs {partner.netEquity.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPartnerId(partner.id);
                      setPartnerTransType('DIVIDEND');
                      setIsPartnerModalOpen(true);
                    }}
                    className="flex-1 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded border border-emerald-200"
                  >
                    Pay Dividend
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPartnerId(partner.id);
                      setPartnerTransType('DRAWING');
                      setIsPartnerModalOpen(true);
                    }}
                    className="flex-1 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded border border-slate-200"
                  >
                    Drawings
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Investment & Shareholder Account (Page 17)</span>
            </div>
            <p className="text-[11px] text-indigo-900 leading-relaxed">
              Ubaid Investment Fund of Rs 200,000 received via UBL Online Transfer / Easypaisa is recorded under partner investment equity and provides working capital for wholesale device procurements.
            </p>
          </div>
        </div>
      )}

      {/* Modal: Loan In / Out */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Record Loan Transaction
              </h3>
              <button
                onClick={() => setIsLoanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLoanSubmit} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLoanTransType('REPAID')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center ${
                      loanTransType === 'REPAID'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Repay Loan (Outflow)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoanTransType('RECEIVED')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center ${
                      loanTransType === 'RECEIVED'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Borrow Loan (Inflow)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Lender / Party
                </label>
                <select
                  value={selectedPartyId}
                  onChange={(e) => setSelectedPartyId(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {loanParties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Balance: Rs {p.balanceToPay.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Amount (Rs) *
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  min="1"
                  placeholder="0"
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cash / Bank Account
                </label>
                <select
                  value={loanAccountId}
                  onChange={(e) => setLoanAccountId(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {accounts
                    .filter(a => a.type === 'ASSET' && a.subType === 'Current Asset')
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Bal: Rs {a.balance.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid to Faiz for device stock clearance"
                  value={loanMemo}
                  onChange={(e) => setLoanMemo(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoanModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Post to Loan Ledger
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Partner Distribution */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Partner Capital / Dividend Voucher
              </h3>
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePartnerSubmit} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Partner
                </label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Equity: Rs {p.netEquity.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Distribution Type
                </label>
                <select
                  value={partnerTransType}
                  onChange={(e) => setPartnerTransType(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="DIVIDEND">Profit Dividend Distribution</option>
                  <option value="DRAWING">Owner Drawing (Personal Cash Withdrawal)</option>
                  <option value="INVESTMENT">New Capital Investment Injection</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Amount (Rs) *
                </label>
                <input
                  type="number"
                  value={partnerAmount}
                  onChange={(e) => setPartnerAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  min="1"
                  placeholder="0"
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Account
                </label>
                <select
                  value={partnerAccountId}
                  onChange={(e) => setPartnerAccountId(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {accounts
                    .filter(a => a.type === 'ASSET' && a.subType === 'Current Asset')
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Bal: Rs {a.balance.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. June profit distribution or online investment"
                  value={partnerMemo}
                  onChange={(e) => setPartnerMemo(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Confirm & Post to Equity
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
