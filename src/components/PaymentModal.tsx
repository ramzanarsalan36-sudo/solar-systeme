'use client';

import React, { useState } from 'react';
import { crmStorage } from '@/lib/storage';
import { Order, PaymentRecord } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onPaymentLogged: () => void;
}

export function PaymentModal({ isOpen, onClose, order, onPaymentLogged }: PaymentModalProps) {
  const [amount, setAmount] = useState<number>(order ? Math.min(order.balanceDue, Math.round(order.totalOrderValue * 0.2)) : 50000);
  const [method, setMethod] = useState<PaymentRecord['method']>('upi');
  const [stage, setStage] = useState<PaymentRecord['stage']>('advance_booking');
  const [referenceNumber, setReferenceNumber] = useState<string>('UPI/');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Payment amount must be greater than zero');
      return;
    }
    if (amount > order.balanceDue) {
      if (!confirm(`Amount ₹${amount.toLocaleString('en-IN')} exceeds current balance due ₹${order.balanceDue.toLocaleString('en-IN')}. Proceed anyway?`)) {
        return;
      }
    }

    const currentUser = crmStorage.getCurrentUser();
    crmStorage.recordPayment(order.id, {
      amount: Number(amount),
      date: new Date().toISOString(),
      method,
      referenceNumber: referenceNumber || 'REF-TBD',
      stage,
      status: 'verified',
      notes,
      recordedBy: currentUser.id,
      recordedByName: currentUser.name,
    });

    onPaymentLogged();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-6">
        <div className="px-5 py-3.5 bg-[#10233F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F4B740] text-[#10233F] flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Record Milestone Payment</h3>
              <p className="text-[10px] text-slate-300">Order Ref: {order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-[#1b355d]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex justify-between font-semibold text-slate-900">
              <span>{order.customerName}</span>
              <span className="text-amber-800">{order.systemKw} kW System</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Total Project Value:</span>
              <span>{formatIndianCurrency(order.totalOrderValue)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Already Paid:</span>
              <span className="text-emerald-700 font-semibold">{formatIndianCurrency(order.totalPaid)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-xs">
              <span>Remaining Balance Due:</span>
              <span className="text-rose-700">{formatIndianCurrency(order.balanceDue)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Mode</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="upi">UPI (GPay/PhonePe/Paytm)</option>
                <option value="neft">NEFT Bank Transfer</option>
                <option value="rtgs">RTGS</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash Receipt</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Project Milestone Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="advance_booking">Token Advance (20%)</option>
                <option value="material_dispatch">Material Dispatch (60%)</option>
                <option value="structure_completion">Structure / Mounting</option>
                <option value="final_commissioning">Commissioning (20%)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Txn / UTR / Reference No. *</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. UTR / UPI Ref ID"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Notes / Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received in HDFC Current A/c"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-bold text-[#10233F] bg-[#F4B740] hover:bg-[#D99B26] rounded-lg shadow-xs"
            >
              Issue Payment Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
