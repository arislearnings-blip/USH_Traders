import { Account, Customer, Vendor, InventoryItem, ExpenseRecord, LoanParty, LoanTransaction, PartnerEquity, AppUser, JournalEntry } from '../types/accounting';

export const INITIAL_ACCOUNTS: Account[] = [
  // Assets (1000 - 1999)
  { id: 'acc_1010', code: '1010', name: 'Cash In Hand', type: 'ASSET', subType: 'Current Asset', balance: 12450, isSystem: true, description: 'Physical cash available in register / safe' },
  { id: 'acc_1020', code: '1020', name: 'UBL Bank Account', type: 'ASSET', subType: 'Current Asset', balance: 45200, isSystem: true, description: 'Commercial checking account' },
  { id: 'acc_1030', code: '1030', name: 'EasyPaisa / Mobile Wallet', type: 'ASSET', subType: 'Current Asset', balance: 8300, isSystem: true, description: 'Mobile money collection account' },
  { id: 'acc_1100', code: '1100', name: 'Accounts Receivable (Customers)', type: 'ASSET', subType: 'Current Asset', balance: 820500, isSystem: true, description: 'Installment balances receivable from customers' },
  { id: 'acc_1200', code: '1200', name: 'Merchandise Inventory', type: 'ASSET', subType: 'Current Asset', balance: 345000, isSystem: true, description: 'Mobile phones and trading inventory on hand' },
  { id: 'acc_1500', code: '1500', name: 'Shop Fixtures & Assets', type: 'ASSET', subType: 'Fixed Asset', balance: 85000, isSystem: true, description: 'Display counters and store equipment' },

  // Liabilities (2000 - 2999)
  { id: 'acc_2010', code: '2010', name: 'Accounts Payable (Vendors)', type: 'LIABILITY', subType: 'Current Liability', balance: 35000, isSystem: true, description: 'Payables to wholesale phone suppliers' },
  { id: 'acc_2100', code: '2100', name: 'Short-Term Loans Payable', type: 'LIABILITY', subType: 'Current Liability', balance: 45890, isSystem: true, description: 'Outstanding short term loans (Faiz, Dawood, etc.)' },
  { id: 'acc_2200', code: '2200', name: 'Customer Advances Held', type: 'LIABILITY', subType: 'Current Liability', balance: 18000, isSystem: true, description: 'Down payments received before delivery' },

  // Equity (3000 - 3999)
  { id: 'acc_3010', code: '3010', name: 'Salman Capital Account', type: 'EQUITY', subType: 'Owner Equity', balance: 91686.67, isSystem: true, description: '1/3 Share Capital' },
  { id: 'acc_3020', code: '3020', name: 'Ubaid Capital Account', type: 'EQUITY', subType: 'Owner Equity', balance: 91686.67, isSystem: true, description: '1/3 Share Capital' },
  { id: 'acc_3030', code: '3030', name: 'Hasnain Capital Account', type: 'EQUITY', subType: 'Owner Equity', balance: 91686.67, isSystem: true, description: '1/3 Share Capital' },
  { id: 'acc_3050', code: '3050', name: 'Partner Investment / Loans', type: 'EQUITY', subType: 'Owner Equity', balance: 200000, isSystem: true, description: 'Active investor / partner capital fund' },
  { id: 'acc_3200', code: '3200', name: 'Retained Earnings & Accumulated Profit', type: 'EQUITY', subType: 'Retained Earnings', balance: 587060, isSystem: true, description: 'Cumulative undistributed trading profits' },
  { id: 'acc_3300', code: '3300', name: 'Partner Drawings / Dividends', type: 'EQUITY', subType: 'Drawings', balance: -45000, isSystem: true, description: 'Cash withdrawals by partners' },

  // Revenue (4000 - 4999)
  { id: 'acc_4010', code: '4010', name: 'Sales Revenue - Mobiles & Trading', type: 'REVENUE', subType: 'Operating Revenue', balance: 1124890, isSystem: true, description: 'Revenue from cash and installment device sales' },
  { id: 'acc_4020', code: '4020', name: 'Installment Markup & Financing Fee', type: 'REVENUE', subType: 'Operating Revenue', balance: 215400, isSystem: true, description: 'Profit added on installment contracts' },

  // Expenses (5000 - 5999)
  { id: 'acc_5010', code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE', subType: 'Cost of Sales', balance: 785000, isSystem: true, description: 'Direct purchase cost of inventory items sold' },
  { id: 'acc_5020', code: '5020', name: 'Sales Commissions & Referrals', type: 'EXPENSE', subType: 'Operating Expense', balance: 34500, isSystem: true, description: 'Commissions paid to agents (Faiz, Umair, etc.)' },
  { id: 'acc_5030', code: '5030', name: 'Discounts Allowed to Customers', type: 'EXPENSE', subType: 'Operating Expense', balance: 14200, isSystem: true, description: 'Settlement and early payment discounts' },
  { id: 'acc_5040', code: '5040', name: 'Mobile Packages & Telecom Expense', type: 'EXPENSE', subType: 'Operating Expense', balance: 6800, isSystem: true, description: 'Data packs, internet, mobile recharge packages' },
  { id: 'acc_5050', code: '5050', name: 'Shop Utilities & Rent', type: 'EXPENSE', subType: 'Operating Expense', balance: 28000, isSystem: true, description: 'Electricity, solar maintenance, store upkeep' },
  { id: 'acc_5090', code: '5090', name: 'Miscellaneous Expenses', type: 'EXPENSE', subType: 'Operating Expense', balance: 9400, isSystem: true, description: 'General operational sundries' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c_04', serialNo: 4, name: 'Salman', phone: '0300-1122334', address: 'Bazaar Main', totalPurchases: 47000, advancePaid: 5000, monthlyInstallment: 4600, remainingBalance: 34250, startDate: '2025-09-29', status: 'ACTIVE', itemDescription: 'Mobile Phone Trading' },
  { id: 'c_05', serialNo: 5, name: 'Bar Imam', phone: '0312-3344556', address: 'Mohallah Imam', totalPurchases: 64040, advancePaid: 10000, monthlyInstallment: 6210, remainingBalance: 19020, startDate: '2025-10-18', status: 'ACTIVE', itemDescription: 'Smartphones & Accessories' },
  { id: 'c_07', serialNo: 7, name: 'Farhan', phone: '0345-5566778', address: 'Civil Quarters', totalPurchases: 20000, advancePaid: 5000, monthlyInstallment: 2000, remainingBalance: 2000, startDate: '2025-10-21', status: 'ACTIVE', itemDescription: 'Redmi Smartphone' },
  { id: 'c_09', serialNo: 9, name: 'Anwar Khan', phone: '0333-8899001', address: 'College Road', totalPurchases: 52000, advancePaid: 10000, monthlyInstallment: 5500, remainingBalance: 3000, startDate: '2025-10-29', status: 'ACTIVE', itemDescription: 'Samsung Galaxy Series' },
  { id: 'c_11', serialNo: 11, name: 'Abid Karakri', phone: '0301-4455667', address: 'Karakri Town', totalPurchases: 35000, advancePaid: 10000, monthlyInstallment: 3100, remainingBalance: 11500, startDate: '2025-11-06', status: 'ACTIVE', itemDescription: 'Infinix Note Series' },
  { id: 'c_12', serialNo: 12, name: 'Fazli Amin Khubai', phone: '0313-7788990', address: 'Khubai Village', totalPurchases: 25000, advancePaid: 5000, monthlyInstallment: 3000, remainingBalance: 14000, startDate: '2025-11-22', status: 'ACTIVE', itemDescription: 'Vivo Y Series' },
  { id: 'c_14', serialNo: 14, name: 'Ibrar Bazar', phone: '0346-2233445', address: 'Main Bazar', totalPurchases: 13500, advancePaid: 6000, monthlyInstallment: 2000, remainingBalance: 4500, startDate: '2025-12-25', status: 'ACTIVE', itemDescription: 'Tecno Spark' },
  { id: 'c_15', serialNo: 15, name: 'Umar', phone: '0321-9988776', address: 'Railway Chowk', totalPurchases: 20000, advancePaid: 0, monthlyInstallment: 2500, remainingBalance: 9500, startDate: '2026-02-01', status: 'ACTIVE', itemDescription: 'Mobile via Abid' },
  { id: 'c_16', serialNo: 16, name: 'Hamza Batagram', phone: '0302-3344112', address: 'Batagram City', totalPurchases: 24300, advancePaid: 10000, monthlyInstallment: 3000, remainingBalance: 11580, startDate: '2026-02-16', status: 'ACTIVE', itemDescription: 'iPhone 17 (Installment)' },
  { id: 'c_17', serialNo: 17, name: 'Muhammad Hassan', phone: '0315-6677889', address: 'Old Sabzi Mandi', totalPurchases: 25700, advancePaid: 5000, monthlyInstallment: 3000, remainingBalance: 15000, startDate: '2026-02-26', status: 'ACTIVE', itemDescription: 'Customer Mobile' },
  { id: 'c_18', serialNo: 18, name: 'Sakur 2nd', phone: '0334-1122998', address: 'Post Office Street', totalPurchases: 70000, advancePaid: 15000, monthlyInstallment: 8000, remainingBalance: 52000, startDate: '2026-03-30', status: 'ACTIVE', itemDescription: '2nd Device Purchasing' },
  { id: 'c_19', serialNo: 19, name: 'Malang', phone: '0341-2244668', address: 'Station Colony', totalPurchases: 10000, advancePaid: 0, monthlyInstallment: 1100, remainingBalance: 10000, startDate: '2026-05-10', status: 'ACTIVE', itemDescription: 'Commercial Umbrella & Trading' },
  { id: 'c_20', serialNo: 20, name: 'Hayam', phone: '0308-5544332', address: 'Near Jamia Masjid', totalPurchases: 9000, advancePaid: 1000, monthlyInstallment: 850, remainingBalance: 7600, startDate: '2026-06-08', status: 'ACTIVE', itemDescription: 'Mobile Phone' },
  { id: 'c_21', serialNo: 21, name: 'Hassan Adezo', phone: '0314-8877665', address: 'Adezo Village', totalPurchases: 16000, advancePaid: 0, monthlyInstallment: 1850, remainingBalance: 16200, startDate: '2026-06-13', status: 'ACTIVE', itemDescription: 'Heavy Solar Battery' },
  { id: 'c_22', serialNo: 22, name: 'Afaq', phone: '0344-9988112', address: 'Sports Complex Road', totalPurchases: 17000, advancePaid: 0, monthlyInstallment: 1664, remainingBalance: 19970, startDate: '2026-06-14', status: 'ACTIVE', itemDescription: 'Badminton Rackets & Equipment' },
  { id: 'c_23', serialNo: 23, name: 'Noorwali', phone: '0322-7766554', address: 'Bannu Road', totalPurchases: 16300, advancePaid: 2000, monthlyInstallment: 1256, remainingBalance: 15070, startDate: '2026-06-21', status: 'ACTIVE', itemDescription: 'Battery Mohsin' },
  { id: 'c_24', serialNo: 24, name: 'Mohsin', phone: '0304-6655443', address: 'Model Town', totalPurchases: 16500, advancePaid: 0, monthlyInstallment: 1442, remainingBalance: 17300, startDate: '2026-06-21', status: 'ACTIVE', itemDescription: 'Fan and Solar System' },
  { id: 'c_25', serialNo: 25, name: 'Awais C/o Afzal', phone: '0316-2211334', address: 'Afzal Chowk', totalPurchases: 25000, advancePaid: 0, monthlyInstallment: 833, remainingBalance: 10000, startDate: '2026-08-08', status: 'ACTIVE', itemDescription: 'Motor Cycle' },
  { id: 'c_26', serialNo: 26, name: 'Uzair C/o Umair', phone: '0335-4433221', address: 'Umair Plaza', totalPurchases: 34000, advancePaid: 4000, monthlyInstallment: 3858, remainingBalance: 46300, startDate: '2026-08-17', status: 'ACTIVE', itemDescription: 'Mobile Device via Umair' },
  { id: 'c_27', serialNo: 27, name: 'Munsif', phone: '0347-1199887', address: 'Tehsil Chowk', totalPurchases: 38500, advancePaid: 5000, monthlyInstallment: 3742, remainingBalance: 44900, startDate: '2026-09-05', status: 'ACTIVE', itemDescription: 'Motor Cycle' },
  { id: 'c_28', serialNo: 28, name: 'Abid Zahid Brthr', phone: '0305-8877112', address: 'Circular Road', totalPurchases: 31000, advancePaid: 12000, monthlyInstallment: 3325, remainingBalance: 39900, startDate: '2026-09-05', status: 'ACTIVE', itemDescription: 'Mobile Device' },
  { id: 'c_29', serialNo: 29, name: 'Afaq Umair', phone: '0318-6655221', address: 'Green City', totalPurchases: 11000, advancePaid: 0, monthlyInstallment: 1117, remainingBalance: 13400, startDate: '2026-09-05', status: 'ACTIVE', itemDescription: 'Sports Racket' },
  { id: 'c_30', serialNo: 30, name: 'Aftab Yasir', phone: '0331-5544998', address: 'Hospital Road', totalPurchases: 89000, advancePaid: 2000, monthlyInstallment: 10192, remainingBalance: 122300, startDate: '2026-09-11', status: 'ACTIVE', itemDescription: 'Honda 125 Bike' },
  { id: 'c_31', serialNo: 31, name: 'Imtiaz Umair', phone: '0342-9988334', address: 'Commercial Market', totalPurchases: 57500, advancePaid: 10000, monthlyInstallment: 6479, remainingBalance: 77750, startDate: '2026-09-13', status: 'ACTIVE', itemDescription: 'Phone via Umair' },
  { id: 'c_32', serialNo: 32, name: 'Usama Via Abid', phone: '0307-3322115', address: 'Abid Auto Market', totalPurchases: 50000, advancePaid: 0, monthlyInstallment: 6458, remainingBalance: 77500, startDate: '2026-09-14', status: 'ACTIVE', itemDescription: 'Chinchi Auto Loader' },
  { id: 'c_33', serialNo: 33, name: 'Hayam Sarak', phone: '0311-2244559', address: 'Main Sarak', totalPurchases: 16000, advancePaid: 0, monthlyInstallment: 1867, remainingBalance: 22400, startDate: '2026-09-28', status: 'ACTIVE', itemDescription: 'Phone for Hayam' },
  { id: 'c_34', serialNo: 34, name: 'Amir Cxn', phone: '0323-6655110', address: 'Amir Connection', totalPurchases: 30500, advancePaid: 0, monthlyInstallment: 3508, remainingBalance: 42090, startDate: '2026-10-03', status: 'ACTIVE', itemDescription: 'Phone purchased on credit' },
  { id: 'c_35', serialNo: 35, name: 'Usama Via Abid (2nd)', phone: '0307-3322115', address: 'Abid Auto Market', totalPurchases: 39000, advancePaid: 5700, monthlyInstallment: 3956, remainingBalance: 47470, startDate: '2026-10-06', status: 'ACTIVE', itemDescription: 'Mobile Equipment' },
  { id: 'c_36', serialNo: 36, name: 'Amir', phone: '0348-1122774', address: 'Bazar Kalan', totalPurchases: 10000, advancePaid: 0, monthlyInstallment: 1167, remainingBalance: 14000, startDate: '2026-10-14', status: 'ACTIVE', itemDescription: 'Mobile Accessories & Phone' },
];

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'v_faiz', name: 'Faiz Wholesalers', phone: '0300-9876543', category: 'Mobile & General Goods', balancePayable: 14500, notes: 'Main device & trading goods supplier' },
  { id: 'v_dawood', name: 'Dawood Connection', phone: '0312-8765432', category: 'Electronics & Mobiles', balancePayable: 0, notes: 'Electronics wholesaling partner' },
  { id: 'v_yousaf', name: 'Yousaf Traders', phone: '0333-7654321', category: 'Trading Goods', balancePayable: 0, notes: 'Trading loan and inventory partner' },
  { id: 'v_haseen', name: 'Haseen Ullah', phone: '0345-6543210', category: 'Finance & Supply', balancePayable: 0, notes: 'Short term financing & accessories' },
  { id: 'v_touhid', name: 'Touhid Mobiles', phone: '0321-5432109', category: 'Smartphones Wholesaler', balancePayable: 0, notes: 'Supplier for credit phones' },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item_ip17',
    code: 'MOB-IP17',
    name: 'Apple iPhone 17 (256GB)',
    category: 'MOBILE',
    brand: 'Apple',
    model: 'iPhone 17',
    imeiOrSerial: '354891092837192',
    storage: '256GB',
    condition: 'BRAND_NEW',
    costPrice: 24300,
    sellingCashPrice: 28500,
    sellingInstallmentPrice: 32000,
    stockQty: 4,
    minStockLevel: 2,
    unit: 'Units'
  },
  {
    id: 'item_s25',
    code: 'MOB-S25',
    name: 'Samsung Galaxy S25 (128GB)',
    category: 'MOBILE',
    brand: 'Samsung',
    model: 'Galaxy S25',
    imeiOrSerial: '359810294817291',
    storage: '128GB',
    condition: 'BRAND_NEW',
    costPrice: 42000,
    sellingCashPrice: 48000,
    sellingInstallmentPrice: 54000,
    stockQty: 3,
    minStockLevel: 2,
    unit: 'Units'
  },
  {
    id: 'item_rn13',
    code: 'MOB-RN13',
    name: 'Xiaomi Redmi Note 13 Pro',
    category: 'MOBILE',
    brand: 'Xiaomi',
    model: 'Redmi Note 13 Pro',
    imeiOrSerial: '864910293847561',
    storage: '256GB',
    condition: 'BRAND_NEW',
    costPrice: 18500,
    sellingCashPrice: 22000,
    sellingInstallmentPrice: 26000,
    stockQty: 8,
    minStockLevel: 3,
    unit: 'Units'
  },
  {
    id: 'item_infinix',
    code: 'MOB-INF40',
    name: 'Infinix Hot 40 Pro',
    category: 'MOBILE',
    brand: 'Infinix',
    model: 'Hot 40 Pro',
    imeiOrSerial: '869201948291039',
    storage: '128GB',
    condition: 'BRAND_NEW',
    costPrice: 13000,
    sellingCashPrice: 15500,
    sellingInstallmentPrice: 18500,
    stockQty: 6,
    minStockLevel: 2,
    unit: 'Units'
  },
  {
    id: 'item_bat_mohsin',
    code: 'ELC-BAT-MOH',
    name: 'Heavy Duty Solar Battery 100Ah',
    category: 'ELECTRONICS',
    brand: 'Mohsin Power',
    model: '100Ah Deep Cycle',
    imeiOrSerial: 'BAT-2026-089',
    condition: 'BRAND_NEW',
    costPrice: 14000,
    sellingCashPrice: 16500,
    sellingInstallmentPrice: 19500,
    stockQty: 5,
    minStockLevel: 2,
    unit: 'Units'
  },
  {
    id: 'item_solar_fan',
    code: 'ELC-SOL-FAN',
    name: 'Solar DC Fan & Panel 150W Kit',
    category: 'ELECTRONICS',
    brand: 'Royal Solar',
    model: 'Kit-150W',
    condition: 'BRAND_NEW',
    costPrice: 13500,
    sellingCashPrice: 16500,
    sellingInstallmentPrice: 20000,
    stockQty: 4,
    minStockLevel: 2,
    unit: 'Sets'
  },
  {
    id: 'item_bike_honda',
    code: 'VEH-HND-125',
    name: 'Honda 125cc Motor Cycle',
    category: 'VEHICLE',
    brand: 'Honda',
    model: 'CG 125',
    imeiOrSerial: 'ENG-98234120',
    condition: 'BRAND_NEW',
    costPrice: 75000,
    sellingCashPrice: 89000,
    sellingInstallmentPrice: 122300,
    stockQty: 2,
    minStockLevel: 1,
    unit: 'Units'
  },
  {
    id: 'item_chinchi',
    code: 'VEH-CHI-LOAD',
    name: 'Chinchi Auto Loader Rickshaw',
    category: 'VEHICLE',
    brand: 'Sazgar',
    model: 'Auto Loader 200cc',
    imeiOrSerial: 'VIN-89341029',
    condition: 'BRAND_NEW',
    costPrice: 42000,
    sellingCashPrice: 50000,
    sellingInstallmentPrice: 77500,
    stockQty: 1,
    minStockLevel: 1,
    unit: 'Units'
  },
  {
    id: 'item_rackets',
    code: 'TRD-RCK-PRO',
    name: 'Badminton Pro Tournament Racket Set',
    category: 'TRADING_GOODS',
    brand: 'Yonex',
    model: 'Voltric Pro',
    condition: 'BRAND_NEW',
    costPrice: 8500,
    sellingCashPrice: 11000,
    sellingInstallmentPrice: 13400,
    stockQty: 12,
    minStockLevel: 4,
    unit: 'Sets'
  },
  {
    id: 'item_umbrella',
    code: 'TRD-UMB-COM',
    name: 'Commercial Shop Sun/Rain Umbrella (10ft)',
    category: 'TRADING_GOODS',
    brand: 'Malang Outdoor',
    model: '10ft Heavy Canvas',
    condition: 'BRAND_NEW',
    costPrice: 7000,
    sellingCashPrice: 9500,
    sellingInstallmentPrice: 11500,
    stockQty: 8,
    minStockLevel: 3,
    unit: 'Units'
  }
];

export const INITIAL_LOAN_PARTIES: LoanParty[] = [
  { id: 'lp_faiz', name: 'Faiz', type: 'LENDER', totalReceived: 120000, totalRepaid: 74110, balanceToPay: 45890 },
  { id: 'lp_dawood', name: 'Dawood Connection', type: 'LENDER', totalReceived: 82500, totalRepaid: 82500, balanceToPay: 0 },
  { id: 'lp_yousaf', name: 'Yousaf', type: 'LENDER', totalReceived: 41250, totalRepaid: 41250, balanceToPay: 0 },
  { id: 'lp_salman', name: 'Salman (Loan)', type: 'LENDER', totalReceived: 47250, totalRepaid: 47250, balanceToPay: 0 },
  { id: 'lp_ubaid', name: 'Ubaid (Loan)', type: 'LENDER', totalReceived: 44000, totalRepaid: 44000, balanceToPay: 0 },
  { id: 'lp_haseen', name: 'Haseen Ullah', type: 'LENDER', totalReceived: 20000, totalRepaid: 20000, balanceToPay: 0 },
  { id: 'lp_touhid', name: 'Touhid Phone Supply', type: 'LENDER', totalReceived: 17910, totalRepaid: 17910, balanceToPay: 0 },
];

export const INITIAL_PARTNERS: PartnerEquity[] = [
  { id: 'part_salman', name: 'Salman', sharePercentage: 33.333, initialCapital: 91686.67, currentInvestment: 91686.67, drawings: 15000, dividendsPaid: 25000, netEquity: 195686.67 },
  { id: 'part_ubaid', name: 'Ubaid', sharePercentage: 33.333, initialCapital: 91686.67, currentInvestment: 291686.67, drawings: 18000, dividendsPaid: 25000, netEquity: 395686.67 },
  { id: 'part_hasnain', name: 'Hasnain', sharePercentage: 33.333, initialCapital: 91686.67, currentInvestment: 91686.67, drawings: 12000, dividendsPaid: 25000, netEquity: 195686.67 },
];

export const INITIAL_RECENT_PAYMENTS = [
  { id: 'pmt_01', receiptNo: 'RCP-1049', customerId: 'c_18', customerName: 'Sakur 2nd', date: '2026-10-01', amount: 8000, paymentMethod: 'CASH' as const, discountAllowed: 0, collectedBy: 'Salman', remainingBalanceAfter: 52000 },
  { id: 'pmt_02', receiptNo: 'RCP-1050', customerId: 'c_26', customerName: 'Uzair C/o Umair', date: '2026-10-01', amount: 3858, paymentMethod: 'CASH' as const, discountAllowed: 0, collectedBy: 'Salman', remainingBalanceAfter: 46300 },
  { id: 'pmt_03', receiptNo: 'RCP-1051', customerId: 'c_27', customerName: 'Munsif', date: '2026-10-02', amount: 3742, paymentMethod: 'CASH' as const, discountAllowed: 0, collectedBy: 'Ubaid', remainingBalanceAfter: 44900 },
  { id: 'pmt_04', receiptNo: 'RCP-1052', customerId: 'c_30', customerName: 'Aftab Yasir', date: '2026-10-03', amount: 10192, paymentMethod: 'ONLINE_TRANSFER' as const, discountAllowed: 0, collectedBy: 'Hasnain', remainingBalanceAfter: 122300 },
  { id: 'pmt_05', receiptNo: 'RCP-1053', customerId: 'c_31', customerName: 'Imtiaz Umair', date: '2026-10-04', amount: 6479, paymentMethod: 'CASH' as const, discountAllowed: 0, collectedBy: 'Salman', remainingBalanceAfter: 77750 },
  { id: 'pmt_06', receiptNo: 'RCP-1054', customerId: 'c_32', customerName: 'Usama Via Abid', date: '2026-10-05', amount: 6458, paymentMethod: 'CASH' as const, discountAllowed: 0, collectedBy: 'Ubaid', remainingBalanceAfter: 77500 },
  { id: 'pmt_07', receiptNo: 'RCP-1055', customerId: 'c_35', customerName: 'Usama Via Abid (2nd)', date: '2026-10-06', amount: 3956, paymentMethod: 'EASYPAISA_JAZZCASH' as const, discountAllowed: 0, collectedBy: 'Salman', remainingBalanceAfter: 47470 },
  { id: 'pmt_08', receiptNo: 'RCP-1056', customerId: 'c_36', customerName: 'Amir', date: '2026-10-14', amount: 1167, paymentMethod: 'CASH' as const, discountAllowed: 0, collectedBy: 'Salman', remainingBalanceAfter: 14000 },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  { id: 'exp_01', expenseNumber: 'EXP-101', date: '2026-10-08', category: 'MOBILE_PACKAGES', amount: 2400, paidFromAccountId: 'acc_1010', paidTo: 'Zong Franchise', description: 'Mobile package to Salman for 3 months communication', loggedBy: 'Salman', status: 'APPROVED' },
  { id: 'exp_02', expenseNumber: 'EXP-102', date: '2026-10-03', category: 'COMMISSION', amount: 1850, paidFromAccountId: 'acc_1010', paidTo: 'Umair', description: 'Commission paid to Umair in Imtiaz khata sales referral', loggedBy: 'Salman', status: 'APPROVED' },
  { id: 'exp_03', expenseNumber: 'EXP-103', date: '2026-10-02', category: 'DISCOUNT_ALLOWED', amount: 1200, paidFromAccountId: 'acc_1010', paidTo: 'Abdullah DanishKhul', description: 'Discount allowed to Abdullah DanishKhul upon installment settlement', loggedBy: 'Ubaid', status: 'APPROVED' },
  { id: 'exp_04', expenseNumber: 'EXP-104', date: '2026-09-14', category: 'COMMISSION', amount: 2000, paidFromAccountId: 'acc_1010', paidTo: 'Umair', description: 'Commission paid to Umair for customer device sourcing', loggedBy: 'Hasnain', status: 'APPROVED' },
  { id: 'exp_05', expenseNumber: 'EXP-105', date: '2026-08-10', category: 'COMMISSION', amount: 1500, paidFromAccountId: 'acc_1010', paidTo: 'Faiz', description: 'Commission paid to Faiz for wholesale referrals', loggedBy: 'Salman', status: 'APPROVED' },
  { id: 'exp_06', expenseNumber: 'EXP-106', date: '2026-07-18', category: 'DISCOUNT_ALLOWED', amount: 2500, paidFromAccountId: 'acc_1010', paidTo: 'Haseeb', description: 'Discount paid to Haseeb on full early settlement', loggedBy: 'Ubaid', status: 'APPROVED' },
];

export const APP_USERS: AppUser[] = [
  { id: 'user_salman', name: 'Salman (Partner / Admin)', email: 'salman@ushtraders.com', role: 'ADMIN', avatar: 'S' },
  { id: 'user_ubaid', name: 'Ubaid (Partner / Accountant)', email: 'ubaid@ushtraders.com', role: 'ACCOUNTANT', avatar: 'U' },
  { id: 'user_hasnain', name: 'Hasnain (Partner / Sales Lead)', email: 'hasnain@ushtraders.com', role: 'ADMIN', avatar: 'H' },
  { id: 'user_agent', name: 'Tariq (Field Collection Agent)', email: 'tariq@ushtraders.com', role: 'SALES_AGENT', avatar: 'T' },
  { id: 'user_auditor', name: 'Rashid (External Auditor)', email: 'auditor@firm.com', role: 'AUDITOR', avatar: 'R' },
];
