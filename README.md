# USH TRADERS - Small Business Accounting & Installment Management Software

A production-ready, open-source accounting web application designed specifically for trading and retail businesses with installment financing, automated invoice tracking, inventory management (with mobile IMEI/serial numbers), and real-time financial statements.

---

## 🚀 Key Features

- **Double-Entry General Ledger (GL)**: Every sale, installment collection, wholesale device purchase, loan transaction, and expense automatically posts balanced Debits and Credits.
- **Customer Installments & Khata System**:
  - Live customer installment ledger matching USH TRADERS records.
  - Track total purchase price, advance downpayments, monthly dues, and remaining balances.
  - 1-Tap installment payment collection with receipt generation and WhatsApp sharing format.
  - Detailed individual customer Khata statements with complete voucher history.
- **QuickBooks Desktop & Spreadsheet Batch Grids**:
  - **QB Multi-Customer Batch Collection Grid**: Mass collection entry across all customers with one-click auto-fill and batch posting.
  - **Spreadsheet Journal Entry Grid**: Desktop-style multi-row debit/credit grid with real-time balance enforcement.
- **Mobile Phones (IMEI Tracking) & Trading Inventory**:
  - IMEI and serial number tracking for smartphones (iPhone 17, Samsung Galaxy, Redmi, Infinix).
  - Wholesale trading items: solar batteries (Mohsin 100Ah), solar DC fans, Honda 125 motorcycles, rickshaw loaders, umbrellas, and sports rackets.
  - Real-time stock valuation and automatic Cost of Goods Sold (COGS) posting.
- **Automated Sales & Invoicing**:
  - Cash vs Installment sales with down payment calculation and monthly payment scheduling.
  - Printable professional invoices with company headers, item breakdown, and terms.
- **Expense Reporting & Disbursements**:
  - Dedicated expense categorization: Agent commissions (Umair, Faiz), telecom mobile packages (Salman), customer early-settlement discounts, utilities, and partner drawings.
  - Receipt voucher attachment upload simulation.
- **Loans & Partners Equity (PPP)**:
  - Loan ledger reconciling lenders (Faiz, Dawood Connection, Yousaf, Ubaid, Haseen Ullah) with Rs 45,890 remaining payable.
  - Partner Profit & Capital Participation (PPP) module for Salman, Ubaid, and Hasnain with equal 33.33% shareholding (Rs 91,686.67 each) and dividend distribution tracking.
- **Real-Time Financial Reports**:
  - **Cash Flow Statement**: Direct method matching Page 11 & 23 of USH TRADERS statement.
  - **Balance Sheet**: Assets = Liabilities + Equity verification.
  - **Profit & Loss (P&L)**: Gross Revenue, COGS, Gross Profit, Operating Expenses, Net Income.
  - **Trial Balance & General Ledger Drill-Down**: Full account audit trail.
  - Export to CSV, JSON database snapshot backup, and print-ready layouts.
- **Mobile Touch-Friendly Workflows**:
  - Bottom action sheet with large touch targets and rapid numeric chips for field collection agents.
  - Role-based user switching (Admin, Accountant, Sales Agent, External Auditor).
  - Multi-tab synchronization via `BroadcastChannel` and `localStorage`.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Motion
- **Build Tool**: Vite

---

## 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/arislearnings-blip/USH-Traders.git
   cd USH-Traders
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📦 Pushing to your GitHub Repository

To push this codebase to your GitHub repository under account **arislearnings-blip**:

1. Create a new repository named **`USH-Traders`** on [GitHub](https://github.com/new).
2. Run the following terminal commands:
   ```bash
   git remote add origin https://github.com/arislearnings-blip/USH-Traders.git
   git push -u origin main
   ```

---

## 📄 License

Open-source under the Apache-2.0 License.
