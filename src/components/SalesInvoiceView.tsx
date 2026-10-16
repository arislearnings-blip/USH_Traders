import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice } from '../types/accounting';
import {
  FileText,
  Printer,
  Smartphone,
  CheckCircle,
  Plus,
  Calendar,
  User,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  X,
  CreditCard,
  DollarSign,
  Check,
} from 'lucide-react';
import { UshTradersIcon } from './UshTradersIcon';

export const SalesInvoiceView: React.FC = () => {
  const {
    inventory,
    createCustomerInstallment,
    invoices,
    updateInvoice,
    deleteInvoice,
  } = useAccounting();

  // Active view: 'LIST' | 'CREATE'
  const [activeSubTab, setActiveSubTab] = useState<'LIST' | 'CREATE'>('LIST');

  // Search & Filters for invoice list
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INSTALLMENT' | 'CASH'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAID' | 'CANCELLED'>('ALL');

  // Viewing & Printing Modal
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Editing Modal
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Invoice creation form state
  const [saleType, setSaleType] = useState<'INSTALLMENT' | 'CASH'>('INSTALLMENT');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [itemSerialImei, setItemSerialImei] = useState('');

  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [advanceDownpayment, setAdvanceDownpayment] = useState<number>(0);
  const [durationMonths, setDurationMonths] = useState<number>(10);
  const [monthlyInstallment, setMonthlyInstallment] = useState<number>(0);

  const selectedInventoryItem = inventory.find(i => i.id === selectedItemId);

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      setCustomItemDesc(`${item.brand} ${item.model} (${item.storage || item.category})`);
      setItemSerialImei(item.imeiOrSerial || '');
      const price = saleType === 'INSTALLMENT' ? item.sellingInstallmentPrice : item.sellingCashPrice;
      setTotalPrice(price);
      const advance = Math.round(price * 0.2); // 20% typical downpayment
      setAdvanceDownpayment(advance);
      const remaining = price - advance;
      setMonthlyInstallment(Math.round(remaining / durationMonths));
    }
  };

  const handleRecalculate = (price: number, advance: number, months: number) => {
    setTotalPrice(price);
    setAdvanceDownpayment(advance);
    setDurationMonths(months);
    const rem = Math.max(0, price - advance);
    setMonthlyInstallment(months > 0 ? Math.round(rem / months) : rem);
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || totalPrice <= 0) return;

    const res = createCustomerInstallment({
      name: customerName,
      phone: customerPhone || '0300-0000000',
      address: customerAddress || 'Local Market',
      totalPurchases: totalPrice,
      advancePaid: saleType === 'CASH' ? totalPrice : advanceDownpayment,
      monthlyInstallment: saleType === 'CASH' ? 0 : monthlyInstallment,
      startDate: new Date().toISOString().split('T')[0],
      itemDescription: customItemDesc || 'Mobile Device / Trading Goods',
      itemId: selectedItemId || undefined,
      imeiOrSerial: itemSerialImei || undefined,
      durationMonths: saleType === 'CASH' ? 0 : durationMonths,
    });

    if (res.success && res.invoice) {
      setViewingInvoice(res.invoice);
      setActiveSubTab('LIST');

      // Clear form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setSelectedItemId('');
      setCustomItemDesc('');
      setItemSerialImei('');
      setTotalPrice(0);
      setAdvanceDownpayment(0);
      setMonthlyInstallment(0);
    }
  };

  const handleSaveEditInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    updateInvoice(editingInvoice.id, {
      customerName: editingInvoice.customerName,
      customerPhone: editingInvoice.customerPhone,
      customerAddress: editingInvoice.customerAddress,
      itemDescription: editingInvoice.itemDescription,
      imeiOrSerial: editingInvoice.imeiOrSerial,
      totalPrice: Number(editingInvoice.totalPrice),
      advancePaid: Number(editingInvoice.advancePaid),
      remainingBalance: Math.max(0, Number(editingInvoice.totalPrice) - Number(editingInvoice.advancePaid)),
      monthlyInstallment: Number(editingInvoice.monthlyInstallment),
      status: editingInvoice.status,
      notes: editingInvoice.notes,
    });

    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (id: string, invNo: string) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invNo}?`)) {
      deleteInvoice(id);
      if (viewingInvoice?.id === id) setViewingInvoice(null);
    }
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchSearch =
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerPhone && inv.customerPhone.includes(searchTerm)) ||
      inv.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.imeiOrSerial && inv.imeiOrSerial.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = typeFilter === 'ALL' || inv.saleType === typeFilter;
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const totalInvoicedAmount = invoices.reduce((sum, inv) => sum + inv.totalPrice, 0);
  const totalReceivables = invoices.reduce((sum, inv) => sum + inv.remainingBalance, 0);
  const totalAdvancesCollected = invoices.reduce((sum, inv) => sum + inv.advancePaid, 0);
  const activeContractsCount = invoices.filter(i => i.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Sales & Invoice Management</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-md border border-indigo-200 dark:border-indigo-800">
              USH TRADERS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete billing registry: Create, view, edit, print official sales invoices and installment agreements with IMEI serials
          </p>
        </div>

        {/* Tab Switcher & Create Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('LIST')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'LIST'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>All Invoices ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('CREATE')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'CREATE'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ New Sale Invoice</span>
          </button>
        </div>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Sales Invoiced</div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            Rs {totalInvoicedAmount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{invoices.length} total billed contracts</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Advances Collected</div>
          <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
            Rs {totalAdvancesCollected.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">Cash collected at sale</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Receivables Remaining</div>
          <div className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400 mt-1 tabular-nums">
            Rs {totalReceivables.toLocaleString()}
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-500 mt-0.5">Installment khata balance</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Active Contracts</div>
          <div className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-400 mt-1 tabular-nums">
            {activeContractsCount} Customers
          </div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-500 mt-0.5">Currently paying dues</div>
        </div>
      </div>

      {activeSubTab === 'LIST' ? (
        /* ================= INVOICE LIST TABLE WITH INLINE ACTIONS ================= */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search invoice #, customer, item, IMEI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                aria-label="Filter sale type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="INSTALLMENT">Installments</option>
                <option value="CASH">Cash Sales</option>
              </select>

              <select
                aria-label="Filter status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PAID">Paid in Full</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sheet-table ledger-table">
              <thead>
                <tr>
                  <th className="w-28">Invoice #</th>
                  <th className="w-24">Date</th>
                  <th>Customer Particulars</th>
                  <th>Item & Specifications / IMEI</th>
                  <th className="text-center w-24">Sale Type</th>
                  <th className="text-right w-28">Contract Total</th>
                  <th className="text-right w-24">Advance</th>
                  <th className="text-right w-28">Balance Due</th>
                  <th className="text-center w-20">Status</th>
                  <th className="text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
                      No invoices found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {inv.invoiceNo}
                      </td>
                      <td className="font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {inv.date}
                      </td>
                      <td>
                        <div className="font-bold text-slate-900 dark:text-white">{inv.customerName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {inv.customerPhone || 'N/A'} {inv.customerAddress ? `· ${inv.customerAddress}` : ''}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{inv.itemDescription}</div>
                        {inv.imeiOrSerial && (
                          <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                            IMEI/SN: {inv.imeiOrSerial}
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.saleType === 'INSTALLMENT'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {inv.saleType}
                        </span>
                      </td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        Rs {inv.totalPrice.toLocaleString()}
                      </td>
                      <td className="text-right font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                        Rs {inv.advancePaid.toLocaleString()}
                      </td>
                      <td className="text-right font-mono font-bold tabular-nums">
                        <span className={inv.remainingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                          Rs {inv.remainingBalance.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                            : inv.status === 'CANCELLED'
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          
                          {/* View Button */}
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                            title="View Official Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print Button */}
                          <button
                            onClick={() => {
                              setViewingInvoice(inv);
                              setTimeout(() => window.print(), 150);
                            }}
                            className="p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                            title="Print Official Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => setEditingInvoice({ ...inv })}
                            className="p-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                            title="Edit Invoice Particulars"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNo)}
                            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= CREATE NEW INVOICE FORM ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              
              {/* Sale Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contract / Sale Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSaleType('INSTALLMENT');
                      if (selectedInventoryItem) {
                        handleRecalculate(selectedInventoryItem.sellingInstallmentPrice, advanceDownpayment, durationMonths);
                      }
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                      saleType === 'INSTALLMENT'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    Installment Agreement (Khata)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSaleType('CASH');
                      if (selectedInventoryItem) {
                        handleRecalculate(selectedInventoryItem.sellingCashPrice, selectedInventoryItem.sellingCashPrice, 0);
                      }
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                      saleType === 'CASH'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    100% Cash Sale
                  </button>
                </div>
              </div>

              {/* Customer Particulars */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Customer Particulars</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Khan"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Address / Locality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Main Bazaar"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Item Selection & Serial/IMEI */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Item & Device Specifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Pick from Stock Inventory (Optional)
                    </label>
                    <select
                      aria-label="Pick from Stock Inventory"
                      value={selectedItemId}
                      onChange={(e) => handleItemSelect(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Stock Item or Type Custom Below --</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.brand} {item.model} (Stock: {item.stockQty}) - Rs {item.sellingInstallmentPrice.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Item Description *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apple iPhone 17 (256GB)"
                      value={customItemDesc}
                      onChange={(e) => setCustomItemDesc(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      IMEI / Serial Number (for Mobile & Warranty Verification)
                    </label>
                    <input
                      type="text"
                      placeholder="15-digit IMEI or Engine / Frame Serial"
                      value={itemSerialImei}
                      onChange={(e) => setItemSerialImei(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Installment Calculation */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Financial Plan & Terms</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Total Sale Price (Rs) *
                    </label>
                    <input
                      type="number"
                      value={totalPrice || ''}
                      onChange={(e) => handleRecalculate(Number(e.target.value), advanceDownpayment, durationMonths)}
                      min="1"
                      className="w-full text-xs font-mono font-bold px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Advance Downpayment (Rs)
                    </label>
                    <input
                      type="number"
                      value={advanceDownpayment || ''}
                      onChange={(e) => handleRecalculate(totalPrice, Number(e.target.value), durationMonths)}
                      min="0"
                      className="w-full text-xs font-mono font-bold px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {saleType === 'INSTALLMENT' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Duration (Months)
                        </label>
                        <select
                          aria-label="Duration in months"
                          value={durationMonths}
                          onChange={(e) => handleRecalculate(totalPrice, advanceDownpayment, Number(e.target.value))}
                          className="w-full text-xs font-mono px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="6">6 Months</option>
                          <option value="10">10 Months</option>
                          <option value="12">12 Months</option>
                          <option value="15">15 Months</option>
                          <option value="18">18 Months</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Monthly Installment (Rs)
                        </label>
                        <input
                          type="number"
                          value={monthlyInstallment || ''}
                          onChange={(e) => setMonthlyInstallment(Number(e.target.value))}
                          min="1"
                          className="w-full text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                {saleType === 'INSTALLMENT' && (
                  <div className="flex justify-between items-center text-xs font-mono text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Remaining Balance to recover:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Rs {Math.max(0, totalPrice - advanceDownpayment).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!customerName || totalPrice <= 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Create Invoice & Update General Ledger</span>
              </button>

            </form>
          </div>

          {/* Right Column: Inventory Quick-Pick */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Available Mobile Devices</span>
              </h3>
              <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {inventory.filter(i => i.category === 'MOBILE').slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        Stock: {item.stockQty} · IMEI: {item.imeiOrSerial?.slice(-6) || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        Rs {item.sellingInstallmentPrice.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Installment
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Automated Double-Entry Ledger</span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-900 dark:text-indigo-300">
                Submitting an invoice automatically creates balanced entries:
              </p>
              <ul className="text-[10px] font-mono space-y-1 list-disc list-inside text-indigo-800 dark:text-indigo-400">
                <li>Dr Accounts Receivable (Remaining balance)</li>
                <li>Dr Cash In Hand (Advance downpayment)</li>
                <li>Cr Sales Revenue (Total contract amount)</li>
                <li>Dr COGS / Cr Inventory (if stock tracked)</li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* ================= VIEW & PRINT INVOICE MODAL ================= */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-transparent print:static">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-w-3xl w-full space-y-6 my-auto transition-colors print:max-w-full print:w-full print:p-0 print:border-none print:shadow-none printable-modal">
            
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 no-print">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Official Document Preview
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div id="printable-invoice" className="space-y-6">
              
              {/* Header with USH Traders emblem */}
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <UshTradersIcon className="w-10 h-10 rounded-xl shadow-xs" />
                    <div>
                      <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        USH TRADERS
                      </span>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Wholesale & Retail Mobile Phones & General Trading
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-2">
                    Phone: 0300-1122334 · NTN: 928371-4 · Main Bazaar
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800 uppercase">
                    {viewingInvoice.saleType} INVOICE
                  </span>
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-2">
                    {viewingInvoice.invoiceNo}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Date: {viewingInvoice.date}
                  </div>
                </div>
              </div>

              {/* Customer Particulars */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Billed To (Customer):</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {viewingInvoice.customerName}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-mono">{viewingInvoice.customerPhone || 'N/A'}</div>
                  <div className="text-slate-600 dark:text-slate-400">{viewingInvoice.customerAddress || 'Local Area'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment Plan Terms:</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {viewingInvoice.saleType === 'CASH' ? 'Full Cash Settlement' : `${viewingInvoice.durationMonths} Monthly Installments`}
                  </div>
                  {viewingInvoice.monthlyInstallment > 0 && (
                    <div className="text-slate-600 dark:text-slate-400 font-mono">
                      Monthly Due: Rs {viewingInvoice.monthlyInstallment.toLocaleString()}
                    </div>
                  )}
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                    Advance Paid: Rs {viewingInvoice.advancePaid.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Item Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs sheet-table ledger-table">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">#</th>
                      <th>Item Description & Specifications</th>
                      <th className="text-center">IMEI / Serial</th>
                      <th className="text-center w-16">Qty</th>
                      <th className="text-right">Contract Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-center font-mono">1</td>
                      <td>
                        <div className="font-bold text-slate-900 dark:text-white">{viewingInvoice.itemDescription}</div>
                        <div className="text-[11px] text-slate-500">Official Warranty & Verification Clear</div>
                      </td>
                      <td className="text-center font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {viewingInvoice.imeiOrSerial || 'N/A'}
                      </td>
                      <td className="text-center font-mono">1</td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        Rs {viewingInvoice.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown */}
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Total Contract Price:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Rs {viewingInvoice.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span>Advance / Downpayment Paid:</span>
                    <span>- Rs {viewingInvoice.advancePaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                    <span>Remaining Balance:</span>
                    <span className={viewingInvoice.remainingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                      Rs {viewingInvoice.remainingBalance.toLocaleString()}
                    </span>
                  </div>
                  {viewingInvoice.saleType === 'INSTALLMENT' && viewingInvoice.monthlyInstallment > 0 && (
                    <div className="flex justify-between text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                      <span>Monthly Installment:</span>
                      <span>Rs {viewingInvoice.monthlyInstallment.toLocaleString()} / mo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300">Agreement Terms:</div>
                <div>1. Customer agrees to pay the monthly installment by the 10th of every calendar month.</div>
                <div>2. Device ownership passes unconditionally upon full settlement of remaining dues.</div>
                <div>3. In case of lost receipts, ledger record maintained at USH TRADERS shall remain final.</div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 pt-8 text-xs text-slate-600 dark:text-slate-400">
                <div className="border-t border-slate-300 dark:border-slate-700 pt-2 text-center">
                  Customer Signature: {viewingInvoice.customerName}
                </div>
                <div className="border-t border-slate-300 dark:border-slate-700 pt-2 text-center font-bold">
                  Authorized Signature (USH TRADERS)
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ================= EDIT INVOICE MODAL ================= */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-xl w-full space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Edit Invoice: {editingInvoice.invoiceNo}</span>
              </h2>
              <button
                onClick={() => setEditingInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditInvoice} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editingInvoice.customerName}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, customerName: e.target.value })}
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
                    value={editingInvoice.customerPhone || ''}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, customerPhone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  value={editingInvoice.itemDescription}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, itemDescription: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    IMEI / Serial Number
                  </label>
                  <input
                    type="text"
                    value={editingInvoice.imeiOrSerial || ''}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, imeiOrSerial: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Invoice Status
                  </label>
                  <select
                    aria-label="Invoice Status"
                    value={editingInvoice.status}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PAID">Paid in Full</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Total Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingInvoice.totalPrice}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, totalPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Advance Paid (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingInvoice.advancePaid}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, advancePaid: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Monthly Due (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingInvoice.monthlyInstallment}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, monthlyInstallment: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono font-bold text-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Contract Notes
                </label>
                <input
                  type="text"
                  value={editingInvoice.notes || ''}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, notes: e.target.value })}
                  placeholder="Additional terms or guarantor notes"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
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
