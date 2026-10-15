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
  Printer,
  Edit3,
  Trash2,
  DollarSign,
} from 'lucide-react';

export const LoansAndPartnersView: React.FC = () => {
  const {
    loanParties,
    partners,
    accounts,
    summaryMetrics,
    recordLoanTransaction,
    recordPartnerDistribution,
    addLoanParty,
    updateLoanParty,
    deleteLoanParty,
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

  // Add / Edit Loan Party Modal State
  const [isAddPartyModalOpen, setIsAddPartyModalOpen] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyContact, setNewPartyContact] = useState('');
  const [newPartyInitialBalance, setNewPartyInitialBalance] = useState<number | ''>('');

  const [editingParty, setEditingParty] = useState<LoanParty | null>(null);

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

  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName) return;

    const initBal = Number(newPartyInitialBalance) || 0;
    addLoanParty({
      name: newPartyName,
      contact: newPartyContact,
      type: 'LENDER',
      totalReceived: initBal,
      totalRepaid: 0,
      balanceToPay: initBal,
    });

    setIsAddPartyModalOpen(false);
    setNewPartyName('');
    setNewPartyContact('');
    setNewPartyInitialBalance('');
    setToastMsg(`Added new lender/supplier: ${newPartyName}!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSaveEditParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParty) return;

    updateLoanParty(editingParty.id, {
      name: editingParty.name,
      contact: editingParty.contact,
      balanceToPay: Number(editingParty.balanceToPay),
    });

    setEditingParty(null);
  };

  const handleDeleteParty = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete loan party "${name}"?`)) {
      deleteLoanParty(id);
    }
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
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Loans, Borrowing & Partner Capital (PPP)</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-md border border-indigo-200 dark:border-indigo-800">
                USH TRADERS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Exact reconciliation of loans payable (Faiz, Dawood, Yousaf) and 3-partner equity participation
            </p>
          </div>

          {/* SubTab Toggle & Print */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setSubTab('LOANS')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  subTab === 'LOANS'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Loan Statement & Lenders
              </button>
              <button
                onClick={() => setSubTab('PARTNERS')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  subTab === 'PARTNERS'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Partners Equity & PPP
              </button>
            </div>
          </div>
        </div>

        {/* Aggregates */}
        {subTab === 'LOANS' ? (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tot Rece (Total Borrowed)</div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                Rs {totalLoanReceived.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tot Paid (Total Repaid)</div>
              <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
                Rs {totalLoanPaid.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">To Be Paid (Net Payable)</div>
              <div className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
                Rs {totalLoanToBePaid.toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">PPP Base Capital</div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                Rs 275,060
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Capital + Profit</div>
              <div className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-400 tabular-nums mt-0.5">
                Rs {summaryMetrics.capitalAndProfit.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Per Partner Share</div>
              <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
                Rs 91,686.67
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOANS TAB CONTENT */}
      {subTab === 'LOANS' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Loan Statement & Outstanding Lender Balances
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tracks borrowing, repayments, and net balance to be paid to suppliers and lenders
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddPartyModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lender</span>
              </button>

              <button
                onClick={() => setIsLoanModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record Loan In / Out</span>
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs sheet-table ledger-table">
              <thead>
                <tr>
                  <th className="w-12 text-center">#</th>
                  <th>Lender / Party</th>
                  <th>Category / Note</th>
                  <th className="text-right">Total Received</th>
                  <th className="text-right">Total Repaid</th>
                  <th className="text-right">Balance To Be Paid</th>
                  <th className="text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loanParties.map((party, idx) => (
                  <tr key={party.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="text-center font-mono text-slate-500 dark:text-slate-400 font-bold">{idx + 1}</td>
                    <td className="font-bold text-slate-900 dark:text-white">{party.name}</td>
                    <td className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {party.contact || (party.balanceToPay > 0 ? 'Active Short-Term Loan' : 'Settled in Full')}
                    </td>
                    <td className="text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                      Rs {party.totalReceived.toLocaleString()}
                    </td>
                    <td className="text-right font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                      Rs {party.totalRepaid.toLocaleString()}
                    </td>
                    <td className="text-right font-mono font-bold tabular-nums">
                      <span className={party.balanceToPay > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}>
                        Rs {party.balanceToPay.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedPartyId(party.id);
                            setLoanTransType('REPAID');
                            setLoanAmount(party.balanceToPay || '');
                            setIsLoanModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                        >
                          Repay
                        </button>
                        <button
                          onClick={() => setEditingParty({ ...party })}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded cursor-pointer"
                          title="Edit Lender Info"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteParty(party.id, party.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete Lender"
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

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Verified against USH TRADERS Loan Summary</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">Total Net Payable: Rs {totalLoanToBePaid.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* PARTNERS TAB CONTENT */}
      {subTab === 'PARTNERS' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Partner Capital, Investments & Dividend Distributions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
              <div key={partner.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-base text-slate-900 dark:text-white">{partner.name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded">
                    {partner.sharePercentage.toFixed(2)}%
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Initial PPP Capital:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Rs {partner.initialCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Total Capital Injected:</span>
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                      Rs {partner.currentInvestment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Drawings Taken:</span>
                    <span className="text-rose-600 dark:text-rose-400">
                      - Rs {partner.drawings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Dividends Paid:</span>
                    <span className="text-amber-700 dark:text-amber-400">
                      - Rs {partner.dividendsPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                    <span className="text-slate-900 dark:text-white">Net Partner Equity:</span>
                    <span className="text-emerald-700 dark:text-emerald-400">
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
                    className="flex-1 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                  >
                    Pay Dividend
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPartnerId(partner.id);
                      setPartnerTransType('DRAWING');
                      setIsPartnerModalOpen(true);
                    }}
                    className="flex-1 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer"
                  >
                    Drawings
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Investment & Shareholder Account</span>
            </div>
            <p className="text-[11px] text-indigo-900 dark:text-indigo-300 leading-relaxed">
              Ubaid Investment Fund of Rs 200,000 received via UBL Online Transfer / Easypaisa is recorded under partner investment equity and provides working capital for wholesale device procurements.
            </p>
          </div>
        </div>
      )}

      {/* Modal: Add Lender / Loan Party */}
      {isAddPartyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add New Loan Party / Lender
              </h3>
              <button onClick={() => setIsAddPartyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParty} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Party Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Faiz Wholesaler, Dawood"
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Contact / Note
                </label>
                <input
                  type="text"
                  placeholder="Phone number or market branch"
                  value={newPartyContact}
                  onChange={(e) => setNewPartyContact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Initial Outstanding Loan (Rs)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newPartyInitialBalance}
                  onChange={(e) => setNewPartyInitialBalance(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPartyModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Loan Party */}
      {editingParty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Party: {editingParty.name}
              </h3>
              <button onClick={() => setEditingParty(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditParty} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Party Name
                </label>
                <input
                  type="text"
                  value={editingParty.name}
                  onChange={(e) => setEditingParty({ ...editingParty, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Contact / Note
                </label>
                <input
                  type="text"
                  value={editingParty.contact || ''}
                  onChange={(e) => setEditingParty({ ...editingParty, contact: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Current Net Balance To Pay (Rs)
                </label>
                <input
                  type="number"
                  value={editingParty.balanceToPay}
                  onChange={(e) => setEditingParty({ ...editingParty, balanceToPay: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingParty(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Loan In / Out */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Record Loan Transaction
              </h3>
              <button
                onClick={() => setIsLoanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLoanSubmit} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLoanTransType('REPAID')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center cursor-pointer ${
                      loanTransType === 'REPAID'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Repay Loan (Outflow)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoanTransType('RECEIVED')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center cursor-pointer ${
                      loanTransType === 'RECEIVED'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Borrow Loan (Inflow)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lender / Party
                </label>
                <select
                  aria-label="Lender / Party"
                  value={selectedPartyId}
                  onChange={(e) => setSelectedPartyId(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {loanParties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Balance: Rs {p.balanceToPay.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount (Rs) *
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  min="1"
                  placeholder="0"
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cash / Bank Account
                </label>
                <select
                  aria-label="Cash / Bank Account"
                  value={loanAccountId}
                  onChange={(e) => setLoanAccountId(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid to Faiz for device stock clearance"
                  value={loanMemo}
                  onChange={(e) => setLoanMemo(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoanModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Partner Capital / Dividend Voucher
              </h3>
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePartnerSubmit} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Partner
                </label>
                <select
                  aria-label="Partner"
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Equity: Rs {p.netEquity.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Distribution Type
                </label>
                <select
                  aria-label="Distribution Type"
                  value={partnerTransType}
                  onChange={(e) => setPartnerTransType(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="DIVIDEND">Profit Dividend Distribution</option>
                  <option value="DRAWING">Owner Drawing (Personal Cash Withdrawal)</option>
                  <option value="INVESTMENT">New Capital Investment Injection</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount (Rs) *
                </label>
                <input
                  type="number"
                  value={partnerAmount}
                  onChange={(e) => setPartnerAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  min="1"
                  placeholder="0"
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account
                </label>
                <select
                  aria-label="Account"
                  value={partnerAccountId}
                  onChange={(e) => setPartnerAccountId(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. June profit distribution or online investment"
                  value={partnerMemo}
                  onChange={(e) => setPartnerMemo(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
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
