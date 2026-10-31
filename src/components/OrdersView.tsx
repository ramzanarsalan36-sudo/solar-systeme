'use client';

import { soundManager } from '@/lib/sound';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Order, OrderStatus, UserRole } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import {
  PackageCheck,
  Search,
  CreditCard,
  CheckCircle2,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface OrdersViewProps {
  role: UserRole;
  onOpenPaymentModal: (order: Order) => void;
}

const ORDER_STAGES: { id: OrderStatus; label: string }[] = [
  { id: 'confirmed', label: '1. Confirmed Order' },
  { id: 'material_dispatched', label: '2. Material Dispatched' },
  { id: 'structure_erected', label: '3. Structure Erected' },
  { id: 'panels_mounted', label: '4. Panels Mounted' },
  { id: 'wired_tested', label: '5. Inverter & Wiring' },
  { id: 'net_meter_applied', label: '6. Net-Meter Inspection' },
  { id: 'commissioned', label: '7. Commissioned & Synchronized' },
];

export function OrdersView({ role, onOpenPaymentModal }: OrdersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const orders = crmStorage.getOrders();

  const filteredOrders = orders.filter((o) => {
    return (
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm)
    );
  });

  const handleUpdateStatus = (order: Order, newStatus: OrderStatus) => {
    const notes = prompt(`Optional field progress note for advancing to ${newStatus.replace('_', ' ')}:`);
    crmStorage.updateOrderStatus(order.id, newStatus, notes || undefined);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E1EBF5]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#00AC4F] flex items-center justify-center font-medium">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#002E6E] tracking-tight">
              Orders &amp; Payment Collections
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Turnkey solar projects &bull; Milestone stages &bull; Advance, dispatch &amp; commissioning payments
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer, Order #, or Quote #..."
          className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[#E1EBF5] bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:outline-hidden text-slate-800 placeholder:text-slate-400 transition-colors"
        />
      </div>

      {/* Orders List Cards */}
      <div className="space-y-3.5">
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const currentStageIndex = ORDER_STAGES.findIndex((s) => s.id === order.status);
          const paymentProgress = Math.round((order.totalPaid / (order.totalOrderValue || 1)) * 100);

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-[#E1EBF5] shadow-2xs overflow-hidden transition-all"
            >
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-[#E1EBF5]">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs font-medium text-[#008AC5] bg-[#E8F8FE] px-2 py-0.5 rounded border border-amber-200/80">
                      {order.systemKw} kW System
                    </span>
                    <span className="text-xs text-slate-400">Quote: {order.quoteNumber}</span>
                  </div>

                  <h3 className="font-semibold text-sm sm:text-base text-[#002E6E] leading-snug">{order.customerName}</h3>
                  <p className="text-xs text-slate-500">
                    {order.siteAddress} &bull; {order.customerPhone}
                  </p>
                  {order.assignedFieldEngineerName && (
                    <p className="text-[11px] text-emerald-800 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-[#00AC4F]" />
                      <span>Field Engineer: <strong>{order.assignedFieldEngineerName}</strong></span>
                    </p>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50/80 p-2.5 sm:p-3 rounded-lg border border-[#E1EBF5]/80 w-full lg:w-auto justify-between lg:justify-start">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Value</span>
                    <span className="font-semibold text-[#002E6E]">{formatIndianCurrency(order.totalOrderValue)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Paid ({paymentProgress}%)</span>
                    <span className="font-semibold text-[#008A3F]">{formatIndianCurrency(order.totalPaid)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Balance</span>
                    <span className={`font-semibold ${order.balanceDue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {formatIndianCurrency(order.balanceDue)}
                    </span>
                  </div>

                  {role !== 'store_field' && (
                    <button
                      onClick={() => { soundManager.playSoftClick(); onOpenPaymentModal(order); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00AC4F] hover:bg-[#009644] text-white shadow-xs transition-all active:scale-95 shadow-2xs cursor-pointer ml-auto sm:ml-0"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Milestone Bar */}
              <div className="px-4 sm:px-5 pb-3">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5 font-semibold text-[#002E6E]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00AC4F]" />
                    <span>Status: <span className="capitalize">{order.status.replace('_', ' ')}</span></span>
                  </span>

                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order, e.target.value as OrderStatus)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-[#E1EBF5] bg-white font-medium focus:border-amber-500 focus:outline-hidden"
                  >
                    {ORDER_STAGES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {ORDER_STAGES.map((st, idx) => {
                    const isDone = idx <= currentStageIndex;
                    return (
                      <div
                        key={st.id}
                        className={`h-1.5 rounded-full transition-colors ${
                          isDone ? 'bg-[#00BAF2]' : 'bg-slate-100'
                        }`}
                        title={st.label}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Expand Toggle */}
              <div className="px-4 sm:px-5 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="text-slate-600 hover:text-[#002E6E] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>{order.payments.length} Payments &bull; Notes</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <span className="text-[11px] text-slate-400">
                  Commissioning: {order.expectedCommissioningDate || 'Pending net-meter sync'}
                </span>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="p-4 sm:p-5 bg-slate-50/50 border-t border-[#E1EBF5] space-y-3 text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider mb-2">
                      Payment Receipts
                    </h4>
                    {order.payments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left bg-white rounded-lg border border-[#E1EBF5] text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase">
                              <th className="p-2">Receipt #</th>
                              <th className="p-2">Date</th>
                              <th className="p-2">Stage</th>
                              <th className="p-2">Mode</th>
                              <th className="p-2">UTR Ref</th>
                              <th className="p-2 text-right">Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {order.payments.map((p) => (
                              <tr key={p.id}>
                                <td className="p-2 font-mono font-medium text-slate-800">{p.receiptNumber}</td>
                                <td className="p-2 text-slate-500">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                                <td className="p-2 capitalize text-slate-700">{p.stage.replace('_', ' ')}</td>
                                <td className="p-2 font-medium uppercase text-slate-700">{p.method}</td>
                                <td className="p-2 font-mono text-[11px] text-slate-500">{p.referenceNumber}</td>
                                <td className="p-2 text-right font-semibold text-[#008A3F]">
                                  {formatIndianCurrency(p.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">No payments logged yet for this order.</p>
                    )}
                  </div>

                  {order.notes && (
                    <div className="pt-1">
                      <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider block mb-1">
                        Field Notes
                      </span>
                      <pre className="p-2.5 bg-white rounded-lg border border-[#E1EBF5] text-[11px] text-slate-600 whitespace-pre-wrap font-sans">
                        {order.notes}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-[#E1EBF5] text-slate-400 text-xs">
            No orders match search criteria.
          </div>
        )}
      </div>
    </div>
  );
}