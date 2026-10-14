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
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryStock, summaryMetrics } = useAccounting();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Stock edit state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

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
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.imeiOrSerial && item.imeiOrSerial.includes(searchTerm));
    return matchCat && matchSearch;
  });

  const handleStockUpdate = (itemId: string) => {
    updateInventoryStock(itemId, editQty, 'Manual count adjustment');
    setEditingItemId(null);
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

  const totalUnits = inventory.reduce((sum, i) => sum + i.stockQty, 0);
  const lowStockCount = inventory.filter(i => i.stockQty <= i.minStockLevel).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <span>Inventory & Device Stock Management</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200">
                Single Truth
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track mobile phones (IMEI serials, storage, condition), solar batteries, bikes, and wholesale trading items
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item / Device</span>
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Inventory Value</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              Rs {summaryMetrics.totalInventoryValuation.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Units in Stock</div>
            <div className="text-lg font-bold font-mono text-indigo-700 tabular-nums mt-0.5">
              {totalUnits} Units
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Product SKUs</div>
            <div className="text-lg font-bold font-mono text-slate-800 tabular-nums mt-0.5">
              {inventory.length} Items
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Low Stock Alerts</div>
            <div className="text-lg font-bold font-mono text-amber-700 tabular-nums mt-0.5 flex items-center gap-1.5">
              <span>{lowStockCount} Items</span>
              {lowStockCount > 0 && <AlertTriangle className="w-4 h-4 text-amber-600" />}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Table Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by model, brand, SKU or IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  categoryFilter === c.id
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory High-Density Spreadsheet Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs qb-grid">
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
                <th className="text-right">Asset Valuation</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isLow = item.stockQty <= item.minStockLevel;
                const isEditing = editingItemId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="font-mono text-slate-500 font-semibold text-[11px]">
                      {item.code}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.brand} {item.model} {item.storage ? `· ${item.storage}` : ''}
                      </div>
                    </td>
                    <td>
                      <span className="text-[11px] font-medium text-slate-700">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="font-mono text-slate-600 text-[11px]">
                      {item.imeiOrSerial || '—'}
                    </td>
                    <td className="text-right font-mono text-slate-600 tabular-nums">
                      Rs {item.costPrice.toLocaleString()}
                    </td>
                    <td className="text-right font-mono font-semibold text-slate-800 tabular-nums">
                      Rs {item.sellingCashPrice.toLocaleString()}
                    </td>
                    <td className="text-right font-mono font-bold text-indigo-700 tabular-nums">
                      Rs {item.sellingInstallmentPrice.toLocaleString()}
                    </td>
                    <td className="text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(Number(e.target.value))}
                            className="w-14 px-1 py-0.5 text-xs font-mono font-bold border border-indigo-400 rounded text-center"
                            autoFocus
                          />
                          <button
                            onClick={() => handleStockUpdate(item.id)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditQty(item.stockQty);
                          }}
                          className={`inline-flex items-center gap-1 font-mono font-bold cursor-pointer px-2 py-0.5 rounded text-xs transition-colors ${
                            isLow
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                          title="Click to adjust stock"
                        >
                          <span>{item.stockQty} {item.unit}</span>
                          <Edit3 className="w-3 h-3 text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-900 tabular-nums">
                      Rs {(item.stockQty * item.costPrice).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredItems.length} inventory records</span>
          <span className="font-semibold text-slate-700">
            Total Inventory Value: Rs {summaryMetrics.totalInventoryValuation.toLocaleString()}
          </span>
        </div>

      </div>

      {/* Modal: Add New Inventory Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <span>Add Item / Device to Inventory</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Item / Device Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apple iPhone 17 (256GB)"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="MOBILE">Mobile Phone</option>
                    <option value="ELECTRONICS">Electronics / Solar / Battery</option>
                    <option value="VEHICLE">Vehicle / Bike / Rickshaw</option>
                    <option value="TRADING_GOODS">General Trading Goods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apple / Samsung"
                    value={newItem.brand}
                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Model & Storage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 17 Pro 256GB"
                    value={newItem.model}
                    onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    IMEI / Serial Number
                  </label>
                  <input
                    type="text"
                    placeholder="15-digit IMEI code"
                    value={newItem.imeiOrSerial}
                    onChange={(e) => setNewItem({ ...newItem, imeiOrSerial: e.target.value })}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Cost Price (Rs) *
                  </label>
                  <input
                    type="number"
                    value={newItem.costPrice || ''}
                    onChange={(e) => setNewItem({ ...newItem, costPrice: Number(e.target.value) })}
                    min="1"
                    className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Cash Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={newItem.sellingCashPrice || ''}
                    onChange={(e) => setNewItem({ ...newItem, sellingCashPrice: Number(e.target.value) })}
                    min="1"
                    className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Installment Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={newItem.sellingInstallmentPrice || ''}
                    onChange={(e) => setNewItem({ ...newItem, sellingInstallmentPrice: Number(e.target.value) })}
                    min="1"
                    className="w-full text-xs font-mono font-bold text-indigo-700 px-2.5 py-1.5 bg-indigo-50/60 border border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Initial Stock Qty
                  </label>
                  <input
                    type="number"
                    value={newItem.stockQty || ''}
                    onChange={(e) => setNewItem({ ...newItem, stockQty: Number(e.target.value) })}
                    min="0"
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Low Stock Alert Level
                  </label>
                  <input
                    type="number"
                    value={newItem.minStockLevel || ''}
                    onChange={(e) => setNewItem({ ...newItem, minStockLevel: Number(e.target.value) })}
                    min="1"
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save to Inventory
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
