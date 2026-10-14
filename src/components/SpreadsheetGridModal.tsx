import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
} from 'lucide-react';

interface SpreadsheetGridModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GridRow {
  id: string;
  accountId: string;
  debit: number | '';
  credit: number | '';
  description: string;
}

export const SpreadsheetGridModal: React.FC<SpreadsheetGridModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { accounts, postJournalEntry } = useAccounting();

  const [entryDate, setEntryDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [entryMemo, setEntryMemo] = useState<string>('Batch General Journal Entry');
  const [entryRef, setEntryRef] = useState<string>('BATCH-01');

  const [rows, setRows] = useState<GridRow[]>([
    { id: '1', accountId: 'acc_1010', debit: 5000, credit: '', description: 'Cash collected' },
    { id: '2', accountId: 'acc_1100', debit: '', credit: 5000, description: 'Customer receivable reduction' },
    { id: '3', accountId: 'acc_5090', debit: '', credit: '', description: '' },
    { id: '4', accountId: '', debit: '', credit: '', description: '' },
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalDebit = rows.reduce((sum, r) => sum + (Number(r.debit) || 0), 0);
  const totalCredit = rows.reduce((sum, r) => sum + (Number(r.credit) || 0), 0);
  const difference = Math.round((totalDebit - totalCredit) * 100) / 100;
  const isBalanced = Math.abs(difference) < 0.01 && totalDebit > 0;

  const handleAddRow = () => {
    setRows(prev => [
      ...prev,
      { id: Date.now().toString(), accountId: '', debit: '', credit: '', description: '' },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 2) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleRowChange = (id: string, field: keyof GridRow, val: any) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (field === 'debit' && val !== '') {
        return { ...r, debit: val, credit: '' }; // mutual exclusivity on single line
      }
      if (field === 'credit' && val !== '') {
        return { ...r, credit: val, debit: '' };
      }
      return { ...r, [field]: val };
    }));
  };

  const handlePostBatch = () => {
    setErrorMessage(null);

    const validLines = rows.filter(r => r.accountId && ((Number(r.debit) || 0) > 0 || (Number(r.credit) || 0) > 0));

    if (validLines.length < 2) {
      setErrorMessage('A balanced journal entry requires at least 2 valid accounts with debit and credit amounts.');
      return;
    }

    if (!isBalanced) {
      setErrorMessage(`Out of Balance by Rs ${Math.abs(difference).toLocaleString()}. Debits must equal Credits.`);
      return;
    }

    const res = postJournalEntry({
      memo: entryMemo,
      reference: entryRef,
      date: entryDate,
      lines: validLines.map(r => ({
        accountId: r.accountId,
        debit: Number(r.debit) || 0,
        credit: Number(r.credit) || 0,
        description: r.description || entryMemo,
      })),
    });

    if (res.success) {
      setSuccessMessage('Batch journal successfully posted to the General Ledger!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } else {
      setErrorMessage(res.error || 'Failed to post journal entry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] border border-slate-300 dark:border-slate-800">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Batch General Ledger Spreadsheet</span>
                <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-semibold">
                  Multi-Row Journal
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct spreadsheet debit & credit ledger entry with real-time balance enforcement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Journal Metadata Fields */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Entry Date</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reference / Voucher #</label>
            <input
              type="text"
              value={entryRef}
              onChange={(e) => setEntryRef(e.target.value)}
              placeholder="e.g. BATCH-OCT-01"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Memo / Purpose</label>
            <input
              type="text"
              value={entryMemo}
              onChange={(e) => setEntryMemo(e.target.value)}
              placeholder="Transaction explanation"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Spreadsheet Editable Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs sheet-table">
              <thead>
                <tr>
                  <th className="w-10 text-center">#</th>
                  <th className="w-64">Chart of Accounts</th>
                  <th className="text-right w-36">Debit (Rs)</th>
                  <th className="text-right w-36">Credit (Rs)</th>
                  <th>Description / Line Memo</th>
                  <th className="w-12 text-center">Del</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="text-center font-mono text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="p-1">
                      <select
                        value={row.accountId}
                        onChange={(e) => handleRowChange(row.id, 'accountId', e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
                      >
                        <option value="">-- Select Account --</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name} ({acc.type})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={row.debit}
                        onChange={(e) => handleRowChange(row.id, 'debit', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full text-right font-mono font-bold text-xs px-2 py-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={row.credit}
                        onChange={(e) => handleRowChange(row.id, 'credit', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full text-right font-mono font-bold text-xs px-2 py-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="Line description"
                        value={row.description}
                        onChange={(e) => handleRowChange(row.id, 'description', e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="text-center p-1">
                      <button
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={rows.length <= 2}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                        title="Remove line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={handleAddRow}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Journal Line</span>
            </button>

            <span className="text-[11px] text-slate-500">
              Press Tab to move across cells · Press Enter to post
            </span>
          </div>
        </div>

        {/* Footer Balance Enforcement Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-xl">
          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-slate-500 mr-2">Total Debits:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                Rs {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 mr-2">Total Credits:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                Rs {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 mr-2">Out of Balance:</span>
              <span className={`font-bold tabular-nums ${isBalanced ? 'text-emerald-700' : 'text-rose-600'}`}>
                Rs {Math.abs(difference).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePostBatch}
              disabled={!isBalanced}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Post Batch Entry to Ledger</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
