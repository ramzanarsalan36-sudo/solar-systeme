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
  Battery,
  Layers,
  Cable,
} from 'lucide-react';

interface ProductsViewProps {
  role: UserRole;
  onOpenPriceModal: (product: Product) => void;
}

function ProductCategoryIcon({ category }: { category: string }) {
  switch (category) {
    case 'panel':
      return <Sun className="w-6 h-6 text-blue-500" />;
    case 'inverter':
      return <Zap className="w-6 h-6 text-amber-500" />;
    case 'structure':
      return <Layers className="w-6 h-6 text-slate-500" />;
    default:
      return <Cable className="w-6 h-6 text-purple-500" />;
  }
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
    <div className="space-y-4 sm:space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-medium">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Product &amp; Pricing Master
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Tier-1 solar equipment master &bull; Central pricing &bull; Warehouse stock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs text-amber-900">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-normal text-[11px]">
            Updating central rates syncs live quote calculations automatically.
          </span>
        </div>
      </div>

      {/* Low Stock Alert Banner (if any) */}
      {lowStockProducts.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-slate-700">
              <strong className="font-semibold text-amber-900">{lowStockProducts.length} Product(s)</strong> have dropped below minimum threshold (&lt;10 units in warehouse).
            </p>
          </div>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium text-[11px] shrink-0">
            Threshold: 10 Units
          </span>
        </div>
      )}

      {/* Category Tabs & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg overflow-x-auto border border-slate-200/80">
          {[
            { id: 'all', label: 'All Products', count: products.length },
            { id: 'panel', label: 'Panels', count: products.filter((p) => p.category === 'panel').length },
            { id: 'inverter', label: 'Inverters', count: products.filter((p) => p.category === 'inverter').length },
            { id: 'structure', label: 'Structure', count: products.filter((p) => p.category === 'structure').length },
            { id: 'bos', label: 'BOS & Cables', count: products.filter((p) => p.category === 'accessory' || p.category === 'cable').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setCategoryFilter(tab.id);
                setActiveTab('catalog');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === tab.id && activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
              <span className="ml-1 text-[10px] text-slate-400">({tab.count})</span>
            </button>
          ))}

          <button
            onClick={() => setActiveTab('price_history')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'price_history'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3 h-3 text-amber-500" />
            <span>Price Audit History</span>
          </button>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search model, brand, spec..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:outline-hidden text-slate-800 placeholder:text-slate-400 transition-colors"
            />
          </div>

          {activeTab === 'catalog' && (
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'catalog' ? (
        viewMode === 'grid' ? (
          /* PRODUCT CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const isLow = p.stock <= p.minStockAlert || p.stock < 10;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Header Banner with Clean Icon */}
                    <div className="h-28 bg-slate-50 border-b border-slate-100 p-3 flex flex-col justify-between relative">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-white border border-slate-200 text-slate-700">
                          {p.category}
                        </span>
                        {isLow ? (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            In Stock ({p.stock})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center">
                          <ProductCategoryIcon category={p.category} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {p.capacity || p.brand}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{p.sku}</span>
                        <span className="font-medium text-amber-800 font-sans">{p.brand}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-normal">
                        {p.spec}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="p-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">Central Base Rate</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatIndianCurrency(p.price)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-0.5">/ {p.uom}</span>
                    </div>

                    {role === 'admin' ? (
                      <button
                        onClick={() => onOpenPriceModal(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Tag className="w-3 h-3 text-amber-600" />
                        <span>Edit Price</span>
                      </button>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 bg-white text-slate-600 rounded border border-slate-200 font-normal">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* COMPACT TABLE VIEW */
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                    <th className="p-3">Equipment</th>
                    <th className="p-3">SKU &amp; Brand</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Central Rate (₹)</th>
                    <th className="p-3 text-center">Live Stock</th>
                    <th className="p-3 text-center">Warranty</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isLow = p.stock <= p.minStockAlert || p.stock < 10;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3">
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">{p.name}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{p.spec}</p>
                          </div>
                        </td>
                        <td className="p-3 space-y-0.5">
                          <span className="font-mono font-medium text-slate-700">{p.sku}</span>
                          <span className="block text-[11px] text-amber-800 font-normal">{p.brand}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm font-semibold text-slate-900">
                            {formatIndianCurrency(p.price)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">/ {p.uom}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-semibold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                            {p.stock} {p.uom}
                          </span>
                          {isLow && (
                            <span className="block text-[9px] font-medium text-rose-600 uppercase">
                              Low Stock
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center text-slate-500 font-normal">
                          {p.warrantyYears} Years
                        </td>
                        <td className="p-3 text-right">
                          {role === 'admin' ? (
                            <button
                              onClick={() => onOpenPriceModal(p)}
                              className="px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Update Rate
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">View Only</span>
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
        /* PRICE AUDIT HISTORY VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                Historical Price Change Ledger
              </h3>
              <p className="text-[11px] text-slate-500">
                Audited price updates made by authorized administrators
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-medium text-xs">
              {priceHistory.length} Audited Price Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3 text-right">Old Base Price</th>
                  <th className="p-3 text-right">New Base Price</th>
                  <th className="p-3 text-center">Net Price Delta</th>
                  <th className="p-3">Authorizing Officer</th>
                  <th className="p-3">Change Justification / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {priceHistory.map((ph) => {
                  const delta = ph.newPrice - ph.oldPrice;
                  const deltaPercent = Math.round((delta / (ph.oldPrice || 1)) * 100);

                  return (
                    <tr key={ph.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono text-slate-500">
                        {new Date(ph.changedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3 font-medium text-slate-900">{ph.productName}</td>
                      <td className="p-3 text-right text-slate-500 line-through">
                        {formatIndianCurrency(ph.oldPrice)}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-900">
                        {formatIndianCurrency(ph.newPrice)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[10px] ${
                            delta > 0
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {delta > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{ph.changedByName}</td>
                      <td className="p-3 text-slate-600">{ph.reason}</td>
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