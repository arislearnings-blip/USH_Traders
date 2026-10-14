import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { useTheme } from '../context/ThemeContext';
import {
  RefreshCw,
  Plus,
  FileSpreadsheet,
  Sun,
  Moon,
  UserPlus,
  LogOut,
  User,
} from 'lucide-react';
import { InviteMemberModal } from './InviteMemberModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openQuickEntry: () => void;
  openBatchSheet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openQuickEntry,
  openBatchSheet,
}) => {
  const { currentUser, setCurrentUser, users, syncStatus, logout } = useAccounting();
  const { theme, toggleTheme } = useTheme();

  const [isInviteOpen, setIsInviteOpen] = useState(false);

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
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Primary Top Bar Contract: Brand - Nav - Primary Action */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 h-16">
            
            {/* Zone 1: Single text element wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                UT
              </div>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="text-left font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                USH TRADERS
                <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Primary Action & Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* Theme Toggle (Dark / Light) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Cloud Sync indicator */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                <span className="text-[11px]">Synced</span>
              </div>

              {/* Batch Ledger Spreadsheet Mode Button */}
              <button
                onClick={openSpreadsheetGrid}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap border border-slate-200 dark:border-slate-700"
                title="Batch Ledger Spreadsheet Entry"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Batch Sheet</span>
              </button>

              {/* Quick Mobile Entry Drawer Button */}
              <button
                onClick={openQuickEntry}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Entry</span>
                <span className="sm:hidden">Entry</span>
              </button>

              {/* Invite Member Button (Admin only) */}
              {(currentUser?.role === 'ADMIN' || currentUser?.isOwner) && (
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors"
                  title="Invite or Authorize Team Member"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite</span>
                </button>
              )}

              {/* Active User Switcher */}
              <div className="relative">
                <select
                  aria-label="Active user account"
                  value={currentUser?.id || ''}
                  onChange={(e) => {
                    const selected = users.find(u => u.id === e.target.value);
                    if (selected) setCurrentUser(selected);
                  }}
                  className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[150px] sm:max-w-[180px] truncate"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.isOwner ? '(Owner)' : `(${u.role})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sign Out */}
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign out of USH TRADERS"
              >
                <LogOut className="w-4 h-4" />
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Secondary Navigation Bar */}
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1.5 overflow-x-auto flex gap-1 no-scrollbar">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </header>

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </>
  );
};
