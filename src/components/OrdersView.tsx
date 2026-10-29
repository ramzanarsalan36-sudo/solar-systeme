'use client';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Order, OrderStatus, UserRole } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import {
  PackageCheck,
  Search,
  CreditCard,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  FileText,
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
    alert(`Order ${order.orderNumber} updated to ${newStatus}`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <span>Orders &amp; Payment Collections</span>
          </h1>
          <p className="text-xs text-slate-500">
            Installation milestone tracking &bull; Milestone payments (Advance, Dispatch, Commissioning) &bull; Field handover
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders by customer, Order #, or Quote #..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
          />
        </div>
      </div>

      {/* Orders List Cards */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const currentStageIndex = ORDER_STAGES.findIndex((s) => s.id === order.status);
          const paymentProgress = Math.round((order.totalPaid / (order.totalOrderValue || 1)) * 100);

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {order.systemKw} kW Rooftop System
                    </span>
                    <span className="text-xs text-slate-400">Ref: {order.quoteNumber}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{order.customerName}</h3>
                  <p className="text-xs text-slate-500">
                    {order.siteAddress} &bull; Phone: {order.customerPhone}
                  </p>
                  {order.assignedFieldEngineerName && (
                    <p className="text-[11px] text-emerald-800 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-emerald-600" />
                      Field Lead: <strong>{order.assignedFieldEngineerName}</strong>
                    </p>
                  )}
                </div>

                {/* Financial Summary Pill */}
                <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Value</span>
                    <span className="font-bold text-slate-900">{formatIndianCurrency(order.totalOrderValue)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Paid ({paymentProgress}%)</span>
                    <span className="font-bold text-emerald-700">{formatIndianCurrency(order.totalPaid)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Balance Due</span>
                    <span className={`font-bold ${order.balanceDue > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                      {formatIndianCurrency(order.balanceDue)}
                    </span>
                  </div>

                  {role !== 'store_field' && (
                    <button
                      onClick={() => onOpenPaymentModal(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0F172A] text-amber-400 hover:bg-slate-800 transition-colors shadow-xs border border-slate-700 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Milestone Progress Bar */}
              <div className="px-4 sm:px-5 pb-3">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Current Status: <span className="capitalize">{order.status.replace('_', ' ')}</span>
                  </span>

                  {/* Advance status selector for field/admin */}
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order, e.target.value as OrderStatus)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-amber-500"
                  >
                    {ORDER_STAGES.map((st) => (
                      <option key={st.id} value={st.id}>
                        Update to: {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Progress bar visual */}
                <div className="grid grid-cols-7 gap-1">
                  {ORDER_STAGES.map((st, idx) => {
                    const isDone = idx <= currentStageIndex;
                    return (
                      <div
                        key={st.id}
                        className={`h-2 rounded-full transition-colors ${
                          isDone ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                        title={st.label}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Expand Toggle for Payment History & Notes */}
              <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  <span>{order.payments.length} Payment Receipts &bull; Field Notes</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <span className="text-[11px] text-slate-400">
                  Target Commissioning: {order.expectedCommissioningDate || 'Pending final net-meter test'}
                </span>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="p-4 sm:p-5 bg-slate-50/50 border-t border-slate-200 space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">
                      Logged Milestone Payment Receipts
                    </h4>
                    {order.payments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left bg-white rounded-lg border border-slate-200 text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600">
                              <th className="p-2">Receipt #</th>
                              <th className="p-2">Date</th>
                              <th className="p-2">Milestone Stage</th>
                              <th className="p-2">Mode</th>
                              <th className="p-2">Txn / UTR Ref</th>
                              <th className="p-2 text-right">Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {order.payments.map((p) => (
                              <tr key={p.id}>
                                <td className="p-2 font-mono font-bold">{p.receiptNumber}</td>
                                <td className="p-2">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                                <td className="p-2 capitalize">{p.stage.replace('_', ' ')}</td>
                                <td className="p-2 font-semibold uppercase">{p.method}</td>
                                <td className="p-2 font-mono text-[11px] text-slate-600">{p.referenceNumber}</td>
                                <td className="p-2 text-right font-bold text-emerald-700">
                                  {formatIndianCurrency(p.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No payments logged yet for this order.</p>
                    )}
                  </div>

                  {order.notes && (
                    <div className="pt-2">
                      <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-1">
                        Operational &amp; Field Notes
                      </span>
                      <pre className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700 whitespace-pre-wrap font-sans">
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
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            No orders found matching search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
