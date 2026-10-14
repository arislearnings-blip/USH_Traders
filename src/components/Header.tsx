import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { APP_USERS } from '../data/initialData';
import {
  Building2,
  RefreshCw,
  Plus,
  ShieldCheck,
  Smartphone,
  FileSpreadsheet,
  Download,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openQuickEntry: () => void;
  openSpreadsheetGrid: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openQuickEntry,
  openSpreadsheetGrid,
}) => {
  const { currentUser, setCurrentUser, syncStatus, lastSyncedAt, exportDatabaseJSON, resetToDefaultData } = useAccounting();

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'installments', label: 'Installments' },
    { id: 'invoices', label: 'Sales & Invoices' },
    { id: 'inventory', label: 'Inventory (Mobiles)' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'loans', label: 'Loans & Partners' },
    { id: 'reports', label: 'Financial Reports' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Primary Top Bar Contract: Brand - Nav - Primary Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              UT
            </div>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="text-left font-bold text-lg tracking-tight text-slate-900 whitespace-nowrap hover:text-indigo-600 transition-colors"
            >
              USH TRADERS
              <span className="block text-[11px] font-normal text-slate-500 uppercase tracking-wider">
                Accounts & Installments
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Cloud Sync indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2 py-1 bg-slate-50 rounded border border-slate-200">
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
              <span className="text-[11px]">Synced</span>
            </div>

            {/* QuickBooks Spreadsheet Grid Mode Button */}
            <button
              onClick={openSpreadsheetGrid}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap border border-slate-200"
              title="QuickBooks Desktop Spreadsheet Mode"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>QB Grid</span>
            </button>

            {/* Quick Mobile Entry Drawer Button */}
            <button
              onClick={openQuickEntry}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-md shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Entry</span>
              <span className="sm:hidden">Entry</span>
            </button>

            {/* Role Switcher */}
            <div className="relative">
              <select
                aria-label="User account role"
                value={currentUser.id}
                onChange={(e) => {
                  const selected = APP_USERS.find(u => u.id === e.target.value);
                  if (selected) setCurrentUser(selected);
                }}
                className="text-xs bg-slate-100 border border-slate-200 text-slate-800 font-medium rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {APP_USERS.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Secondary Navigation Bar */}
      <div className="lg:hidden border-t border-slate-200 bg-slate-50 px-2 py-1.5 overflow-x-auto flex gap-1 no-scrollbar">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
