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
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Smartphone,
  Receipt,
  Users,
  BarChart3,
} from 'lucide-react';
import { UshTradersIcon } from './UshTradersIcon';
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'installments', label: 'Installments', icon: CalendarCheck },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Smartphone },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'loans', label: 'Loans & Partners', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
        
        {/* Top Control Bar: Brand & Quick Action Controls */}
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-15">
            
            {/* Zone 1: Brand Wordmark with custom UshTradersIcon */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
                title="USH TRADERS - Return to Dashboard"
              >
                <UshTradersIcon className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-xs group-hover:scale-105 transition-transform" />
                <div>
                  <div className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    USH TRADERS
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                    Accounts & Installments
                  </div>
                </div>
              </button>
            </div>

            {/* Zone 2: Action Controls & User Management */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Theme Toggle (Dark / Light) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Cloud Sync indicator */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                <span className="text-[11px] font-semibold">Synced</span>
              </div>

              {/* Batch Ledger Spreadsheet Mode Button */}
              <button
                onClick={openBatchSheet}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Batch Multi-Row Ledger Sheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Batch Sheet</span>
              </button>

              {/* Quick Entry Button */}
              <button
                onClick={openQuickEntry}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Add New Customer Payment or Journal Entry"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Entry</span>
                <span className="sm:hidden">Entry</span>
              </button>

              {/* Invite Member Button (Admin only) */}
              {(currentUser?.role === 'ADMIN' || currentUser?.isOwner) && (
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
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
                  className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-lg px-2 sm:px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[125px] sm:max-w-[170px] truncate"
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
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Sign out of USH TRADERS"
              >
                <LogOut className="w-4 h-4" />
              </button>

            </div>
          </div>
        </div>

        {/* Dedicated Navigation Bar: Auto-fits to available area, guarantees NO tabs are out of visible area */}
        <div className="w-full border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 px-2 sm:px-4 lg:px-6">
          <nav
            aria-label="Main Navigation"
            className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-1 sm:gap-1.5 py-1.5 w-full"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex-1 min-w-[95px] sm:min-w-0 text-center cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      </header>

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </>
  );
};
