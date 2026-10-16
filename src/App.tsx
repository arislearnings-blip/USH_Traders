import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { InstallmentsView } from './components/InstallmentsView';
import { SalesInvoiceView } from './components/SalesInvoiceView';
import { InventoryView } from './components/InventoryView';
import { ExpensesView } from './components/ExpensesView';
import { LoansAndPartnersView } from './components/LoansAndPartnersView';
import { ReportsView } from './components/ReportsView';
import { BatchLedgerModal } from './components/BatchLedgerModal';
import { MobileQuickActionDrawer } from './components/MobileQuickActionDrawer';
import { UshTradersIcon } from './components/UshTradersIcon';
import { RotateCcw } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState<boolean>(false);
  const [isBatchSheetOpen, setIsBatchSheetOpen] = useState<boolean>(false);
  const [selectedCustomerIdForKhata, setSelectedCustomerIdForKhata] = useState<string | null>(null);

  const { currentUser, resetToDefaultData } = useAccounting();

  const handleSelectCustomerKhata = (customerId: string) => {
    setSelectedCustomerIdForKhata(customerId);
    setActiveTab('installments');
  };

  // If user is not logged in, show Email Login screen with invite restriction
  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openQuickEntry={() => setIsQuickEntryOpen(true)}
        openBatchSheet={() => setIsBatchSheetOpen(true)}
      />

      {/* Main Content Area: Fluid and auto-fitting to available screen area */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 py-4 transition-all">
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            openQuickEntry={() => setIsQuickEntryOpen(true)}
            onSelectCustomerKhata={handleSelectCustomerKhata}
          />
        )}

        {activeTab === 'installments' && (
          <InstallmentsView
            initialSelectedCustomerId={selectedCustomerIdForKhata}
            onOpenNewSale={() => setActiveTab('invoices')}
          />
        )}

        {activeTab === 'invoices' && (
          <SalesInvoiceView />
        )}

        {activeTab === 'inventory' && (
          <InventoryView />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView />
        )}

        {activeTab === 'loans' && (
          <LoansAndPartnersView />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}
      </main>

      {/* Clean Unboxed Footer with Reset Control */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-xs text-slate-500 dark:text-slate-400 transition-colors no-print">
        <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <UshTradersIcon className="w-5 h-5 rounded-md shrink-0 shadow-2xs" />
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">USH TRADERS</span>
            <span aria-hidden="true">·</span>
            <span>Financial & Installment ERP</span>
            <span aria-hidden="true">·</span>
            <span>Single Truth Double-Entry</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.confirm('Reset database to default USH TRADERS ledger from attachment?')) {
                  resetToDefaultData();
                }
              }}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 font-medium cursor-pointer"
              title="Reset data back to original USH TRADERS attachment figures"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset to Default Ledger Data</span>
            </button>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">v2.5 Production</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BatchLedgerModal
        isOpen={isBatchSheetOpen}
        onClose={() => setIsBatchSheetOpen(false)}
      />

      <MobileQuickActionDrawer
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AccountingProvider>
        <AppContent />
      </AccountingProvider>
    </ThemeProvider>
  );
}
