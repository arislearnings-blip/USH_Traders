import React, { useState } from 'react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InstallmentsView } from './components/InstallmentsView';
import { SalesInvoiceView } from './components/SalesInvoiceView';
import { InventoryView } from './components/InventoryView';
import { ExpensesView } from './components/ExpensesView';
import { LoansAndPartnersView } from './components/LoansAndPartnersView';
import { ReportsView } from './components/ReportsView';
import { SpreadsheetGridModal } from './components/SpreadsheetGridModal';
import { MobileQuickActionDrawer } from './components/MobileQuickActionDrawer';
import { RotateCcw, ShieldCheck, HeartHandshake } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState<boolean>(false);
  const [isSpreadsheetGridOpen, setIsSpreadsheetGridOpen] = useState<boolean>(false);
  const [selectedCustomerIdForKhata, setSelectedCustomerIdForKhata] = useState<string | null>(null);

  const { resetToDefaultData } = useAccounting();

  const handleSelectCustomerKhata = (customerId: string) => {
    setSelectedCustomerIdForKhata(customerId);
    setActiveTab('installments');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openQuickEntry={() => setIsQuickEntryOpen(true)}
        openSpreadsheetGrid={() => setIsSpreadsheetGridOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {/* Clean Unboxed Footer with Reset / Demo Company Control */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800">USH TRADERS</span>
            <span aria-hidden="true">·</span>
            <span>LedgerFlow Business Engine</span>
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
              className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 font-medium"
              title="Reset data back to original USH TRADERS attachment figures"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset to Default Ledger Data</span>
            </button>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">v2.4 Production</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SpreadsheetGridModal
        isOpen={isSpreadsheetGridOpen}
        onClose={() => setIsSpreadsheetGridOpen(false)}
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
    <AccountingProvider>
      <AppContent />
    </AccountingProvider>
  );
}
