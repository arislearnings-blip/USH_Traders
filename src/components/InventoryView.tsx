import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { InventoryItem } from '../types/accounting';
import {
  Smartphone,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Package,
  Layers,
  Edit3,
  Check,
  X,
  ArrowUpDown,
  Tag,
  Trash2,
  Printer,
  Eye,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateInventoryStock,
    summaryMetrics,
  } = useAccounting();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Quick inline stock edit state
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  // Full item edit modal state
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Viewing item modal state
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);

  // New item form
  const [newItem, setNewItem] = useState({
    code: '',
    name: '',
    category: 'MOBILE' as InventoryItem['category'],
    brand: '',
    model: '',
    imeiOrSerial: '',
    storage: '128GB',
    condition: 'BRAND_NEW' as InventoryItem['condition'],
    costPrice: 0,
    sellingCashPrice: 0,
    sellingInstallmentPrice: 0,
    stockQty: 1,
    minStockLevel: 2,
    unit: 'Units',
  });

  const categories = [
    { id: 'ALL', label: 'All Items' },
    { id: 'MOBILE', label: 'Mobile Phones' },
    { id: 'ELECTRONICS', label: 'Solar & Batteries' },
    { id: 'VEHICLE', label: 'Vehicles & Bikes' },
    { id: 'TRADING_GOODS', label: 'Trading Items' },
  ];

  const filteredItems = inventory.filter(item => {
    const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.imeiOrSerial && item.imeiOrSerial.includes(searchTerm));
    return matchCat && matchSearch;
  });

  const handleStockUpdate = (itemId: string) => {
    updateInventoryStock(itemId, editQty, 'Manual count adjustment');
    setEditingStockId(null);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.costPrice <= 0) return;

    addInventoryItem({
      ...newItem,
      code: newItem.code || `ITEM-${Date.now().toString().slice(-4)}`,
    });

    setIsAddModalOpen(false);
    // Reset
    setNewItem({
      code: '',
      name: '',
      category: 'MOBILE',
      brand: '',
      model: '',
      imeiOrSerial: '',
      storage: '128GB',
      condition: 'BRAND_NEW',
      costPrice: 0,
      sellingCashPrice: 0,
      sellingInstallmentPrice: 0,
      stockQty: 1,
      minStockLevel: 2,
      unit: 'Units',
    });
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateInventoryItem(editingItem.id, {
      name: editingItem.name,
      brand: editingItem.brand,
      model: editingItem.model,
      category: editingItem.category,
      storage: editingItem.storage,
      condition: editingItem.condition,
      imeiOrSerial: editingItem.imeiOrSerial,
      costPrice: Number(editingItem.costPrice),
      sellingCashPrice: Number(editingItem.sellingCashPrice),
      sellingInstallmentPrice: Number(editingItem.sellingInstallmentPrice),
      stockQty: Number(editingItem.stockQty),
      minStockLevel: Number(editingItem.minStockLevel),
    });

    setEditingItem(null);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove item "${name}" from stock inventory?`)) {
      deleteInventoryItem(id);
      if (viewingItem?.id === id) setViewingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Valuation Summary */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Inventory & Device Stock Management</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-md border border-indigo-200 dark:border-indigo-800">
                USH TRADERS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time asset valuation, IMEI/serial tracking, cash vs installment profit margins, and instant stock adjustments
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Stock List</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Stock Item</span>
            </button>
          </div>
        </div>

        {/* Valuation Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Stock Valuation</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
              Rs {summaryMetrics.totalInventoryValuation.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Units in Stock</div>
            <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
              {inventory.reduce((sum, i) => sum + i.stockQty, 0)} Units
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Stock Items Catalog</div>
            <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
              {inventory.length} SKUs
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Low Stock Alerts</div>
            <div className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums mt-0.5">
              {inventory.filter(i => i.stockQty <= i.minStockLevel).length} Items
            </div>
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by brand, model, code, or IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs sheet-table ledger-table">
            <thead>
              <tr>
                <th className="w-24">Item Code</th>
                <th>Item & Brand / Model</th>
                <th>Category</th>
                <th>IMEI / Serial</th>
                <th className="text-right">Cost Price</th>
                <th className="text-right">Cash Price</th>
                <th className="text-right">Installment Price</th>
                <th className="text-center w-28">Stock Qty</th>
                <th className="text-right">Valuation</th>
                <th className="text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
                    No stock inventory found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.stockQty <= item.minStockLevel;
                  const isEditingStock = editingStockId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="font-mono text-slate-500 dark:text-slate-400 font-bold text-[11px]">
                        {item.code}
                      </td>
                      <td>
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.brand} {item.model} {item.storage ? `· ${item.storage}` : ''}
                        </div>
                      </td>
                      <td>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {item.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                        {item.imeiOrSerial || '—'}
                      </td>
                      <td className="text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                        Rs {item.costPrice.toLocaleString()}
                      </td>
                      <td className="text-right font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                        Rs {item.sellingCashPrice.toLocaleString()}
                      </td>
                      <td className="text-right font-mono font-bold text-indigo-700 dark:text-indigo-400 tabular-nums">
                        Rs {item.sellingInstallmentPrice.toLocaleString()}
                      </td>
                      <td className="text-center">
                        {isEditingStock ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={editQty}
                              onChange={(e) => setEditQty(Number(e.target.value))}
                              className="w-14 px-1 py-0.5 text-xs font-mono font-bold border border-indigo-400 rounded text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleStockUpdate(item.id)}
                              className="p-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingStockId(item.id);
                              setEditQty(item.stockQty);
                            }}
                            className={`inline-flex items-center gap-1 font-mono font-bold cursor-pointer px-2 py-0.5 rounded text-xs transition-colors ${
                              isLow
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                            title="Click to quickly adjust stock count"
                          >
                            <span>{item.stockQty} {item.unit}</span>
                            <Edit3 className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                      </td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        Rs {(item.stockQty * item.costPrice).toLocaleString()}
                      </td>
                      <td className="text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          
                          {/* View details */}
                          <button
                            onClick={() => setViewingItem(item)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded cursor-pointer"
                            title="View Stock Item Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Full Edit */}
                          <button
                            onClick={() => setEditingItem({ ...item })}
                            className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded cursor-pointer"
                            title="Edit Item Particulars"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                            title="Delete Stock Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {filteredItems.length} inventory records</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Total Inventory Value: Rs {summaryMetrics.totalInventoryValuation.toLocaleString()}
          </span>
        </div>

      </div>

      {/* ================= MODAL: ADD NEW ITEM ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto my-auto transition-colors">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Add Item / Device to Inventory</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item / Device Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apple iPhone 17 (256GB)"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    aria-label="Category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="MOBILE">Mobile Phone</option>
                    <option value="ELECTRONICS">Electronics / Solar / Battery</option>
                    <option value="VEHICLE">Vehicle / Bike / Rickshaw</option>
                    <option value="TRADING_GOODS">Trading Items / General Goods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Samsung, Honda"
                    value={newItem.brand}
                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Model / Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 17 or CG-125"
                    value={newItem.model}
                    onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    IMEI / Serial Number
                  </label>
                  <input
                    type="text"
                    placeholder="15-digit IMEI or Frame #"
                    value={newItem.imeiOrSerial}
                    onChange={(e) => setNewItem({ ...newItem, imeiOrSerial: e.target.value })}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cost Price (Rs) *
                  </label>
                  <input
                    type="number"
                    value={newItem.costPrice || ''}
                    onChange={(e) => setNewItem({ ...newItem, costPrice: Number(e.target.value) })}
                    min="1"
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cash Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={newItem.sellingCashPrice || ''}
                    onChange={(e) => setNewItem({ ...newItem, sellingCashPrice: Number(e.target.value) })}
                    min="1"
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Installment Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={newItem.sellingInstallmentPrice || ''}
                    onChange={(e) => setNewItem({ ...newItem, sellingInstallmentPrice: Number(e.target.value) })}
                    min="1"
                    className="w-full text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    value={newItem.stockQty}
                    onChange={(e) => setNewItem({ ...newItem, stockQty: Number(e.target.value) })}
                    min="0"
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min Stock Alert
                  </label>
                  <input
                    type="number"
                    value={newItem.minStockLevel}
                    onChange={(e) => setNewItem({ ...newItem, minStockLevel: Number(e.target.value) })}
                    min="1"
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Add Item to Inventory
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT STOCK ITEM ================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-lg w-full space-y-4 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Edit Item: {editingItem.name}</span>
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-3 text-xs">
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editingItem.brand}
                    onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    IMEI / Serial Number
                  </label>
                  <input
                    type="text"
                    value={editingItem.imeiOrSerial || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, imeiOrSerial: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Cost Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingItem.costPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, costPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Cash Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingItem.sellingCashPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, sellingCashPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Installment Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingItem.sellingInstallmentPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, sellingInstallmentPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono font-bold text-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={editingItem.stockQty}
                    onChange={(e) => setEditingItem({ ...editingItem, stockQty: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Min Stock Alert
                  </label>
                  <input
                    type="number"
                    value={editingItem.minStockLevel}
                    onChange={(e) => setEditingItem({ ...editingItem, minStockLevel: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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

      {/* ================= MODAL: VIEW ITEM DETAILS CARD ================= */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {viewingItem.name}
                </h3>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  SKU: {viewingItem.code}
                </span>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Brand & Model:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingItem.brand} {viewingItem.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IMEI / Serial:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{viewingItem.imeiOrSerial || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Condition:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingItem.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Stock:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{viewingItem.stockQty} {viewingItem.unit}</span>
                </div>
              </div>

              {/* Price & Margins */}
              <div className="border border-slate-200 dark:border-slate-700 p-3 rounded-xl space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Wholesale Cost:</span>
                  <span className="font-bold">Rs {viewingItem.costPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-800 dark:text-slate-200">
                  <span>Cash Sale Price:</span>
                  <span className="font-bold">Rs {viewingItem.sellingCashPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-bold">
                  <span>Installment Price:</span>
                  <span>Rs {viewingItem.sellingInstallmentPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                  <span>Installment Profit Margin:</span>
                  <span>+ Rs {(viewingItem.sellingInstallmentPrice - viewingItem.costPrice).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setEditingItem({ ...viewingItem });
                  setViewingItem(null);
                }}
                className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Edit Item
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
