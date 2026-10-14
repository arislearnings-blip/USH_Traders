import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  FileText,
  Printer,
  Smartphone,
  CheckCircle,
  Plus,
  Calendar,
  User,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export const SalesInvoiceView: React.FC = () => {
  const { inventory, createCustomerInstallment, customers } = useAccounting();

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

  // Success & Printable Invoice preview
  const [createdInvoice, setCreatedInvoice] = useState<any | null>(null);

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
      itemDescription: `${customItemDesc} ${itemSerialImei ? `(IMEI/SN: ${itemSerialImei})` : ''}`,
      itemId: selectedItemId || undefined,
    });

    if (res.success) {
      setCreatedInvoice({
        invoiceNo: `INV-2026-${res.customer.serialNo}`,
        date: new Date().toLocaleDateString(),
        customer: res.customer,
        item: customItemDesc,
        imei: itemSerialImei,
        saleType,
        totalPrice,
        advancePaid: saleType === 'CASH' ? totalPrice : advanceDownpayment,
        remainingBalance: res.customer.remainingBalance,
        monthlyInstallment: res.customer.monthlyInstallment,
        durationMonths,
      });

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

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Sales & Automated Invoice Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create professional customer invoices, configure installment contracts with IMEI tracking, and auto-sync ledgers
          </p>
        </div>

        {createdInvoice && (
          <button
            onClick={() => setCreatedInvoice(null)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
          >
            Create Another Invoice
          </button>
        )}
      </div>

      {createdInvoice ? (
        /* Printable Professional Invoice View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 max-w-3xl mx-auto space-y-6">
          
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                  UT
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  USH TRADERS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Wholesale & Retail Mobile Phones, Electronics & General Trading
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Phone: 0300-1122334 · NTN: 928371-4 · Main Bazaar
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 uppercase">
                {createdInvoice.saleType} INVOICE
              </span>
              <div className="font-mono text-base font-bold text-slate-900 mt-2">
                {createdInvoice.invoiceNo}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Date: {createdInvoice.date}
              </div>
            </div>
          </div>

          {/* Customer Particulars */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Billed To (Customer):</div>
              <div className="font-bold text-sm text-slate-900 mt-0.5">
                {createdInvoice.customer.name} (#{createdInvoice.customer.serialNo})
              </div>
              <div className="text-slate-600 font-mono">{createdInvoice.customer.phone}</div>
              <div className="text-slate-600">{createdInvoice.customer.address}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Payment Plan Terms:</div>
              <div className="font-semibold text-slate-900 mt-0.5">
                {createdInvoice.saleType === 'CASH' ? 'Full Cash Settlement' : `${createdInvoice.durationMonths} Monthly Installments`}
              </div>
              <div className="text-slate-600 font-mono">
                Monthly Due: Rs {createdInvoice.monthlyInstallment.toLocaleString()}
              </div>
              <div className="text-emerald-700 font-semibold font-mono">
                Advance Paid: Rs {createdInvoice.advancePaid.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Item Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs qb-grid">
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
                    <div className="font-bold text-slate-900">{createdInvoice.item}</div>
                    <div className="text-[11px] text-slate-500">Official Warranty & Verification Clear</div>
                  </td>
                  <td className="text-center font-mono font-semibold text-slate-700">
                    {createdInvoice.imei || 'N/A'}
                  </td>
                  <td className="text-center font-mono">1</td>
                  <td className="text-right font-mono font-bold text-slate-900 tabular-nums">
                    Rs {createdInvoice.totalPrice.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex justify-end">
            <div className="w-72 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Total Contract Price:</span>
                <span className="font-bold text-slate-900">Rs {createdInvoice.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Advance / Downpayment Paid:</span>
                <span>- Rs {createdInvoice.advancePaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Remaining Khata Balance:</span>
                <span className="text-rose-700">Rs {createdInvoice.remainingBalance.toLocaleString()}</span>
              </div>
              {createdInvoice.saleType === 'INSTALLMENT' && (
                <div className="flex justify-between text-[11px] text-indigo-700 font-medium">
                  <span>Monthly Installment:</span>
                  <span>Rs {createdInvoice.monthlyInstallment.toLocaleString()} / mo</span>
                </div>
              )}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700">Agreement Terms:</div>
            <div>1. Customer agrees to pay the monthly installment by the 10th of every calendar month.</div>
            <div>2. Device ownership passes unconditionally upon full settlement of remaining dues.</div>
            <div>3. In case of lost receipts, ledger record maintained at USH TRADERS shall remain final.</div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-8 text-xs text-slate-600">
            <div className="border-t border-slate-300 pt-2 text-center">
              Customer Signature: {createdInvoice.customer.name}
            </div>
            <div className="border-t border-slate-300 pt-2 text-center">
              Authorized Signature (USH TRADERS)
            </div>
          </div>

          {/* Print & Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between no-print">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Invoice</span>
            </button>
            <button
              onClick={() => setCreatedInvoice(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Done / Return to Invoices
            </button>
          </div>

        </div>
      ) : (
        /* Invoice Creation Grid & Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form */}
          <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              
              {/* Sale Type Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
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
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                      saleType === 'INSTALLMENT'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                      saleType === 'CASH'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    100% Cash Sale
                  </button>
                </div>
              </div>

              {/* Customer Particulars */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Customer Particulars</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Khan"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="0300-1234567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Location / Address
                    </label>
                    <input
                      type="text"
                      placeholder="Market or village name"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Item Selection from Inventory */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>Select Device / Trading Item from Stock</span>
                </div>
                
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Choose from Inventory
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => handleItemSelect(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">-- Or enter custom item details below --</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.stockQty} in stock) · Cash: Rs {item.sellingCashPrice.toLocaleString()} · Installment: Rs {item.sellingInstallmentPrice.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Item Description / Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 17 (256GB)"
                      value={customItemDesc}
                      onChange={(e) => setCustomItemDesc(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      IMEI / Serial Number (for Mobile tracking)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 354891092837192"
                      value={itemSerialImei}
                      onChange={(e) => setItemSerialImei(e.target.value)}
                      className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Installment Calculation */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  <span>Financial Breakdown & Schedule</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Total Sale Price (Rs)
                    </label>
                    <input
                      type="number"
                      value={totalPrice || ''}
                      onChange={(e) => handleRecalculate(Number(e.target.value), advanceDownpayment, durationMonths)}
                      min="1"
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Advance Downpayment (Rs)
                    </label>
                    <input
                      type="number"
                      value={advanceDownpayment || ''}
                      onChange={(e) => handleRecalculate(totalPrice, Number(e.target.value), durationMonths)}
                      min="0"
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {saleType === 'INSTALLMENT' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                          Duration (Months)
                        </label>
                        <select
                          value={durationMonths}
                          onChange={(e) => handleRecalculate(totalPrice, advanceDownpayment, Number(e.target.value))}
                          className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="6">6 Months</option>
                          <option value="10">10 Months</option>
                          <option value="12">12 Months</option>
                          <option value="15">15 Months</option>
                          <option value="18">18 Months</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                          Monthly Installment (Rs)
                        </label>
                        <input
                          type="number"
                          value={monthlyInstallment || ''}
                          onChange={(e) => setMonthlyInstallment(Number(e.target.value))}
                          min="1"
                          className="w-full text-xs font-mono font-bold text-emerald-700 px-2.5 py-1.5 bg-emerald-50 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                {saleType === 'INSTALLMENT' && (
                  <div className="flex justify-between items-center text-xs font-mono text-slate-600 pt-2 border-t border-slate-200">
                    <span>Remaining Balance to recover:</span>
                    <span className="font-bold text-slate-900">
                      Rs {Math.max(0, totalPrice - advanceDownpayment).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!customerName || totalPrice <= 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-bold rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Create Invoice & Update General Ledger</span>
              </button>

            </form>
          </div>

          {/* Right Column: Inventory Quick-Pick & Recent Invoices */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Stock Availability */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>Available Mobile Devices</span>
              </h3>
              <div className="mt-2 divide-y divide-slate-100 text-xs">
                {inventory.filter(i => i.category === 'MOBILE').slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    className="py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-1 rounded transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Stock: {item.stockQty} · IMEI: {item.imeiOrSerial?.slice(-6) || 'N/A'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">Rs {item.sellingInstallmentPrice.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Installment</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Automated Accounting Double-Entry</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Submitting an invoice automatically creates balanced entries:
              </p>
              <ul className="text-[10px] text-indigo-900 font-mono space-y-1 list-disc list-inside">
                <li>Dr Accounts Receivable (Remaining balance)</li>
                <li>Dr Cash In Hand (Advance downpayment)</li>
                <li>Cr Sales Revenue (Total price)</li>
                <li>Dr COGS / Cr Inventory (if stock tracked)</li>
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
