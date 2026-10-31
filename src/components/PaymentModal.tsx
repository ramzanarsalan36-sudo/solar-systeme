'use client';

import React, { useState, useEffect } from 'react';
import { crmStorage } from '@/lib/storage';
import { Order, PaymentRecord } from '@/types/crm';
import { formatIndianCurrency } from '@/lib/solar-calc';
import { X, CreditCard, ArrowLeft } from 'lucide-react';

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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-md overflow-hidden my-6">
        {/* Standardized Modal Header with Back / Return Option */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Cancel & Return (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">(Esc)</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center font-medium shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight leading-snug">
                  Record Milestone Payment
                </h3>
                <p className="text-[11px] text-slate-500 font-normal">
                  Order: {order.orderNumber} &bull; {order.customerName}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Close (Esc)"
            aria-label="Close"
          >
            <span className="hidden sm:inline">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block">Total Order Value</span>
              <span className="font-semibold text-slate-900">{formatIndianCurrency(order.totalOrderValue)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Current Balance Due</span>
              <span className="font-bold text-amber-700">{formatIndianCurrency(order.balanceDue)}</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Milestone Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden bg-white text-slate-800"
            >
              <option value="advance_booking">Token Advance (20% Booking)</option>
              <option value="dispatch_panels">Dispatch Payment (60% Material)</option>
              <option value="final_commissioning">Commissioning &amp; Net-Metering (20%)</option>
              <option value="subsidy_disbursed">PM Surya Ghar Subsidy DBT Disbursed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                min="1000"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Mode</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden bg-white text-slate-800"
              >
                <option value="upi">UPI / QR Code</option>
                <option value="neft">NEFT / RTGS</option>
                <option value="cheque">Bank Cheque</option>
                <option value="cash">Cash Receipt</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Transaction Ref / UTR / Cheque No.</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UTR-HDFC-982348 or CHQ-002931"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received via customer HDFC Bank app. Net-metering application dispatched."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Standardized Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Cancel &amp; Return</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Record Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
