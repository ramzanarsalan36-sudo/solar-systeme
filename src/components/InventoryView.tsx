'use client';

import { soundManager } from '@/lib/sound';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Product, StockMovement, UserRole } from '@/types/crm';
import {
  Warehouse,
  Search,
  PlusCircle,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Sun,
  Zap,
  Battery,
  Layers,
  Cable,
} from 'lucide-react';

interface InventoryViewProps {
  role: UserRole;
  onOpenStockModal: (product?: Product) => void;
}

function ProductCategoryBadge({ category }: { category: string }) {
  switch (category) {
    case 'panel':
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
          <Sun className="w-4 h-4" />
        </div>
      );
    case 'inverter':
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4" />
        </div>
      );
    case 'structure':
      return (
        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-[#E1EBF5] text-slate-600 flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200/80 text-purple-600 flex items-center justify-center shrink-0">
          <Cable className="w-4 h-4" />
        </div>
      );
  }
}

export function InventoryView({ role, onOpenStockModal }: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'balance' | 'movements'>('balance');

  const products = crmStorage.getProducts();
  const movements = crmStorage.getStockMovements();

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMovements = movements.filter(
    (m) =>
      m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.movementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.referenceId && m.referenceId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E1EBF5]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F8FE] border border-[#BCE8FC] text-[#00BAF2] flex items-center justify-center font-medium">
            <Warehouse className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#002E6E] tracking-tight">
              Warehouse &amp; Stock
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Real-time hardware ledger &bull; Low-stock alerts &bull; Goods movement audit
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenStockModal()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#00BAF2] hover:bg-[#00A6DA] text-white shadow-xs transition-colors shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Stock In / Out</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-lg border border-[#E1EBF5]/80">
          <button
            onClick={() => setActiveTab('balance')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'balance'
                ? 'bg-white text-[#002E6E] shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-[#002E6E]'
            }`}
          >
            Live Stock Balances
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'movements'
                ? 'bg-white text-[#002E6E] shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-[#002E6E]'
            }`}
          >
            Movement History ({movements.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKU, brand, model..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[#E1EBF5] bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:outline-hidden text-slate-800 placeholder:text-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Content depending on active tab */}
      {activeTab === 'balance' ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-xl border border-[#E1EBF5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E1EBF5] text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product Name &amp; Spec</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Available Stock</th>
                    <th className="p-3 text-center">Threshold</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isLow =
                      p.category === 'panel' || p.category === 'inverter'
                        ? p.stock < 10
                        : p.stock <= p.minStockAlert;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-mono font-medium text-slate-700">{p.sku}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <ProductCategoryBadge category={p.category} />
                            <div>
                              <p className="font-semibold text-[#002E6E] text-xs">{p.name}</p>
                              <p className="text-[11px] text-slate-500 leading-normal">
                                {p.brand} &bull; {p.spec}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-sm font-semibold ${isLow ? 'text-rose-600' : 'text-[#002E6E]'}`}>
                            {p.stock}
                          </span>{' '}
                          <span className="text-[11px] text-slate-400 font-normal">{p.uom}</span>
                        </td>
                        <td className="p-3 text-center text-slate-500 text-xs font-normal">
                          {p.category === 'panel' || p.category === 'inverter' ? '10 Units' : `${p.minStockAlert} ${p.uom}`}
                        </td>
                        <td className="p-3">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Low Stock (&lt;10)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onOpenStockModal(p)}
                            className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-[#008AC5] hover:text-white bg-[#E8F8FE] hover:bg-[#00BAF2] border border-[#BCE8FC] rounded-lg transition-colors cursor-pointer"
                          >
                            Stock In/Out
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (Optimized for Field Technicians) */}
          <div className="sm:hidden space-y-3">
            {filteredProducts.map((p) => {
              const isLow =
                p.category === 'panel' || p.category === 'inverter'
                  ? p.stock < 10
                  : p.stock <= p.minStockAlert;

              return (
                <div key={p.id} className="bg-white rounded-xl border border-[#E1EBF5] p-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <ProductCategoryBadge category={p.category} />
                      <div>
                        <h4 className="font-semibold text-xs text-[#002E6E] leading-tight">{p.name}</h4>
                        <span className="text-[11px] font-mono text-slate-500">{p.sku}</span>
                      </div>
                    </div>
                    {isLow ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        In Stock
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">{p.spec}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Available</span>
                      <span className={`text-base font-semibold ${isLow ? 'text-rose-600' : 'text-[#002E6E]'}`}>
                        {p.stock} <span className="text-xs font-normal text-slate-500">{p.uom}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenStockModal(p)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Stock In/Out
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* STOCK MOVEMENTS TABLE */
        <div className="bg-white rounded-xl border border-[#E1EBF5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E1EBF5] text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  <th className="p-3">Movement #</th>
                  <th className="p-3">Date &amp; Time</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.map((m) => {
                  const isIn = m.type === 'IN' || m.type === 'RETURN';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-medium text-slate-700">{m.movementNumber}</td>
                      <td className="p-3 text-slate-500 font-normal">
                        {new Date(m.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3 font-medium text-[#002E6E]">{m.productName}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            isIn
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {isIn ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />}
                          <span className="uppercase">{m.type}</span>
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold text-[#002E6E]">
                        {isIn ? '+' : '-'}
                        {m.quantity}
                      </td>
                      <td className="p-3 text-slate-700 font-mono text-[11px]">
                        {m.referenceId || m.referenceType}
                      </td>
                      <td className="p-3 text-slate-500 font-normal">
                        {m.notes}
                      </td>
                      <td className="p-3 text-slate-600">{m.performedByName}</td>
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