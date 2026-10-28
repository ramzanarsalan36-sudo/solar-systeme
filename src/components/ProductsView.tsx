'use client';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Product, ProductCategory, UserRole } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import {
  Boxes,
  Search,
  Tag,
  ShieldAlert,
  History,
  CheckCircle,
  AlertTriangle,
  LayoutGrid,
  Table as TableIcon,
  Sun,
  Zap,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Cpu,
} from 'lucide-react';

interface ProductsViewProps {
  role: UserRole;
  onOpenPriceModal: (product: Product) => void;
}

export function ProductsView({ role, onOpenPriceModal }: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'price_history'>('catalog');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const products = crmStorage.getProducts();
  const priceHistory = crmStorage.getPriceHistory();

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchCat = true;
    if (categoryFilter === 'panel') matchCat = p.category === 'panel';
    else if (categoryFilter === 'inverter') matchCat = p.category === 'inverter';
    else if (categoryFilter === 'structure') matchCat = p.category === 'structure';
    else if (categoryFilter === 'bos') matchCat = p.category === 'accessory' || p.category === 'cable';
    else if (categoryFilter !== 'all') matchCat = p.category === categoryFilter;

    return matchSearch && matchCat;
  });

  const lowStockProducts = products.filter((p) => p.stock <= p.minStockAlert || p.stock < 10);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-amber-400 flex items-center justify-center shadow-sm">
              <Boxes className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Product &amp; Pricing Master Catalog
              </h1>
              <p className="text-xs text-slate-500">
                Official Tier-1 Equipment Master &bull; Central Rates &bull; Live Warehouse Stock Ledgers
              </p>
            </div>
          </div>
        </div>

        {/* Central Pricing Notice Badge */}
        <div className="flex items-center gap-2 bg-amber-50/90 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs text-amber-900 shadow-2xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium">
            Central Pricing: Updating rates automatically recalculates live quote models.
          </span>
        </div>
      </div>

      {/* Low Stock Alert Banner (if any) */}
      {lowStockProducts.length > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="text-slate-800">
              <strong className="text-rose-700 font-bold">{lowStockProducts.length} Product(s)</strong> have dropped below minimum threshold (&lt;10 units in warehouse). Re-ordering recommended.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg font-bold text-[11px] shrink-0">
            Threshold: 10 Units
          </span>
        </div>
      )}

      {/* Category Tabs & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Categorized Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'All Products', count: products.length },
            { id: 'panel', label: 'Solar Panels', count: products.filter((p) => p.category === 'panel').length },
            { id: 'inverter', label: 'Inverters', count: products.filter((p) => p.category === 'inverter').length },
            { id: 'structure', label: 'Mounting Structures', count: products.filter((p) => p.category === 'structure').length },
            { id: 'bos', label: 'BOS / Accessories', count: products.filter((p) => p.category === 'accessory' || p.category === 'cable').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setCategoryFilter(tab.id);
                setActiveTab('catalog');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === tab.id && activeTab === 'catalog'
                  ? 'bg-white text-[#0A1128] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                categoryFilter === tab.id && activeTab === 'catalog' ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}

          <button
            onClick={() => setActiveTab('price_history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'price_history'
                ? 'bg-[#0A1128] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Price Audit History</span>
          </button>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search model, brand, wattage..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white shadow-2xs"
            />
          </div>

          {activeTab === 'catalog' && (
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table List View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'catalog' ? (
        viewMode === 'grid' ? (
          /* PRODUCT CARDS GRID (With HD Photos, Brand, Wattage, Price, Stock Status) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((p) => {
              const isLow = p.stock <= p.minStockAlert || p.stock < 10;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                >
                  {/* Equipment HD Photo */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={
                        p.imageUrl ||
                        'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Category Badge Top Left */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                        {p.category}
                      </span>
                    </div>

                    {/* Stock Status Badge Top Right */}
                    <div className="absolute top-2.5 right-2.5">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Low Stock ({p.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                          <CheckCircle className="w-3 h-3" />
                          In Stock ({p.stock})
                        </span>
                      )}
                    </div>

                    {/* Capacity & Brand Pill Bottom Overlay */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                      <span className="font-bold text-sm drop-shadow-md">
                        {p.capacity || p.brand}
                      </span>
                      <span className="text-[11px] font-medium bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                        {p.warrantyYears} Yr Warranty
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1">
                        <span>SKU: {p.sku}</span>
                        <span className="font-semibold text-amber-700 font-sans">{p.brand}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {p.spec}
                      </p>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Central Base Rate</span>
                        <span className="text-base font-extrabold text-slate-900 tracking-tight">
                          {formatIndianCurrency(p.price)}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">/ {p.uom}</span>
                      </div>

                      {role === 'admin' ? (
                        <button
                          onClick={() => onOpenPriceModal(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl transition-colors shadow-2xs"
                        >
                          <Tag className="w-3 h-3 text-amber-600" />
                          <span>Change Price</span>
                        </button>
                      ) : (
                        <span className="text-[11px] px-2 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
                          Verified Price
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* COMPACT TABLE VIEW */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="p-3.5">Equipment</th>
                    <th className="p-3.5">SKU &amp; Brand</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Central Rate (₹)</th>
                    <th className="p-3.5 text-center">Live Stock</th>
                    <th className="p-3.5 text-center">Warranty</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isLow = p.stock <= p.minStockAlert || p.stock < 10;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 align-middle">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.imageUrl || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=150&q=80'}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{p.name}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{p.spec}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 align-middle space-y-0.5">
                          <span className="font-mono font-bold text-slate-800">{p.sku}</span>
                          <span className="block text-[11px] text-amber-800 font-medium">{p.brand}</span>
                        </td>
                        <td className="p-3.5 align-middle">
                          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-3.5 align-middle text-right">
                          <span className="text-sm font-bold text-slate-900">
                            {formatIndianCurrency(p.price)}
                          </span>
                          <span className="block text-[10px] text-slate-400">per {p.uom}</span>
                        </td>
                        <td className="p-3.5 align-middle text-center">
                          <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            isLow ? 'bg-rose-100 text-rose-800 font-black' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.stock} {p.uom}
                          </span>
                        </td>
                        <td className="p-3.5 align-middle text-center text-slate-600 font-medium">
                          {p.warrantyYears} Years
                        </td>
                        <td className="p-3.5 align-middle text-right">
                          {role === 'admin' ? (
                            <button
                              onClick={() => onOpenPriceModal(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors"
                            >
                              <Tag className="w-3 h-3 text-amber-600" />
                              <span>Update Rate</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Central Rate</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* AUDITED PRICE REVISION HISTORY */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-amber-50/80 border-b border-amber-200 text-xs text-amber-950 flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Price Immutability Enforcement:</strong> Whenever catalog rates change, existing quotations retain their historical line item pricing. All modifications are logged in this audit ledger.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3.5">Date &amp; Time</th>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5 text-right">Old Rate</th>
                  <th className="p-3.5 text-right">New Rate</th>
                  <th className="p-3.5 text-center">Change</th>
                  <th className="p-3.5">Revised By</th>
                  <th className="p-3.5">Mandatory Audit Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {priceHistory.map((h) => {
                  const delta = h.newPrice - h.oldPrice;
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {new Date(h.changedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{h.productName}</td>
                      <td className="p-3.5 text-right text-slate-500 font-mono">
                        {formatIndianCurrency(h.oldPrice)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900 font-mono">
                        {formatIndianCurrency(h.newPrice)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          delta < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {delta < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          {delta < 0 ? `-${formatIndianCurrency(Math.abs(delta))}` : `+${formatIndianCurrency(delta)}`}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">{h.changedByName}</td>
                      <td className="p-3.5 text-slate-600 text-[11px] leading-relaxed">{h.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
