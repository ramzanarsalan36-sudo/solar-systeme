'use client';

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
  Boxes,
  FileSpreadsheet,
} from 'lucide-react';

interface InventoryViewProps {
  role: UserRole;
  onOpenStockModal: (product?: Product) => void;
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-amber-600" />
            <span>Stock &amp; Inventory Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time balance derived from authorized movements &bull; Low-stock alerts &bull; Immutable movement ledger
          </p>
        </div>

        <button
          onClick={() => onOpenStockModal()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#10233F] hover:bg-[#1b355d] text-white transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-[#F4B740]" />
          <span>Record Stock In / Out</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('balance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'balance'
                ? 'bg-[#10233F] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Live Stock Balances
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'movements'
                ? 'bg-[#10233F] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Movement History Ledger ({movements.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by SKU, product name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
          />
        </div>
      </div>

      {/* Content depending on active tab */}
      {activeTab === 'balance' ? (
        /* LIVE STOCK TABLE */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name &amp; Technical Spec</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Available Stock</th>
                  <th className="p-3 text-center">Min Threshold</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isLow = (p.category === 'panel' || p.category === 'inverter') ? p.stock < 10 : p.stock <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 align-middle font-mono font-bold text-slate-900">{p.sku}</td>
                      <td className="p-3.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          {p.imageUrl && (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{p.brand} &bull; {p.spec}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 align-middle">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3.5 align-middle text-center">
                        <span className={`text-sm font-extrabold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                          {p.stock}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500">{p.uom}</span>
                      </td>
                      <td className="p-3.5 align-middle text-center text-slate-500 font-medium">
                        {(p.category === 'panel' || p.category === 'inverter') ? '10 Units' : `${p.minStockAlert} ${p.uom}`}
                      </td>
                      <td className="p-3.5 align-middle">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Low Stock (&lt;10 Units)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 align-middle text-right">
                        <button
                          onClick={() => onOpenStockModal(p)}
                          className="px-3 py-1.5 text-xs font-bold bg-[#0A1128] hover:bg-[#15234A] text-amber-400 rounded-lg transition-colors cursor-pointer"
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
      ) : (
        /* IMMUTABLE MOVEMENT HISTORY LEDGER */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3">Movement Ref</th>
                  <th className="p-3">Date &amp; Time</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-center">Prev &rarr; New Stock</th>
                  <th className="p-3">Ref Document</th>
                  <th className="p-3">Performed By</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{m.movementNumber}</td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(m.timestamp).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{m.productName}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.type === 'IN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.type === 'OUT'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.type === 'IN' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />}
                        {m.type}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900">{m.quantity}</td>
                    <td className="p-3 text-center text-slate-600 font-mono text-[11px]">
                      {m.previousStock} &rarr; <strong className="text-slate-900">{m.newStock}</strong>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">
                      {m.referenceId || m.referenceType}
                    </td>
                    <td className="p-3 text-slate-700">{m.performedByName}</td>
                    <td className="p-3 text-slate-500 text-[11px] max-w-xs truncate" title={m.notes}>
                      {m.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
