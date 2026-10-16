import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { LoanParty, PartnerEquity, Vendor, SupplierTransaction } from '../types/accounting';
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
  Truck,
  ShoppingBag,
  Search,
  FileText,
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
    vendors,
    supplierTransactions,
    addVendor,
    updateVendor,
    deleteVendor,
    recordSupplierBill,
    recordSupplierPayment,
  } = useAccounting();

  // Tab: Suppliers vs Loans vs Partners
  const [subTab, setSubTab] = useState<'SUPPLIERS' | 'LOANS' | 'PARTNERS'>('SUPPLIERS');

  // Supplier modals & state
  const [searchTermVendor, setSearchTermVendor] = useState('');
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState('Mobile & General Goods');
  const [newVendorAddress, setNewVendorAddress] = useState('');
  const [newVendorBalance, setNewVendorBalance] = useState<number | ''>('');
  const [newVendorNotes, setNewVendorNotes] = useState('');
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [isSupplierBillModalOpen, setIsSupplierBillModalOpen] = useState(false);
  const [selectedVendorForBill, setSelectedVendorForBill] = useState(vendors[0]?.id || '');
  const [billItemsDesc, setBillItemsDesc] = useState('');
  const [billTotalAmount, setBillTotalAmount] = useState<number | ''>('');
  const [billPaidAmount, setBillPaidAmount] = useState<number | ''>('');
  const [billPaymentAccountId, setBillPaymentAccountId] = useState('acc_1010');
  const [billNotes, setBillNotes] = useState('');

  const [isSupplierPaymentModalOpen, setIsSupplierPaymentModalOpen] = useState(false);
  const [selectedVendorForPayment, setSelectedVendorForPayment] = useState(vendors[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE_TRANSFER' | 'BANK'>('CASH');
  const [paymentAccountId, setPaymentAccountId] = useState('acc_1010');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [viewingVendorKhata, setViewingVendorKhata] = useState<Vendor | null>(null);

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

  const totalVendorPayable = vendors.reduce((sum, v) => sum + v.balancePayable, 0);
  const totalVendorBills = supplierTransactions.filter(t => t.type === 'PURCHASE_BILL').reduce((sum, t) => sum + t.totalAmount, 0);
  const totalVendorPaid = supplierTransactions.filter(t => t.type === 'PAYMENT').reduce((sum, t) => sum + t.paidAmount, 0);

  const filteredVendors = vendors.filter(v => {
    return v.name.toLowerCase().includes(searchTermVendor.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTermVendor.toLowerCase()) ||
      (v.phone && v.phone.includes(searchTermVendor));
  });

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    addVendor({
      name: newVendorName.trim(),
      phone: newVendorPhone.trim(),
      category: newVendorCategory.trim(),
      address: newVendorAddress.trim(),
      balancePayable: Number(newVendorBalance) || 0,
      notes: newVendorNotes.trim(),
    });

    setIsAddVendorModalOpen(false);
    setNewVendorName('');
    setNewVendorPhone('');
    setNewVendorAddress('');
    setNewVendorBalance('');
    setNewVendorNotes('');
    setToastMsg(`Supplier "${newVendorName}" added successfully!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveEditVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;
    updateVendor(editingVendor.id, editingVendor);
    setEditingVendor(null);
    setToastMsg(`Supplier details updated!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeleteVendor = (id: string, name: string) => {
    if (window.confirm(`Delete supplier "${name}"? This will remove all their transaction history.`)) {
      deleteVendor(id);
      setToastMsg(`Supplier "${name}" deleted.`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleRecordSupplierBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForBill || !billTotalAmount || Number(billTotalAmount) <= 0) return;

    const res = recordSupplierBill({
      vendorId: selectedVendorForBill,
      itemsDescription: billItemsDesc || 'Stock Purchase',
      totalAmount: Number(billTotalAmount),
      paidAmount: Number(billPaidAmount) || 0,
      paymentAccountId: billPaymentAccountId,
      notes: billNotes,
    });

    if (res.success) {
      setToastMsg(`Bill ${res.billNo} recorded! Stock and supplier payable updated.`);
      setIsSupplierBillModalOpen(false);
      setBillItemsDesc('');
      setBillTotalAmount('');
      setBillPaidAmount('');
      setBillNotes('');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleRecordSupplierPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForPayment || !paymentAmount || Number(paymentAmount) <= 0) return;

    const res = recordSupplierPayment({
      vendorId: selectedVendorForPayment,
      amount: Number(paymentAmount),
      paymentMethod,
      sourceAccountId: paymentAccountId,
      notes: paymentNotes,
    });

    if (res.success) {
      setToastMsg(`Payment ${res.voucherNo} posted! Supplier balance reduced.`);
      setIsSupplierPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentNotes('');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

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

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg no-print">
              <button
                onClick={() => setSubTab('SUPPLIERS')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  subTab === 'SUPPLIERS'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Suppliers & Vendors
              </button>
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
        {subTab === 'SUPPLIERS' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Active Suppliers & Wholesalers</div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                {vendors.length} Vendors
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Stock Purchases Recorded</div>
              <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
                Rs {totalVendorBills.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Accounts Payable (We Owe)</div>
              <div className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
                Rs {totalVendorPayable.toLocaleString()}
              </div>
            </div>
          </div>
        ) : subTab === 'LOANS' ? (
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

      {/* SUPPLIERS TAB CONTENT */}
      {subTab === 'SUPPLIERS' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Suppliers & Vendors Directory & Khatas</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage stock wholesalers, purchase bills, disbursements, and supplier khata statements
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsAddVendorModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Supplier</span>
              </button>

              <button
                onClick={() => {
                  setSelectedVendorForBill(vendors[0]?.id || '');
                  setIsSupplierBillModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Record Bill</span>
              </button>

              <button
                onClick={() => {
                  setSelectedVendorForPayment(vendors[0]?.id || '');
                  setIsSupplierPaymentModalOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Supplier</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search suppliers by name, phone, or goods category..."
                value={searchTermVendor}
                onChange={(e) => setSearchTermVendor(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {searchTermVendor && (
              <button
                onClick={() => setSearchTermVendor('')}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs sheet-table ledger-table">
              <thead>
                <tr>
                  <th className="w-12 text-center">#</th>
                  <th>Supplier / Company</th>
                  <th>Category</th>
                  <th>Contact & Address</th>
                  <th className="text-right">Balance Payable (We Owe)</th>
                  <th className="text-center w-56">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVendors.map((vendor, idx) => (
                  <tr key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="text-center font-mono text-slate-500 dark:text-slate-400 font-bold">{idx + 1}</td>
                    <td>
                      <div className="font-bold text-slate-900 dark:text-white">{vendor.name}</div>
                      {vendor.notes && <div className="text-[10px] text-slate-400">{vendor.notes}</div>}
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {vendor.category}
                      </span>
                    </td>
                    <td className="text-slate-600 dark:text-slate-400 text-[11px]">
                      <div>{vendor.phone || 'No phone'}</div>
                      <div className="text-[10px] text-slate-400">{vendor.address || '—'}</div>
                    </td>
                    <td className="text-right font-mono font-bold tabular-nums">
                      <span className={vendor.balancePayable > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        Rs {vendor.balancePayable.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedVendorForBill(vendor.id);
                            setIsSupplierBillModalOpen(true);
                          }}
                          className="p-1 px-2 text-[10px] font-bold rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Record Purchase Bill"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Bill</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVendorForPayment(vendor.id);
                            setIsSupplierPaymentModalOpen(true);
                          }}
                          className="p-1 px-2 text-[10px] font-bold rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Pay Supplier"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Pay</span>
                        </button>
                        <button
                          onClick={() => setViewingVendorKhata(vendor)}
                          className="p-1 px-2 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                          title="View Supplier Khata"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Khata</span>
                        </button>
                        <button
                          onClick={() => setEditingVendor(vendor)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vendor.id, vendor.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVendors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No suppliers found matching "{searchTermVendor}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* ================= MODAL: ADD / EDIT SUPPLIER ================= */}
      {(isAddVendorModalOpen || editingVendor) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingVendor ? 'Edit Supplier Details' : 'Add New Supplier / Vendor'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddVendorModalOpen(false);
                  setEditingVendor(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingVendor ? handleSaveEditVendor : handleCreateVendor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Company Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Faiz Wholesalers, Dawood Connection"
                  value={editingVendor ? editingVendor.name : newVendorName}
                  onChange={(e) => editingVendor
                    ? setEditingVendor({ ...editingVendor, name: e.target.value })
                    : setNewVendorName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={editingVendor ? (editingVendor.phone || '') : newVendorPhone}
                    onChange={(e) => editingVendor
                      ? setEditingVendor({ ...editingVendor, phone: e.target.value })
                      : setNewVendorPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="Mobile, Electronics, General"
                    value={editingVendor ? editingVendor.category : newVendorCategory}
                    onChange={(e) => editingVendor
                      ? setEditingVendor({ ...editingVendor, category: e.target.value })
                      : setNewVendorCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Market Address / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hall Road Market, Lahore"
                  value={editingVendor ? (editingVendor.address || '') : newVendorAddress}
                  onChange={(e) => editingVendor
                    ? setEditingVendor({ ...editingVendor, address: e.target.value })
                    : setNewVendorAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Opening Payable Balance (Rs)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={editingVendor ? editingVendor.balancePayable : newVendorBalance}
                  onChange={(e) => editingVendor
                    ? setEditingVendor({ ...editingVendor, balancePayable: Number(e.target.value) || 0 })
                    : setNewVendorBalance(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Amount USH TRADERS currently owes this supplier</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Payment terms, bank details, or goods supplied"
                  value={editingVendor ? (editingVendor.notes || '') : newVendorNotes}
                  onChange={(e) => editingVendor
                    ? setEditingVendor({ ...editingVendor, notes: e.target.value })
                    : setNewVendorNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddVendorModalOpen(false);
                    setEditingVendor(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  {editingVendor ? 'Save Changes' : 'Add Supplier'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD SUPPLIER BILL ================= */}
      {isSupplierBillModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Record Supplier Purchase Bill</span>
              </h3>
              <button
                onClick={() => setIsSupplierBillModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSupplierBill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Supplier / Vendor *
                </label>
                <select
                  value={selectedVendorForBill}
                  onChange={(e) => setSelectedVendorForBill(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-semibold cursor-pointer"
                  required
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Payable: Rs {v.balancePayable.toLocaleString()} · {v.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Items / Stock Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5x iPhone 17 (256GB), 3x Galaxy S25"
                  value={billItemsDesc}
                  onChange={(e) => setBillItemsDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Bill Amount (Rs) *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="1"
                    value={billTotalAmount}
                    onChange={(e) => setBillTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Advance / Paid Upfront (Rs)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={billPaidAmount}
                    onChange={(e) => setBillPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {Number(billPaidAmount) > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Source Account
                  </label>
                  <select
                    value={billPaymentAccountId}
                    onChange={(e) => setBillPaymentAccountId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="acc_1010">1010 - Cash In Hand</option>
                    <option value="acc_1020">1020 - Bank Account (UBL)</option>
                  </select>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Total Purchase:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    Rs {(Number(billTotalAmount) || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Paid Now:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    - Rs {(Number(billPaidAmount) || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Net Added to Supplier Payable:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">
                    Rs {Math.max(0, (Number(billTotalAmount) || 0) - (Number(billPaidAmount) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Reference
                </label>
                <input
                  type="text"
                  placeholder="Invoice number from supplier, delivery details"
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierBillModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Record Bill & Update Inventory
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: PAY SUPPLIER ================= */}
      {isSupplierPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Supplier Disbursement / Payment Voucher</span>
              </h3>
              <button
                onClick={() => setIsSupplierPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSupplierPayment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Vendor *
                </label>
                <select
                  value={selectedVendorForPayment}
                  onChange={(e) => setSelectedVendorForPayment(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-semibold cursor-pointer"
                  required
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Payable: Rs {v.balancePayable.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (Rs) *
                </label>
                <input
                  type="number"
                  placeholder="0"
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="ONLINE_TRANSFER">Online Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid From Account
                  </label>
                  <select
                    value={paymentAccountId}
                    onChange={(e) => setPaymentAccountId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="acc_1010">1010 - Cash In Hand</option>
                    <option value="acc_1020">1020 - UBL Bank</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Reference / Cheque No
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank slip #9821 or Cash receipt"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Confirm & Post Payment
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: SUPPLIER KHATA / LEDGER STATEMENT ================= */}
      {viewingVendorKhata && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 no-print">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Supplier Khata & Transaction Ledger</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewingVendorKhata.name} · {viewingVendorKhata.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Khata</span>
                </button>
                <button
                  onClick={() => setViewingVendorKhata(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">SUPPLIER ACCOUNT</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">{viewingVendorKhata.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {viewingVendorKhata.phone || 'Phone not registered'} · {viewingVendorKhata.address || 'Local wholesale market'}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">CURRENT PAYABLE BALANCE</div>
                  <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    Rs {viewingVendorKhata.balancePayable.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs sheet-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Ref / Bill #</th>
                    <th>Description</th>
                    <th className="text-right">Total Bill</th>
                    <th className="text-right">Paid</th>
                    <th className="text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {supplierTransactions
                    .filter(st => st.vendorId === viewingVendorKhata.id)
                    .map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="font-mono text-slate-500 dark:text-slate-400">{st.date}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.type === 'PURCHASE_BILL'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {st.type === 'PURCHASE_BILL' ? 'Stock Bill' : 'Disbursement'}
                          </span>
                        </td>
                        <td className="font-mono font-semibold text-slate-900 dark:text-white">{st.reference}</td>
                        <td className="text-slate-700 dark:text-slate-300">{st.itemsOrDescription}</td>
                        <td className="text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                          Rs {st.totalAmount.toLocaleString()}
                        </td>
                        <td className="text-right font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                          Rs {st.paidAmount.toLocaleString()}
                        </td>
                        <td className="text-right font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                          Rs {st.balancePayableAfter.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  {supplierTransactions.filter(st => st.vendorId === viewingVendorKhata.id).length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        No transactions recorded for this supplier yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end no-print">
              <button
                onClick={() => setViewingVendorKhata(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Close Statement
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
